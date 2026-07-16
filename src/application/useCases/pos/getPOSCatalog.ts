import { productRepository, categoryRepository, orderRepository, closingRepository } from '../../../infrastructure/repositories/index';
import type { Product } from '../../../domain/entities/product';
import type { Category } from '../../../domain/entities/category';
import type { DiningTable } from '../../../domain/entities/table';
import type { DailyClosing } from '../../../domain/entities/daily_closing';

export interface POSCatalogData {
  products: Product[];
  categories: Category[];
  tables: DiningTable[];
  todayClosing: DailyClosing | null;
}

/**
 * Retrieves catalog data required for the POS page.
 * Decouples POS screen from direct infrastructure repositories.
 */
export async function getPOSCatalog(cafeId: string): Promise<POSCatalogData> {
  const today = new Date().toISOString().split('T')[0];

  const [products, categories, tables, todayClosing] = await Promise.all([
    productRepository.getProducts(cafeId),
    categoryRepository.getCategories(cafeId),
    orderRepository.getTables(cafeId),
    closingRepository.getClosingByDate(cafeId, today)
  ]);

  return {
    products: products.filter(p => p.status === 'active'),
    categories: categories.filter(c => c.status === 'active'),
    tables,
    todayClosing: todayClosing || null
  };
}
