require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const { getDb } = require('./database/db.cjs');
const schema = require('./database/schema.cjs');
const { eq, inArray, isNull, or } = require('drizzle-orm');
const fs = require('fs');
const path = require('path');
const { app, BrowserWindow } = require('electron');

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// The worker runs in Electron's main process, so it does not share the
// renderer's Supabase session automatically.  Without this session every
// request is made as `anon` and is correctly rejected by RLS.
let hasAuthenticatedSession = false;
let didLogMissingSession = false;

async function setSyncSession(session) {
  if (!session?.accessToken || !session?.refreshToken) {
    // Null/empty session = user signed out. Clear worker auth.
    hasAuthenticatedSession = false;
    return false;
  }

  const tokenPrefix = session.accessToken.substring(0, 12);
  logSync(`Attempting setSession with token prefix: ${tokenPrefix}...`);

  const { error } = await supabase.auth.setSession({
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
  });
  if (error) {
    // A renderer can retain an expired session in localStorage. Log the
    // rejection but do NOT call signOut() — a valid token may arrive
    // moments later from an onAuthStateChange race.
    hasAuthenticatedSession = false;
    didLogMissingSession = false;
    logSync(`Rejected invalid Supabase session: ${error.message}`);
    return false;
  }

  // Verify the token is actually usable against Supabase's API.
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    hasAuthenticatedSession = false;
    didLogMissingSession = false;
    logSync(`Session set but getUser() failed: ${userError?.message || 'no user returned'}`);
    return false;
  }

  hasAuthenticatedSession = true;
  didLogMissingSession = false;
  logSync(`Authenticated Supabase session received for user ${userData.user.email || userData.user.id}. Processing queued changes.`);

  // When the worker first authenticates (or re-authenticates after a schema
  // fix), give every failed queue item a fresh chance by resetting retries.
  try {
    const db = getDb();
    await db.update(schema.syncQueue)
      .set({ status: 'pending', retry_count: 0 })
      .where(eq(schema.syncQueue.status, 'failed'))
      .execute();
    lastAttemptMap.clear();
  } catch (resetErr) {
    logSync(`Warning: could not reset failed queue items: ${resetErr.message}`);
  }

  return true;
}

const LOCAL_TO_SUPABASE = {
  dining_tables: 'tables',
};

// Records created before the queue was introduced remain in SQLite with a
// pending (or absent, for older databases) sync status.  Materialize those
// records into the normal queue once an authenticated worker is available.
// Subsequent changes continue to use the regular queue as before.
const LOCAL_SYNC_TABLES = {
  categories: schema.categories,
  products: schema.products,
  inventory_items: schema.inventoryItems,
  stock_movements: schema.stockMovements,
  dining_tables: schema.diningTables,
  orders: schema.orders,
  order_items: schema.orderItems,
  suppliers: schema.suppliers,
  purchases: schema.purchases,
  purchase_items: schema.purchaseItems,
  supplier_payments: schema.supplierPayments,
  expenses: schema.expenses,
  daily_closings: schema.dailyClosings,
  daily_closing_items: schema.dailyClosingItems,
  settings: schema.settings,
  order_audit_log: schema.orderAuditLog,
};

async function materializePendingLocalRecords(db) {
  const existing = await db.select({ id: schema.syncQueue.id })
    .from(schema.syncQueue)
    .where(inArray(schema.syncQueue.status, ['pending', 'failed', 'syncing']))
    .execute();
  if (existing.length > 0) return 0;

  const operations = [];
  for (const [tableName, table] of Object.entries(LOCAL_SYNC_TABLES)) {
    const records = await db.select()
      .from(table)
      .where(or(eq(table.sync_status, 'pending'), isNull(table.sync_status)))
      .execute();

    for (const record of records) {
      operations.push({
        id: require('crypto').randomUUID(),
        action: 'insert',
        table_name: tableName,
        payload: JSON.stringify(record),
        status: 'pending',
        retry_count: 0,
        created_at: new Date().toISOString(),
        record_id: record.id,
      });
    }
  }

  if (operations.length > 0) {
    await db.insert(schema.syncQueue).values(operations).execute();
    logSync(`Queued ${operations.length} existing local record(s) for cloud recovery.`);
  }
  return operations.length;
}

function toSupabaseName(localName) {
  return LOCAL_TO_SUPABASE[localName] ?? localName;
}

