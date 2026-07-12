import { db } from '../../../infrastructure/database/db';
import { enqueueSync } from '../../sync/syncQueue';
import type { Product } from '../../../core/entities/product';

export async function getProducts(cafeId: string): Promise<Product[]> {
  return await db.products
    .where('cafe_id')
    .equals(cafeId)
    .filter(p => p.status !== 'inactive')
    .toArray();
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
  if (track_stock && !inventory_item_id) {
    throw new Error('Inventory Item ID is required when tracking stock.');
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
    inventory_item_id: inventory_item_id || null,
    created_at: new Date().toISOString(),
  };

  await db.products.add(product);
  await enqueueSync('insert', 'products', product as unknown as Record<string, unknown>);
  return product;
}

export async function updateProduct(product: Product): Promise<Product> {
  if (product.track_stock && !product.inventory_item_id) {
    throw new Error('Inventory Item ID is required when tracking stock.');
  }
  await db.products.put(product);
  await enqueueSync('update', 'products', product as unknown as Record<string, unknown>);
  return product;
}

export async function deleteProduct(product: Product): Promise<void> {
  await db.products.delete(product.id);
  await enqueueSync('delete', 'products', { id: product.id });
}
