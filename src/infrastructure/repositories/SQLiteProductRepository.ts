import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { Product } from '../../domain/entities/product';

export class SQLiteProductRepository implements IProductRepository {
  async getProducts(cafeId: string): Promise<Product[]> {
    const list = await window.electronAPI.db.findMany('products', { cafe_id: cafeId });
    return list.filter((p: any) => !p.deleted_at).sort((a: any, b: any) => a.name.localeCompare(b.name)) as Product[];
  }

  async getProductById(id: string): Promise<Product | null> {
    const p = await window.electronAPI.db.findOne('products', id);
    if (!p || p.deleted_at) return null;
    return p as Product;
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const list = await window.electronAPI.db.findMany('products', { category_id: categoryId });
    return list.filter((p: any) => p.status !== 'inactive') as Product[];
  }

  async createProduct(product: Product): Promise<void> {
    await window.electronAPI.db.insert('products', product as any);
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    await window.electronAPI.db.update('products', id, updates as any);
  }

  async deleteProduct(id: string): Promise<void> {
    await window.electronAPI.db.delete('products', id);
  }
}
