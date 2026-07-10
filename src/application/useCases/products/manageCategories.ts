import { db } from '../../../infrastructure/database/db';
import { enqueueSync } from '../../sync/syncQueue';
import { supabase } from '../../../infrastructure/api/supabase';
import type { Category } from '../../../core/entities/category';

export async function getCategories(cafeId: string): Promise<Category[]> {
  // Try local Dexie first (offline-first)
  const local = await db.categories
    .where('cafe_id')
    .equals(cafeId)
    .filter(c => !c.status || c.status !== 'inactive')
    .toArray();

  if (local.length > 0) return local;

  // Fallback: fetch from Supabase if local DB is empty (e.g. first load)
  if (!navigator.onLine) return [];
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('cafe_id', cafeId)
    .neq('status', 'inactive');

  if (error || !data) return [];

  // Cache into Dexie so future calls are offline-first
  await db.categories.bulkPut(data as Category[]);
  return data as Category[];
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

export async function deleteCategory(category: Category): Promise<void> {
  await db.categories.delete(category.id);
  await enqueueSync('delete', 'categories', { id: category.id });

  // Delete all products associated with this category
  const products = await db.products
    .where('category_id')
    .equals(category.id)
    .toArray();

  for (const product of products) {
    await db.products.delete(product.id);
    await enqueueSync('delete', 'products', { id: product.id });
  }
}
