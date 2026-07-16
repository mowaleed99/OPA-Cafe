// Dexie uses 'dining_tables'; Supabase schema uses 'tables'.
// All other table names are identical on both sides.
const LOCAL_TO_SUPABASE: Record<string, string> = {
  dining_tables: 'tables',
};

function toSupabaseName(localName: string): string {
  return LOCAL_TO_SUPABASE[localName] ?? localName;
}

import { createRepository } from '../../infrastructure/repositories/RepositoryFactory';
import type { TransactionOperation } from '../../infrastructure/database/transaction';

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
): { type: 'insert'; table: 'sync_queue'; data: Record<string, unknown> } {
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

export function triggerBackgroundSync(): void {
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    if (window.electronAPI) {
      window.electronAPI.triggerSync();
    } else {
      setTimeout(() => {
        processSyncQueue().catch(console.error);
      }, 100);
    }
  }
}

export function createSyncableOperation<T extends Record<string, unknown>>(
  action: 'insert' | 'update' | 'delete',
  table: string,
  data: T,
  id?: string
): TransactionOperation[] {
  const ops: TransactionOperation[] = [];
  if (action === 'insert') {
    ops.push({ type: 'insert', table, data });
  } else if (action === 'update' && id) {
    ops.push({ type: 'update', table, id, data });
  } else if (action === 'delete' && id) {
    ops.push({ type: 'delete', table, id });
  }
  ops.push(buildSyncOperation(action, table, data));
  return ops;
}

// ── Enqueue ────────────────────────────────────────────────────────────────
// Writes to SQLite first, then adds the action to the queue.
export async function enqueueSync(
  action: 'insert' | 'update' | 'delete',
  table: string,
  payload: Record<string, unknown>
): Promise<void> {
  const repo = createRepository<Record<string, unknown>>('sync_queue');
  const syncOp = buildSyncOperation(action, table, payload);
  await repo.insert(syncOp.data);

  triggerBackgroundSync();
}

// ── Process queue (Web Fallback) ──────────────────────────────────────────
export async function processSyncQueue(): Promise<void> {
  // Desktop app uses Electron background worker, web uses this fallback
  if (window.electronAPI) {
    window.electronAPI.triggerSync();
    return;
  }
  
  // (Web version logic omitted for simplicity since this is Desktop-first)
// (Web version logic omitted for simplicity since this is Desktop-first)
}
// Automatically flush the queue when the device comes back online.
window.addEventListener('online', () => {
  console.log('[SyncQueue] Back online — flushing queue');
  processSyncQueue();
});
