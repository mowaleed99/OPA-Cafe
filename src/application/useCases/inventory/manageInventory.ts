import { enqueueSync } from '../../sync/syncQueue';
import { inventoryRepository, productRepository } from '../../../infrastructure/repositories/index';
import type { InventoryItem } from '../../../domain/entities/inventory';

export async function getInventoryItems(cafeId: string): Promise<InventoryItem[]> {
  return await inventoryRepository.getInventoryItems(cafeId);
}

export async function addInventoryItem(item: Omit<InventoryItem, 'id' | 'created_at'>): Promise<void> {
  const newItem: InventoryItem = {
    ...item,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  await inventoryRepository.addInventoryItem(newItem);
  await enqueueSync('insert', 'inventory_items', newItem as unknown as Record<string, unknown>);
}

export async function updateInventoryItem(item: InventoryItem): Promise<void> {
  await inventoryRepository.updateInventoryItem(item.id, item);
  await enqueueSync('update', 'inventory_items', item as unknown as Record<string, unknown>);
}

export async function deleteInventoryItem(id: string, cafeId: string): Promise<void> {
  const allProducts = await productRepository.getProducts(cafeId);
  const linkedProducts = allProducts.filter(p => p.inventory_item_id === id);
  
  if (linkedProducts.length > 0) {
    throw new Error('Cannot delete this item because it is linked to one or more products. Please unlink them first.');
  }

  await inventoryRepository.deleteInventoryItem(id);
  await enqueueSync('delete', 'inventory_items', { id });
}
