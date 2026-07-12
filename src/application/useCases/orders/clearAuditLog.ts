import { db } from '../../../infrastructure/database/db';
import { enqueueSync } from '../../sync/syncQueue';

export async function clearAuditLog(cafeId: string): Promise<void> {
  const entries = await db.order_audit_log.where('cafe_id').equals(cafeId).toArray();
  if (entries.length === 0) return;

  const entryIds = entries.map(e => e.id);

  // Perform deletion and sync queueing in a single atomic transaction
  await db.transaction('rw', db.order_audit_log, db.sync_queue, async () => {
    // Local delete
    await db.order_audit_log.bulkDelete(entryIds);

    // Queue sync for each deleted entry
    for (const entry of entries) {
      await enqueueSync('delete', 'order_audit_log', { id: entry.id });
    }
  });
}
