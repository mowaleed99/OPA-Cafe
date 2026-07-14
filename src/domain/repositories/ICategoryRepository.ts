import { Category } from '../entities/category';

export interface ICategoryRepository {
  getCategories(cafeId: string): Promise<Category[]>;
  createCategory(category: Category): Promise<void>;
  updateCategory(id: string, updates: Partial<Category>): Promise<void>;
  deleteCategory(id: string): Promise<void>;
  findByName(cafeId: string, name: string): Promise<Category | null>;
}
