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
  cost: number
): Promise<Product> {
  const product: Product = {
    id: crypto.randomUUID(),
    cafe_id: cafeId,
    category_id: categoryId,
    name,
    price,
    cost,
    status: 'active',
    created_at: new Date().toISOString(),
  };

  await db.products.add(product);
  await enqueueSync('insert', 'products', product as unknown as Record<string, unknown>);
  return product;
}

export async function updateProduct(product: Product): Promise<Product> {
  await db.products.put(product);
  await enqueueSync('update', 'products', product as unknown as Record<string, unknown>);
  return product;
}

export async function softDeleteProduct(product: Product): Promise<Product> {
  const updatedProduct = { ...product, status: 'inactive' as const };
  await db.products.put(updatedProduct);
  await enqueueSync('update', 'products', updatedProduct as unknown as Record<string, unknown>);
  return updatedProduct;
}