// SQLite and the cloud schema evolved independently for a short period. Keep
// this adapter in the worker so records already persisted in the offline queue
// can be repaired as well as newly created records.
function toSupabasePayload(tableName, payload) {
  const normalized = { ...payload };

  if (tableName === 'expenses') {
    normalized.expense_date ??= normalized.date;
    delete normalized.date;
  }

  if (tableName === 'purchases') {
    normalized.amount_remaining ??= Math.max(
      0,
      Number(normalized.total_amount || 0) - Number(normalized.amount_paid || 0)
    );
  }

  if (tableName === 'order_audit_log') {
    // Older deployed databases use action_type, while the local model uses
    // action. The migration keeps both columns available during the upgrade.
    normalized.action_type ??= normalized.action;

    // The deployed audit table also stores the initiating user separately.
    // Local records keep it inside the JSON `details` field, so unpack it for
    // both newly queued and legacy failed records.
    if (normalized.details) {
      try {
        const details = typeof normalized.details === 'string'
          ? JSON.parse(normalized.details)
          : normalized.details;
        normalized.initiated_by_user_id ??= details?.initiated_by_user_id;
        normalized.initiated_by_name ??= details?.initiated_by_name;
        normalized.order_total ??= details?.order_total;
        normalized.approved_by_owner_pin ??= details?.approved_by_owner_pin;
      } catch {
        // The database will retain the item with a useful error if details is malformed.
      }
    }
    normalized.initiated_by_name ??= normalized.performed_by;
  }

  return normalized;
}

function getTablePriority(item) {
  const tablePriority = {
    app_users: 0,
    categories: 1,
    inventory_items: 1,
    suppliers: 1,
    tables: 1,
    dining_tables: 1,
    products: 2,
    orders: 2,
    purchases: 2,
    settings: 2,
    order_items: 3,
    purchase_items: 3,
    supplier_payments: 3,
    stock_movements: 3,
    daily_closing_items: 3,
    order_audit_log: 3,
  };

  // A table can reference its current order. Process that update only after
  // the order exists in Supabase, preventing a transient foreign-key failure.
  if ((item.table_name === 'tables' || item.table_name === 'dining_tables') && item.action !== 'delete') {
    try {
      const payload = typeof item.payload === 'string' ? JSON.parse(item.payload) : item.payload;
      if (payload?.current_order_id) return 3;
    } catch {
      // Let normal processing record malformed queue items as failures.
    }
  }

  return tablePriority[item.table_name] ?? 2;
}

