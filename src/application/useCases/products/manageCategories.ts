import { db } from '../../../infrastructure/database/db';
import { enqueueSync } from '../../sync/syncQueue';
import type { Category } from '../../../core/entities/category';

export async function getCategories(cafeId: string): Promise<Category[]> {
  return await db.categories
    .where('cafe_id')
    .equals(cafeId)
    .filter(c => c.status !== 'inactive')
    .toArray();
}

export async function createCategory(cafeId: string, name: string): Promise<Category> {
  const category: Category = {
    id: crypto.randomUUID(),
    cafe_id: cafeId,
    name,
    status: 'active',
    created_at: new Date().toISOString(),
  };

  await db.categories.add(category);
  await enqueueSync('insert', 'categories', category as unknown as Record<string, unknown>);
  return category;
}

export async function updateCategory(category: Category): Promise<Category> {
  await db.categories.put(category);
  await enqueueSync('update', 'categories', category as unknown as Record<string, unknown>);
  return category;
}

export async function softDeleteCategory(category: Category): Promise<Category> {
  const updatedCategory = { ...category, status: 'inactive' as const };
  await db.categories.put(updatedCategory);
  await enqueueSync('update', 'categories', updatedCategory as unknown as Record<string, unknown>);
  return updatedCategory;
}
