import { IRepository } from '../../domain/repositories/IRepository';

declare global {
  interface Window {
    electronAPI?: any;
  }
}

export class BaseElectronRepository<T> implements IRepository<T> {
  constructor(protected tableName: string) {}

  async findMany(where?: Partial<T>): Promise<T[]> {
    if (!window.electronAPI) throw new Error('electronAPI is not available');
    return window.electronAPI.db.findMany(this.tableName, where);
  }

  async findOne(id: string): Promise<T | null> {
    if (!window.electronAPI) throw new Error('electronAPI is not available');
    return window.electronAPI.db.findOne(this.tableName, id);
  }

  async insert(data: T): Promise<void> {
    if (!window.electronAPI) throw new Error('electronAPI is not available');
    await window.electronAPI.db.insert(this.tableName, data);
  }

  async insertMany(data: T[]): Promise<void> {
    if (!window.electronAPI) throw new Error('electronAPI is not available');
    await window.electronAPI.db.insertMany(this.tableName, data);
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    if (!window.electronAPI) throw new Error('electronAPI is not available');
    await window.electronAPI.db.update(this.tableName, id, data);
  }

  async delete(id: string): Promise<void> {
    if (!window.electronAPI) throw new Error('electronAPI is not available');
    await window.electronAPI.db.delete(this.tableName, id);
  }
}
