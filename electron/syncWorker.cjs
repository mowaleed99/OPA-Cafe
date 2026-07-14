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
        
        const supabaseTable = toSupabaseName(item.table);
        const payload = item.payload; // Since payload is JSON
        
        if (item.action === 'insert') {
          const { error } = await supabase.from(supabaseTable).upsert(payload, { onConflict: 'id' });
          if (error) throw error;
        } else if (item.action === 'update') {
          const { id, ...updatePayload } = payload;
          const { error } = await supabase.from(supabaseTable).update(updatePayload).eq('id', payload.id);
          if (error) throw error;
        } else if (item.action === 'delete') {
          const { error } = await supabase.from(supabaseTable).delete().eq('id', payload.id);
          if (error) throw error;
        }
        
        await db.delete(schema.syncQueue).where(eq(schema.syncQueue.id, item.id)).execute();
      } catch (err) {
        console.error(`[SyncWorker] Failed to sync item ${item.id}:`, err);
        await db.update(schema.syncQueue).set({ 
          status: 'failed',
          retry_count: item.retry_count + 1
        }).where(eq(schema.syncQueue.id, item.id)).execute();
      }
    }
  } catch (err) {
    console.error('[SyncWorker] Error processing queue:', err);
  } finally {
    isSyncing = false;
  }
}

function startSyncWorker() {
  // Run once on startup
  processSyncQueue();
  // Check every 10 seconds
  setInterval(processSyncQueue, 10000);
}

module.exports = { startSyncWorker, processSyncQueue };
