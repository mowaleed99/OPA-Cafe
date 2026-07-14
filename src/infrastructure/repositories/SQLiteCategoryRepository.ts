import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { Category } from '../../domain/entities/category';

export class SQLiteCategoryRepository implements ICategoryRepository {
  async getCategories(cafeId: string): Promise<Category[]> {
    const list = await window.electronAPI.db.findMany('categories', { cafe_id: cafeId });
    return list.filter((c: any) => c.status !== 'inactive') as Category[];
  }

  async createCategory(category: Category): Promise<void> {
    await window.electronAPI.db.insert('categories', category as any);
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    await window.electronAPI.db.update('categories', id, updates as any);
  }

  async deleteCategory(id: string): Promise<void> {
    await window.electronAPI.db.delete('categories', id);
  }

  async findByName(cafeId: string, name: string): Promise<Category | null> {
    const list = await window.electronAPI.db.findMany('categories', { cafe_id: cafeId });
    const existing = list.find((c: any) => 
      c.name.trim().toLowerCase() === name.trim().toLowerCase() && 
      c.status !== 'inactive'
    );
    return existing ? (existing as Category) : null;
  }
}
