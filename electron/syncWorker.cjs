require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const { getDb } = require('./database/db.cjs');
const schema = require('./database/schema.cjs');
const { eq, inArray } = require('drizzle-orm');
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

async function setSyncSession(session) {
  if (!session?.accessToken || !session?.refreshToken) {
    await supabase.auth.signOut();
    hasAuthenticatedSession = false;
    return;
  }

  const { error } = await supabase.auth.setSession({
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
  });
  if (error) throw error;
  hasAuthenticatedSession = true;
}

const LOCAL_TO_SUPABASE = {
  dining_tables: 'tables',
};

function toSupabaseName(localName) {
  return LOCAL_TO_SUPABASE[localName] ?? localName;
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
    logSync('No authenticated Supabase session. Queue preserved until an online user signs in.');
    return;
  }
  
  isSyncing = true;
  syncStatusState.isSyncing = true;
  broadcastStatus();

  const db = getDb();
  
  try {
    const pendingItems = await db.select()
      .from(schema.syncQueue)
      .where(inArray(schema.syncQueue.status, ['pending', 'failed']))
      .execute();
      
    // Insert parents before dependants. This also lets old failed work recover
    // after its missing parent record has been uploaded.
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
    pendingItems.sort((a, b) =>
      (tablePriority[a.table_name] ?? 2) - (tablePriority[b.table_name] ?? 2) ||
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
        const payload = typeof item.payload === 'string' ? JSON.parse(item.payload) : item.payload;
        
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

module.exports = { startSyncWorker, processSyncQueue, getSyncStatus, setSyncSession };
