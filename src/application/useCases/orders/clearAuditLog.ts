import { orderRepository } from '../../../infrastructure/repositories/index';
import { executeTransaction, TransactionOperation } from '../../../infrastructure/database/transaction';
import { buildSyncOperation } from '../../sync/syncQueue';

export async function clearAuditLog(cafeId: string): Promise<void> {
  const entries = await orderRepository.getAuditLogs(cafeId);
  if (entries.length === 0) return;

  const ops: TransactionOperation[] = [];

  for (const entry of entries) {
    ops.push({ type: 'delete', table: 'order_audit_log', id: entry.id });
    ops.push(buildSyncOperation('delete', 'order_audit_log', { id: entry.id }));
  }

  await executeTransaction(ops);

  if (navigator.onLine && window.electronAPI) {
    window.electronAPI.triggerSync();
  }
}
