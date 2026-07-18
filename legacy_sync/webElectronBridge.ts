import { supabase } from './supabase';

type Operation = {
  type: 'insert' | 'update' | 'delete' | 'insertMany';
  table: string;
  id?: string;
  data?: Record<string, unknown> | Record<string, unknown>[];
};

function cloudTable(table: string): string {
  return table === 'dining_tables' ? 'tables' : table;
}

function cloudPayload(table: string, value: Record<string, unknown>): Record<string, unknown> {
  const payload = { ...value };

  if (table === 'expenses') {
    payload.expense_date ??= payload.date;
    delete payload.date;
  }

  if (table === 'settings' && typeof payload.cashier_permissions === 'string') {
    try {
      payload.cashier_permissions = JSON.parse(payload.cashier_permissions);
    } catch {
      // The API will report invalid JSON instead of silently changing it.
    }
  }

  if (table === 'order_audit_log') {
    let details: Record<string, unknown> = {};
    if (payload.details) {
      try {
        details = typeof payload.details === 'string'
          ? JSON.parse(payload.details)
          : payload.details as Record<string, unknown>;
      } catch {
        // The API will return a useful error for malformed JSON.
      }
    }
    payload.action_type ??= payload.action;
    payload.initiated_by_user_id ??= details.initiated_by_user_id;
    payload.initiated_by_name ??= details.initiated_by_name ?? payload.performed_by;
    payload.order_total ??= details.order_total;
    payload.approved_by_owner_pin ??= details.approved_by_owner_pin;
  }

  return payload;
}

function fail(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

async function insert(table: string, data: Record<string, unknown>): Promise<void> {
  if (table === 'sync_queue') return;
  const { error } = await supabase.from(cloudTable(table)).insert(cloudPayload(table, data));
  fail(error);
}

async function update(table: string, id: string, data: Record<string, unknown>): Promise<void> {
  if (table === 'sync_queue') return;
  const { id: _id, ...updates } = cloudPayload(table, data);
  const { error } = await supabase.from(cloudTable(table)).update(updates).eq('id', id);
  fail(error);
}

async function remove(table: string, id: string): Promise<void> {
  if (table === 'sync_queue') return;
  const { error } = await supabase.from(cloudTable(table)).delete().eq('id', id);
  fail(error);
}

/**
 * Lets the shared repository layer use Supabase in the browser while Electron
 * keeps its preload-provided SQLite bridge. Queue writes are deliberately
 * ignored here because browser writes already go straight to Supabase.
 */
export function installWebElectronBridge(): void {
  if (typeof window === 'undefined' || window.electronAPI) return;

  window.electronAPI = {
    db: {
      findMany: async (table: string, where: Record<string, unknown> = {}) => {
        if (table === 'sync_queue') return [];
        let query = supabase.from(cloudTable(table)).select('*').is('deleted_at', null);
        for (const [key, value] of Object.entries(where)) {
          query = value === null ? query.is(key, null) : query.eq(key, value);
        }
        const { data, error } = await query;
        fail(error);
        return data ?? [];
      },
      findOne: async (table: string, id: string) => {
        if (table === 'sync_queue') return null;
        const { data, error } = await supabase
          .from(cloudTable(table))
          .select('*')
          .eq('id', id)
          .is('deleted_at', null)
          .maybeSingle();
        fail(error);
        return data ?? null;
      },
      insert,
      insertMany: async (table: string, data: Record<string, unknown>[]) => {
        for (const item of data) await insert(table, item);
      },
      update,
      delete: remove,
      transaction: async (operations: Operation[]) => {
        // Supabase's browser client has no general SQL transaction API. Run
        // the ordered operations; sync_queue entries are no-ops in web mode.
        for (const operation of operations) {
          if (operation.type === 'insert') await insert(operation.table, operation.data as Record<string, unknown>);
          else if (operation.type === 'insertMany') {
            for (const item of operation.data as Record<string, unknown>[]) await insert(operation.table, item);
          } else if (operation.type === 'update') await update(operation.table, operation.id!, operation.data as Record<string, unknown>);
          else if (operation.type === 'delete') await remove(operation.table, operation.id!);
        }
        return { success: true };
      },
    },
  };
}
