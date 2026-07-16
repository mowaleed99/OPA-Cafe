import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { Category } from '../../domain/entities/category';
import { BaseElectronRepository } from './BaseElectronRepository';
import type { IDatabaseDriver } from '../database/IDatabaseDriver';

export class SQLiteCategoryRepository extends BaseElectronRepository<Category> implements ICategoryRepository {
  constructor(dbDriver?: IDatabaseDriver) {
    super('categories', dbDriver);
  }

  async getCategories(cafeId: string): Promise<Category[]> {
    const list = await this.dbDriver.findMany('categories', { cafe_id: cafeId });
    return list.filter((c: any) => c.status !== 'inactive') as Category[];
  }

  async createCategory(category: Category): Promise<void> {
    await this.dbDriver.insert('categories', category as any);
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    await this.dbDriver.update('categories', id, updates as any);
  }

  async deleteCategory(id: string): Promise<void> {
    await this.dbDriver.delete('categories', id);
  }

  async findByName(cafeId: string, name: string): Promise<Category | null> {
    const list = await this.dbDriver.findMany('categories', { cafe_id: cafeId });
    const existing = list.find((c: any) => 
      c.name.trim().toLowerCase() === name.trim().toLowerCase() && 
      c.status !== 'inactive'
    );
    return existing ? (existing as Category) : null;
  }
}
