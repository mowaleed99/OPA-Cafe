import { enqueueSync } from '../../sync/syncQueue';
import { categoryRepository, productRepository } from '../../../infrastructure/repositories/index';
import type { Category } from '../../../domain/entities/category';
import type { Product } from '../../../domain/entities/product';

export async function getCategories(cafeId: string): Promise<Category[]> {
  const local = await categoryRepository.getCategories(cafeId);

  // Deduplicate by id (primary) then by name (case-insensitive)
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  const unique = local.filter(c => {
    const nameKey = c.name.trim().toLowerCase();
    if (seenIds.has(c.id) || seenNames.has(nameKey)) return false;
    seenIds.add(c.id);
    seenNames.add(nameKey);
    return true;
  });

  return unique;
}

export async function createCategory(cafeId: string, name: string): Promise<Category> {
  // Guard: prevent duplicate category names in the same cafe
  const existing = await categoryRepository.findByName(cafeId, name);

  if (existing) return existing;

  const category: Category = {
    id: crypto.randomUUID(),
    cafe_id: cafeId,
    name: name.trim(),
    status: 'active',
    created_at: new Date().toISOString(),
  };

  await categoryRepository.createCategory(category);
  await enqueueSync('insert', 'categories', category as unknown as Record<string, unknown>);
  return category;
}

export async function updateCategory(category: Category): Promise<Category> {
  await categoryRepository.updateCategory(category.id, category);
  await enqueueSync('update', 'categories', category as unknown as Record<string, unknown>);
  return category;
}

export async function deleteCategory(category: Category): Promise<void> {
  await categoryRepository.deleteCategory(category.id);
  await enqueueSync('delete', 'categories', { id: category.id });

  // Delete all products associated with this category
  const allProducts = await productRepository.getProductsByCategory(category.id);
  for (const product of allProducts) {
    await productRepository.deleteProduct(product.id);
    await enqueueSync('delete', 'products', { id: product.id });
  }
}
