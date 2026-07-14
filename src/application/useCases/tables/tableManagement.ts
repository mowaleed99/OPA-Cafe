import { enqueueSync } from '../../sync/syncQueue';
import { createRepository } from '../../../infrastructure/repositories/RepositoryFactory';
import { DiningTable } from '../../../domain/entities/table';

export async function addTable(cafeId: string, nameOrNumber: string): Promise<string> {
  const id = crypto.randomUUID();
  const newTable: DiningTable = {
    id,
    cafe_id: cafeId,
    name_or_number: nameOrNumber,
    status: 'available',
    current_order_id: null,
  };

  const repo = createRepository<DiningTable>('dining_tables');
  await repo.insert(newTable);
  await enqueueSync('insert', 'dining_tables', newTable as unknown as Record<string, unknown>);

  return id;
}

export async function removeTable(tableId: string): Promise<void> {
  const repo = createRepository<DiningTable>('dining_tables');
  await repo.delete(tableId);
  await enqueueSync('delete', 'dining_tables', { id: tableId });
}

export async function updateTableStatus(tableId: string, status: 'available' | 'occupied', orderId: string | null): Promise<void> {
  const repo = createRepository<DiningTable>('dining_tables');
  const table = await repo.findOne(tableId);
  if (!table) return;
  await repo.update(tableId, { status, current_order_id: orderId });
  await enqueueSync('update', 'dining_tables', { id: tableId, cafe_id: table.cafe_id, status, current_order_id: orderId });
}
