import { db } from '../../../infrastructure/database/db';
import { enqueueSync } from '../../sync/syncQueue';
import { supabase } from '../../../infrastructure/api/supabase';
import type { Category } from '../../../core/entities/category';

export async function getCategories(cafeId: string): Promise<Category[]> {
  // Always deduplicate local data by ID and name before returning
  const local = await db.categories
    .where('cafe_id')
    .equals(cafeId)
    .filter(c => !c.status || c.status !== 'inactive')
    .toArray();

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

  if (unique.length > 0) return unique;

  // Fallback: fetch from Supabase when local is empty (first load / fresh install)
  if (!navigator.onLine) return [];

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('cafe_id', cafeId)
    .neq('status', 'inactive');

  if (error || !data) return [];

  // Deduplicate remote data before caching
  const seenRemoteIds = new Set<string>();
  const seenRemoteNames = new Set<string>();
  const uniqueRemote = (data as Category[]).filter(c => {
    const nameKey = c.name.trim().toLowerCase();
    if (seenRemoteIds.has(c.id) || seenRemoteNames.has(nameKey)) return false;
    seenRemoteIds.add(c.id);
    seenRemoteNames.add(nameKey);
    return true;
  });

  // Wipe existing local duplicates then cache clean data
  await db.categories.where('cafe_id').equals(cafeId).delete();
  await db.categories.bulkPut(uniqueRemote);
  return uniqueRemote;
}

export async function createCategory(cafeId: string, name: string): Promise<Category> {
  // Guard: prevent duplicate category names in the same cafe
  const existing = await db.categories
    .where('cafe_id').equals(cafeId)
    .filter(c => c.name.trim().toLowerCase() === name.trim().toLowerCase() && c.status !== 'inactive')
    .first();

  if (existing) return existing;

  const category: Category = {
    id: crypto.randomUUID(),
    cafe_id: cafeId,
    name: name.trim(),
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
