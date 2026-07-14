import { IRepository } from '../../domain/repositories/IRepository';
import { db } from '../../infrastructure/database/db';
import type { Table } from 'dexie';

export class BaseWebRepository<T> implements IRepository<T> {
  protected table: Table<T, any>;

  constructor(protected tableName: string) {
    // @ts-ignore
    this.table = db[tableName];
  }

  async findMany(where?: Partial<T>): Promise<T[]> {
    if (!where || Object.keys(where).length === 0) {
      return this.table.toArray();
    }
    
    // Simple Dexie filter for MVP
    return this.table.filter((item: any) => {
      for (const [key, value] of Object.entries(where)) {
        if (item[key] !== value) return false;
      }
      return true;
    }).toArray();
  }

  async findOne(id: string): Promise<T | null> {
    const result = await this.table.get(id);
    return result || null;
  }

  async insert(data: T): Promise<void> {
    await this.table.add(data);
  }

  async insertMany(data: T[]): Promise<void> {
    await this.table.bulkAdd(data);
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    await this.table.update(id, data as any);
  }

  async delete(id: string): Promise<void> {
    await this.table.delete(id);
  }
}
