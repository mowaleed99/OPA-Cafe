require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const { getDb } = require('./database/db.cjs');
const schema = require('./database/schema.cjs');
const { eq, inArray } = require('drizzle-orm');

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LOCAL_TO_SUPABASE = {
  dining_tables: 'tables',
};

function toSupabaseName(localName) {
  return LOCAL_TO_SUPABASE[localName] ?? localName;
}

let isSyncing = false;

async function processSyncQueue() {
  if (isSyncing) return;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[SyncWorker] Supabase credentials not found. Skipping sync.');
    return;
  }
  
  isSyncing = true;
  const db = getDb();
  
  try {
    const pendingItems = await db.select()
      .from(schema.syncQueue)
      .where(inArray(schema.syncQueue.status, ['pending', 'failed', 'syncing']))
      .execute();
      
    // Sort by created_at ascending
    pendingItems.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    if (pendingItems.length === 0) {
      isSyncing = false;
      return;
    }
    
    for (const item of pendingItems) {
      if (!item.id) continue;
      
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
            
            // If remote was updated more recently AND from a different device
            if (remoteDate > localDate && remoteData.device_id !== payload.device_id) {
              conflictDetected = true;
              resolution = 'local_wins'; // As a desktop POS, local SQLite is the primary source of truth
            }
          }
        }

        if (conflictDetected && remoteData) {
          // Log conflict
          await db.insert(schema.syncConflicts).values({
            id: require('crypto').randomUUID(),
            table_name: supabaseTable,
            record_id: payload.id,
            local_data: JSON.stringify(payload),
            remote_data: JSON.stringify(remoteData),
            resolved: true,
            resolution: resolution,
            created_at: new Date().toISOString()
          }).execute();
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
      } catch (err) {
        console.error(`[SyncWorker] Failed to sync item ${item.id}:`, err);
        const nextRetry = item.retry_count + 1;
        // Exponential backoff or max retries could be handled here
        if (nextRetry > 5) {
           await db.delete(schema.syncQueue).where(eq(schema.syncQueue.id, item.id)).execute();
           console.error(`[SyncWorker] Max retries reached for item ${item.id}. Dropping from queue.`);
        } else {
           await db.update(schema.syncQueue).set({ 
             status: 'failed',
             retry_count: nextRetry
           }).where(eq(schema.syncQueue.id, item.id)).execute();
        }
      }
    }
  } catch (err) {
    console.error('[SyncWorker] Error processing queue:', err);
  } finally {
    isSyncing = false;
  }
}

function startSyncWorker() {
  processSyncQueue();
  setInterval(processSyncQueue, 10000);
}

module.exports = { startSyncWorker, processSyncQueue };
