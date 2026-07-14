import { enqueueSync } from '../../sync/syncQueue';
import { productRepository } from '../../../infrastructure/repositories/index';
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

  await productRepository.createProduct(product);
  await enqueueSync('insert', 'products', product as unknown as Record<string, unknown>);
  return product;
}

export async function updateProduct(product: Product): Promise<Product> {
  if (product.track_stock && !product.inventory_item_id) {
    throw new Error('Inventory Item ID is required when tracking stock.');
  }
  await productRepository.updateProduct(product.id, product);
  await enqueueSync('update', 'products', product as unknown as Record<string, unknown>);
  return product;
}

export async function deleteProduct(product: Product): Promise<void> {
  await productRepository.deleteProduct(product.id);
  await enqueueSync('delete', 'products', { id: product.id });
}
