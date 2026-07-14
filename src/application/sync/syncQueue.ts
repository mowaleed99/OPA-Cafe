import { db, type SyncQueueItem } from '../../infrastructure/database/db';
import { supabase } from '../../infrastructure/api/supabase';
import type { Table } from 'dexie';

// ── Name bridge: local Dexie name → Supabase table name ───────────────────
// Dexie uses 'dining_tables'; Supabase schema uses 'tables'.
// All other table names are identical on both sides.
const LOCAL_TO_SUPABASE: Record<string, string> = {
  dining_tables: 'tables',
};

function toSupabaseName(localName: string): string {
  return LOCAL_TO_SUPABASE[localName] ?? localName;
}

import { createRepository } from '../../infrastructure/repositories/RepositoryFactory';

function getDeviceId(): string {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}

export function buildSyncOperation(
  action: 'insert' | 'update' | 'delete',
  table: string,
  payload: Record<string, unknown>
): { type: 'insert'; table: 'sync_queue'; data: SyncQueueItem } {
  let finalAction = action;
  let finalPayload = { ...payload };
  
  finalPayload.updated_at = new Date().toISOString();
  finalPayload.device_id = getDeviceId();
  finalPayload.version = (typeof payload.version === 'number' ? payload.version : 0) + 1;
  
  const offlineUserId = localStorage.getItem('offline_user_id');
  if (offlineUserId) {
    finalPayload.last_modified_by = offlineUserId;
  }

  if (action === 'delete') {
    finalAction = 'update';
    finalPayload.deleted_at = new Date().toISOString();
  }

  return {
    type: 'insert',
    table: 'sync_queue',
    data: {
      id: crypto.randomUUID(),
      action: finalAction,
      table_name: table,
      payload: JSON.stringify(finalPayload),
      created_at: new Date().toISOString(),
      status: 'pending',
      retry_count: 0,
      record_id: typeof finalPayload.id === 'string' ? finalPayload.id : undefined,
    }
  };
}

// ── Enqueue ────────────────────────────────────────────────────────────────
// Writes to SQLite first, then adds the action to the queue.
export async function enqueueSync(
  action: 'insert' | 'update' | 'delete',
  table: string,
  payload: Record<string, unknown>
): Promise<void> {
  const repo = createRepository<SyncQueueItem>('sync_queue');
  const syncOp = buildSyncOperation(action, table, payload);
  await repo.insert(syncOp.data);

  if (navigator.onLine) {
    if (window.electronAPI) {
      window.electronAPI.triggerSync();
    } else {
      setTimeout(() => {
        processSyncQueue().catch(console.error);
      }, 100);
    }
  }
}

// ── Process queue (Web Fallback) ──────────────────────────────────────────
export async function processSyncQueue(): Promise<void> {
  // Desktop app uses Electron background worker, web uses this fallback
  if (window.electronAPI) {
    window.electronAPI.triggerSync();
    return;
  }
  
  // (Web version logic omitted for simplicity since this is Desktop-first)
  // If we needed Dexie fallback, it would go here.
}

// ── Realtime sync (cloud → local) ─────────────────────────────────────────
// Subscribes to Supabase Realtime and mirrors remote changes into Dexie.
// Only call once on app start after the user is authenticated.
const SYNCED_TABLES = [
  'categories',
  'products',
  'inventory_items',
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
  'stock_movements',
  'order_audit_log',
] as const;

type SyncedTable = typeof SYNCED_TABLES[number];

// ── Name bridge: Supabase table name → Dexie table name ──────────────────
// Supabase uses 'tables'; Dexie uses 'dining_tables'.
const SUPABASE_TO_DEXIE: Partial<Record<SyncedTable, string>> = {
  tables: 'dining_tables',
};

// Map Supabase table name → Dexie table
const dexieTable = (tableName: SyncedTable) => {
  const dexieName = SUPABASE_TO_DEXIE[tableName] ?? tableName;
  return (db as unknown as Record<string, Table<unknown, unknown>>)[dexieName];
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
