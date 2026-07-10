import { db } from '../../../infrastructure/database/db';
import type { Category } from '../../../core/entities/category';
import type { Product } from '../../../core/entities/product';

export interface POSData {
  categories: Category[];
  products: Product[];
}

/**
 * Reads active categories and products from local Dexie DB for the given cafe.
 * Fully offline-first — no network call.
 */
export async function loadPOSData(cafeId: string): Promise<POSData> {
  const [categories, products] = await Promise.all([
    db.categories.where('cafe_id').equals(cafeId).filter((c) => !c.status || c.status !== 'inactive').sortBy('name'),
    db.products
      .where('cafe_id')
      .equals(cafeId)
      .filter((p) => p.status === 'active')
      .sortBy('name'),
  ]);

  return { categories, products };
}
