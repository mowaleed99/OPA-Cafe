import { db, type SyncQueueItem } from '../../infrastructure/database/db';
import { supabase } from '../../infrastructure/api/supabase';
import type { Table } from 'dexie';

// ── Enqueue ────────────────────────────────────────────────────────────────
// Writes go to Dexie FIRST, then this adds the action to the queue.
// If online, it flushes the queue immediately.
export async function enqueueSync(
  action: SyncQueueItem['action'],
  table: string,
  payload: Record<string, unknown>
): Promise<void> {
  await db.sync_queue.add({
    action,
    table,
    payload,
    created_at: new Date().toISOString(),
    status: 'pending',
    retry_count: 0,
  });

  if (navigator.onLine) {
    processSyncQueue();
  }
}

// ── Process queue ──────────────────────────────────────────────────────────
// Flushes all pending items in order. Called on app start and on reconnect.
export async function processSyncQueue(): Promise<void> {
  if (!navigator.onLine) return;

  const pendingItems = await db.sync_queue
    .where('status')
    .equals('pending')
    .sortBy('created_at');

  if (pendingItems.length === 0) return;

  for (const item of pendingItems) {
    if (item.id == null) continue;

    try {
      await db.sync_queue.update(item.id, { status: 'syncing' });

      if (item.action === 'insert') {
        const { error } = await supabase.from(item.table).insert(item.payload);
        if (error) throw error;
      } else if (item.action === 'update') {
        const { error } = await supabase
          .from(item.table)
          .update(item.payload)
          .eq('id', item.payload['id'] as string);
        if (error) throw error;
      } else if (item.action === 'delete') {
        const { error } = await supabase
          .from(item.table)
          .delete()
          .eq('id', item.payload['id'] as string);
        if (error) throw error;
      }

      await db.sync_queue.delete(item.id);
    } catch (err) {
      console.error('[SyncQueue] Failed to sync item:', item, err);
      await db.sync_queue.update(item.id, {
        status: 'failed',
        retry_count: item.retry_count + 1,
      });
    }
  }
}

// ── Realtime sync (cloud → local) ─────────────────────────────────────────
// Subscribes to Supabase Realtime and mirrors remote changes into Dexie.
// Only call once on app start after the user is authenticated.
const SYNCED_TABLES = [
  'categories',
  'products',
  'tables',
  'orders',
  'order_items',
  'suppliers',
  'purchases',
  'purchase_items',
  'supplier_payments',
  'daily_closings',
  'daily_closing_items',
  'settings',
] as const;

type SyncedTable = typeof SYNCED_TABLES[number];

// Map Supabase table name → Dexie table
const dexieTable = (tableName: SyncedTable) => {
  // All table names match exactly except 'app_users' which maps to db.app_users
  return (db as unknown as Record<string, Table<unknown, unknown>>)[tableName];
};

let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

export function startRealtimeSync(cafeId: string): void {
  if (realtimeChannel) {
    realtimeChannel.unsubscribe();
  }

  realtimeChannel = supabase.channel(`cafe-${cafeId}`);

  for (const tableName of SYNCED_TABLES) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (realtimeChannel as any).on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: tableName,
        filter: `cafe_id=eq.${cafeId}`,
      },
      async (payload: { eventType: string; new: Record<string, unknown>; old: { id: string } }) => {
        const localTable = dexieTable(tableName as SyncedTable);
        if (!localTable) return;

        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          await localTable.put(payload.new);
        } else if (payload.eventType === 'DELETE') {
          await localTable.delete(payload.old.id);
        }
      }
    );
  }

  realtimeChannel.subscribe();
}

export function stopRealtimeSync(): void {
  if (realtimeChannel) {
    realtimeChannel.unsubscribe();
    realtimeChannel = null;
  }
}

// ── Connectivity listeners ─────────────────────────────────────────────────
// Automatically flush the queue when the device comes back online.
window.addEventListener('online', () => {
  console.log('[SyncQueue] Back online — flushing queue');
  processSyncQueue();
});
