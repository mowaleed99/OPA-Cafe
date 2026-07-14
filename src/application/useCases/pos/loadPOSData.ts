import { createRepository } from '../../../infrastructure/repositories/RepositoryFactory';
import type { Category } from '../../../domain/entities/category';
import type { Product } from '../../../domain/entities/product';
import type { InventoryItem } from '../../../domain/entities/inventory';

export interface POSData {
  categories: Category[];
  products: Product[];
  inventoryMap: Record<string, { stock_quantity: number; minimum_stock: number }>;
}

export async function loadPOSData(cafeId: string): Promise<POSData> {
  const catRepo = createRepository<Category>('categories');
  const prodRepo = createRepository<Product>('products');
  const invRepo = createRepository<InventoryItem>('inventory_items');

  const [allCategories, allProducts, inventoryItems] = await Promise.all([
    catRepo.findMany({ cafe_id: cafeId }),
    prodRepo.findMany({ cafe_id: cafeId }),
    invRepo.findMany({ cafe_id: cafeId })
  ]);

  const categories = allCategories
    .filter(c => !c.status || c.status !== 'inactive')
    .sort((a, b) => a.name.localeCompare(b.name));
    
  const products = allProducts
    .filter(p => p.status === 'active')
    .sort((a, b) => a.name.localeCompare(b.name));

  const inventoryMap: Record<string, { stock_quantity: number; minimum_stock: number }> = {};
  for (const item of inventoryItems) {
    inventoryMap[item.id] = {
      stock_quantity: item.stock_quantity,
      minimum_stock: item.minimum_stock || 0,
    };
  }

  return { categories, products, inventoryMap };
}