// ----------------------------------------------------
// Persistent Sync Logger
// ----------------------------------------------------
function logSync(message) {
  try {
    const logDir = path.join(app.getPath('documents'), 'OPA Cafe', 'Logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const logFile = path.join(logDir, 'sync.log');
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(logFile, formattedMessage);
    console.log(`[SyncWorker] ${message}`);
  } catch (err) {
    console.error('Failed to write to sync log:', err);
  }
}

// ----------------------------------------------------
// Sync State
// ----------------------------------------------------
let isSyncing = false;
let syncStatusState = {
  pending: 0,
  synced: 0,
  failed: 0,
  lastSync: null,
  isSyncing: false
};
const lastAttemptMap = new Map();

function broadcastStatus() {
  try {
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(win => {
      win.webContents.send('sync:status', syncStatusState);
    });
  } catch (e) {
    // Ignore errors
  }
}

async function updateCounts(db) {
   const pendingItems = await db.select().from(schema.syncQueue).where(eq(schema.syncQueue.status, 'pending')).execute();
   const failedItems = await db.select().from(schema.syncQueue).where(eq(schema.syncQueue.status, 'failed')).execute();
   syncStatusState.pending = pendingItems.length;
   syncStatusState.failed = failedItems.length;
   broadcastStatus();
}

async function processSyncQueue() {
  if (isSyncing) return;
  if (!supabaseUrl || !supabaseAnonKey) {
    logSync('Supabase credentials not found. Skipping sync.');
    return;
  }
  if (!hasAuthenticatedSession) {
    if (!didLogMissingSession) {
      logSync('No authenticated Supabase session. Queue preserved until an online user signs in.');
      didLogMissingSession = true;
    }
    return;
  }
  
  isSyncing = true;
  syncStatusState.isSyncing = true;
  broadcastStatus();

  const db = getDb();
  
  try {
    let pendingItems = await db.select()
      .from(schema.syncQueue)
      .where(inArray(schema.syncQueue.status, ['pending', 'failed']))
      .execute();

    // A queue can be empty even when this device contains historical records
    // that were saved before queue writes existed. Add those records here,
    // after authentication, so they use the same RLS-protected upload path.
    if (pendingItems.length === 0) {
      await materializePendingLocalRecords(db);
      pendingItems = await db.select()
        .from(schema.syncQueue)
        .where(inArray(schema.syncQueue.status, ['pending', 'failed']))
        .execute();
    }
      
    // Insert parents before dependants. This also lets old failed work recover
    // after its missing parent record has been uploaded.
    pendingItems.sort((a, b) =>
      getTablePriority(a) - getTablePriority(b) ||
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    if (pendingItems.length === 0) {
      isSyncing = false;
      syncStatusState.isSyncing = false;
      await updateCounts(db);
      return;
    }
    
    for (const item of pendingItems) {
      if (!item.id) continue;
      
      // Retry Backoff Logic:
      // Attempt 1: 5s, Attempt 2: 30s, Attempt 3: 5m (300000ms), Attempt 4: 30m (1800000ms)
      if (item.status === 'failed') {
        const delays = [0, 5000, 30000, 300000, 1800000];
        const delay = item.retry_count < delays.length ? delays[item.retry_count] : 1800000;
        const lastAttempt = lastAttemptMap.get(item.id) || 0;
        if (Date.now() - lastAttempt < delay) {
          continue; // Skip this iteration until delay passes
        }
      }
      
      lastAttemptMap.set(item.id, Date.now());
      
      try {
        await db.update(schema.syncQueue).set({ status: 'syncing' }).where(eq(schema.syncQueue.id, item.id)).execute();
        
        const supabaseTable = toSupabaseName(item.table_name);
        const queuedPayload = typeof item.payload === 'string' ? JSON.parse(item.payload) : item.payload;
        const payload = toSupabasePayload(supabaseTable, queuedPayload);
        
        let conflictDetected = false;
        let remoteData = null;
        let resolution = 'local_wins';

        // Conflict Detection
        if (item.action === 'update' || item.action === 'delete') {
          const { data } = await supabase.from(supabaseTable).select('*').eq('id', payload.id).single();
          if (data) {
            remoteData = data;
            const remoteDate = new Date(remoteData.updated_at || remoteData.created_at || 0).getTime();
            const localDate = new Date(payload.updated_at || payload.created_at || 0).getTime();
            
            if (remoteDate > localDate && remoteData.device_id !== payload.device_id) {
              conflictDetected = true;
              resolution = 'local_wins';
            }
          }
        }

        if (conflictDetected && remoteData) {
          await db.insert(schema.syncConflicts).values({
            id: require('crypto').randomUUID(),
            entity_name: supabaseTable,
            entity_id: payload.id,
            local_version: payload.version || 1,
            remote_version: remoteData.version || 1,
            resolution: resolution,
            created_at: new Date().toISOString()
          }).execute();
          logSync(`Conflict detected and resolved for ${supabaseTable} ID ${payload.id}. Resolution: ${resolution}`);
        }
        
        if (item.action === 'insert') {
          const { error } = await supabase.from(supabaseTable).upsert(payload, { onConflict: 'id' });
          if (error) throw error;
        } else if (item.action === 'update') {
          if (resolution === 'local_wins' || !conflictDetected) {
            const { id, ...updatePayload } = payload;
            const { error } = await supabase.from(supabaseTable).update(updatePayload).eq('id', payload.id);
            if (error) throw error;
          }
        } else if (item.action === 'delete') {
          if (resolution === 'local_wins' || !conflictDetected) {
            const { error } = await supabase.from(supabaseTable).delete().eq('id', payload.id);
            if (error) throw error;
          }
        }
        
        await db.delete(schema.syncQueue).where(eq(schema.syncQueue.id, item.id)).execute();
        const localTable = LOCAL_SYNC_TABLES[item.table_name];
        if (localTable && payload.id) {
          await db.update(localTable)
            .set({ sync_status: 'synced' })
            .where(eq(localTable.id, payload.id))
            .execute();
        }
        lastAttemptMap.delete(item.id);
        syncStatusState.synced += 1;
        logSync(`Successfully synced item: ${item.action} on ${supabaseTable} (ID: ${payload.id || 'unknown'})`);
      } catch (err) {
        logSync(`Failed syncing ${item.action} on ${item.table_name} # ${item.record_id || 'unknown'}: ${err.message}`);

        const nextRetry = item.retry_count + 1;
        await db.update(schema.syncQueue).set({ 
             status: 'failed',
             retry_count: nextRetry,
             last_error: err.message
        }).where(eq(schema.syncQueue.id, item.id)).execute();
        
        if (nextRetry > 4) {
           logSync(`Max retries reached for item ${item.id}. Keeping in queue as failed.`);
        }
      }
    }
    syncStatusState.lastSync = new Date().toISOString();
  } catch (err) {
    logSync(`Error processing queue: ${err.message}`);
  } finally {
    isSyncing = false;
    syncStatusState.isSyncing = false;
    await updateCounts(getDb());
  }
}

function startSyncWorker() {
  processSyncQueue();
  setInterval(processSyncQueue, 10000);
}

function getSyncStatus() {
  return syncStatusState;
}

async function resetSyncState() {
  logSync('Resetting all sync state — clearing queue and marking all local records as pending.');
  const db = getDb();

  // 1. Clear the entire sync queue
  await db.delete(schema.syncQueue).execute();
  lastAttemptMap.clear();

  // 2. Reset sync_status on every local table back to 'pending'
  for (const [tableName, table] of Object.entries(LOCAL_SYNC_TABLES)) {
    try {
      await db.update(table).set({ sync_status: 'pending' }).execute();
    } catch (e) {
      logSync(`Warning: could not reset sync_status on ${tableName}: ${e.message}`);
    }
  }

  // 3. Re-materialize all records into the queue
  const count = await materializePendingLocalRecords(db);
  logSync(`Sync state reset complete. ${count} record(s) queued for upload.`);

  syncStatusState.synced = 0;
  syncStatusState.failed = 0;
  await updateCounts(db);
  return count;
}

module.exports = { startSyncWorker, processSyncQueue, getSyncStatus, setSyncSession, resetSyncState };
