import { categoryRepository, productRepository, inventoryRepository, orderRepository } from '../../../infrastructure/repositories/index';
import type { Category } from '../../../domain/entities/category';
import type { Product } from '../../../domain/entities/product';
import type { DiningTable } from '../../../domain/entities/table';

export interface POSData {
  categories: Category[];
  products: Product[];
  inventoryMap: Record<string, { stock_quantity: number; minimum_stock: number }>;
}

export async function loadPOSData(cafeId: string): Promise<POSData> {
  const [allCategories, allProducts, inventoryItems] = await Promise.all([
    categoryRepository.getCategories(cafeId),
    productRepository.getProducts(cafeId),
    inventoryRepository.getInventoryItems(cafeId)
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
      minimum_stock: item.low_stock_threshold || 0,
    };
  }

  return { categories, products, inventoryMap };
}

export async function loadTablePOSInfo(tableId: string): Promise<DiningTable | null> {
  return await orderRepository.getTableById(tableId);
}
