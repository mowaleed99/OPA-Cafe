import { db } from '../../../infrastructure/database/db';
import { enqueueSync } from '../../sync/syncQueue';
import { DiningTable } from '../../../core/entities/table';

export async function addTable(cafeId: string, nameOrNumber: string): Promise<string> {
  const id = crypto.randomUUID();
  const newTable: DiningTable = {
    id,
    cafe_id: cafeId,
    name_or_number: nameOrNumber,
    status: 'available',
    current_order_id: null,
  };

  await db.transaction('rw', db.dining_tables, db.sync_queue, async () => {
    await db.dining_tables.add(newTable);
    // 2. Enqueue sync
    await enqueueSync('insert', 'dining_tables', newTable as unknown as Record<string, unknown>);
  });

  return id;
}

export async function removeTable(tableId: string): Promise<void> {
  await db.transaction('rw', db.dining_tables, db.sync_queue, async () => {
    await db.dining_tables.delete(tableId);
    await enqueueSync('delete', 'dining_tables', { id: tableId });
  });
}

export async function updateTableStatus(tableId: string, status: 'available' | 'occupied', orderId: string | null): Promise<void> {
  await db.transaction('rw', db.dining_tables, db.sync_queue, async () => {
    const table = await db.dining_tables.get(tableId);
    if (!table) return;
    await db.dining_tables.update(tableId, { status, current_order_id: orderId });
    await enqueueSync('update', 'dining_tables', { id: tableId, cafe_id: table.cafe_id, status, current_order_id: orderId });
  });
}
