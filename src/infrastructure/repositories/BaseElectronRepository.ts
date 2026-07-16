import { IRepository } from '../../domain/repositories/IRepository';
import type { IDatabaseDriver } from '../database/IDatabaseDriver';
import { defaultDatabaseDriver } from '../database/ElectronIpcDatabaseDriver';

export class BaseElectronRepository<T> implements IRepository<T> {
  protected dbDriver: IDatabaseDriver;

  constructor(protected tableName: string, dbDriver?: IDatabaseDriver) {
    this.dbDriver = dbDriver || defaultDatabaseDriver;
  }

  async findMany(
    where?: Partial<T> | Record<string, any>,
    options?: { orderBy?: { column: string; direction: 'asc' | 'desc' }; limit?: number; offset?: number }
  ): Promise<T[]> {
    return this.dbDriver.findMany(this.tableName, where, options);
  }

  async findOne(id: string): Promise<T | null> {
    return this.dbDriver.findOne(this.tableName, id);
  }

  async insert(data: T): Promise<void> {
    await this.dbDriver.insert(this.tableName, data);
  }

  async insertMany(data: T[]): Promise<void> {
    await this.dbDriver.insertMany(this.tableName, data);
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    await this.dbDriver.update(this.tableName, id, data);
  }

  async delete(id: string): Promise<void> {
    await this.dbDriver.delete(this.tableName, id);
  }
}
