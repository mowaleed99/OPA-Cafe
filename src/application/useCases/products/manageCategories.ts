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

export async function softDeleteCategory(category: Category): Promise<Category> {
  const updatedCategory = { ...category, status: 'inactive' as const };
  await db.categories.put(updatedCategory);
  await enqueueSync('update', 'categories', updatedCategory as unknown as Record<string, unknown>);
  return updatedCategory;
}
