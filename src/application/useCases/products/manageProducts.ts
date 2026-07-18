import { enqueueSync } from '../../sync/syncQueue';
import { productRepository, inventoryRepository } from '../../../infrastructure/repositories/index';
import type { Product } from '../../../domain/entities/product';

export async function getProducts(cafeId: string): Promise<Product[]> {
  return await productRepository.getProducts(cafeId);
}

export async function createProduct(
  cafeId: string,
  categoryId: string,
  name: string,
  price: number,
  cost: number,
  track_stock: boolean = false,
  inventory_item_id?: string | null
): Promise<Product> {
  let finalInventoryItemId = inventory_item_id;
  let autoCreatedInventory = false;

  if (track_stock && !finalInventoryItemId) {
    autoCreatedInventory = true;
    finalInventoryItemId = crypto.randomUUID();
    const newItem = {
      id: finalInventoryItemId,
      cafe_id: cafeId,
      name: name,
      stock_quantity: 0,
      unit: 'Pieces',
      cost_per_unit: cost || 0,
      is_countable: true,
      created_at: new Date().toISOString(),
    };
    await inventoryRepository.addInventoryItem(newItem);
    await enqueueSync('insert', 'inventory_items', newItem as unknown as Record<string, unknown>);
  }

  const product: Product = {
    id: crypto.randomUUID(),
    cafe_id: cafeId,
    category_id: categoryId,
    name,
    price,
    cost,
    status: 'active',
    track_stock,
    inventory_item_id: finalInventoryItemId || null,
    created_at: new Date().toISOString(),
  };

  try {
    await productRepository.createProduct(product);
    await enqueueSync('insert', 'products', product as unknown as Record<string, unknown>);
  } catch (error) {
    if (autoCreatedInventory && finalInventoryItemId) {
      try {
        await inventoryRepository.deleteInventoryItem(finalInventoryItemId);
        await enqueueSync('delete', 'inventory_items', { id: finalInventoryItemId });
      } catch (rollbackError) {
        console.error('Rollback failed for auto-created inventory item:', rollbackError);
      }
    }
    throw error;
  }

  return product;
}

export async function updateProduct(product: Product): Promise<Product> {
  let autoCreatedInventory = false;
  let newInventoryItemId: string | null = null;

  if (product.track_stock && !product.inventory_item_id) {
    autoCreatedInventory = true;
    newInventoryItemId = crypto.randomUUID();
    product.inventory_item_id = newInventoryItemId;
    
    const newItem = {
      id: newInventoryItemId,
      cafe_id: product.cafe_id,
      name: product.name,
      stock_quantity: 0,
      unit: 'Pieces',
      cost_per_unit: product.cost || 0,
      is_countable: true,
      created_at: new Date().toISOString(),
    };
    await inventoryRepository.addInventoryItem(newItem);
    await enqueueSync('insert', 'inventory_items', newItem as unknown as Record<string, unknown>);
  }

  try {
    await productRepository.updateProduct(product.id, product);
    await enqueueSync('update', 'products', product as unknown as Record<string, unknown>);
  } catch (error) {
    if (autoCreatedInventory && newInventoryItemId) {
      try {
        await inventoryRepository.deleteInventoryItem(newInventoryItemId);
        await enqueueSync('delete', 'inventory_items', { id: newInventoryItemId });
      } catch (rollbackError) {
        console.error('Rollback failed for auto-created inventory item:', rollbackError);
      }
    }
    throw error;
  }
  
  return product;
}

export async function deleteProduct(product: Product): Promise<void> {
  await productRepository.deleteProduct(product.id);
  await enqueueSync('delete', 'products', { id: product.id });
}
