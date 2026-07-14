import { Product } from '../entities/product';

export interface IProductRepository {
  getProducts(cafeId: string): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  createProduct(product: Product): Promise<void>;
  updateProduct(id: string, updates: Partial<Product>): Promise<void>;
  deleteProduct(id: string): Promise<void>;
}
