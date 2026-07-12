import { db } from '../../../infrastructure/database/db';
import { enqueueSync } from '../../sync/syncQueue';
import type { InventoryItem } from '../../../core/entities/inventory';

export async function getInventoryItems(cafeId: string): Promise<InventoryItem[]> {
  return await db.inventory_items.where('cafe_id').equals(cafeId).toArray();
}

export async function addInventoryItem(item: Omit<InventoryItem, 'id' | 'created_at'>): Promise<void> {
  const newItem: InventoryItem = {
    ...item,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  await db.inventory_items.add(newItem);
  await enqueueSync('insert', 'inventory_items', newItem as unknown as Record<string, unknown>);
}

export async function updateInventoryItem(item: InventoryItem): Promise<void> {
  await db.inventory_items.put(item);
  await enqueueSync('update', 'inventory_items', item as unknown as Record<string, unknown>);
}

export async function deleteInventoryItem(id: string): Promise<void> {
  const linkedProductsCount = await db.products.filter(p => p.inventory_item_id === id).count();
  if (linkedProductsCount > 0) {
    throw new Error('Cannot delete this item because it is linked to one or more products. Please unlink them first.');
  }

  await db.inventory_items.delete(id);
  await enqueueSync('delete', 'inventory_items', { id });
}
