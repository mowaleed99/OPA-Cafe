import { db } from '../../../infrastructure/database/db';
import type { Category } from '../../../core/entities/category';
import type { Product } from '../../../core/entities/product';

export interface POSData {
  categories: Category[];
  products: Product[];
  inventoryMap: Record<string, { stock_quantity: number; minimum_stock: number }>;
}

/**
 * Reads active categories and products from local Dexie DB for the given cafe.
 * Fully offline-first — no network call.
 */
export async function loadPOSData(cafeId: string): Promise<POSData> {
  const [categories, products, inventoryItems] = await Promise.all([
    db.categories.where('cafe_id').equals(cafeId).filter((c) => !c.status || c.status !== 'inactive').sortBy('name'),
    db.products
      .where('cafe_id')
      .equals(cafeId)
      .filter((p) => p.status === 'active')
      .sortBy('name'),
    db.inventory_items.where('cafe_id').equals(cafeId).toArray(),
  ]);

  const inventoryMap: Record<string, { stock_quantity: number; minimum_stock: number }> = {};
  for (const item of inventoryItems) {
    inventoryMap[item.id] = {
      stock_quantity: item.stock_quantity,
      minimum_stock: item.minimum_stock || 0,
    };
  }

  return { categories, products, inventoryMap };
}
