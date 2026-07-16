import type { IDatabaseDriver } from './IDatabaseDriver';

declare global {
  interface Window {
    electronAPI?: any;
  }
}

export class ElectronIpcDatabaseDriver implements IDatabaseDriver {
  private get db() {
    if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.db) {
      throw new Error('electronAPI.db is not available in this environment');
    }
    return window.electronAPI.db;
  }

  async findMany<T = any>(
    tableName: string,
    where?: Record<string, any>,
    options?: { orderBy?: { column: string; direction: 'asc' | 'desc' }; limit?: number; offset?: number }
  ): Promise<T[]> {
    return this.db.findMany(tableName, where, options);
  }

  async findOne<T = any>(tableName: string, id: string): Promise<T | null> {
    return this.db.findOne(tableName, id);
  }

  async insert<T = any>(tableName: string, data: T): Promise<void> {
    await this.db.insert(tableName, data);
  }

  async insertMany<T = any>(tableName: string, data: T[]): Promise<void> {
    await this.db.insertMany(tableName, data);
  }

  async update<T = any>(tableName: string, id: string, data: Partial<T>): Promise<void> {
    await this.db.update(tableName, id, data);
  }

  async delete(tableName: string, id: string): Promise<void> {
    await this.db.delete(tableName, id);
  }
}

export const defaultDatabaseDriver = new ElectronIpcDatabaseDriver();
