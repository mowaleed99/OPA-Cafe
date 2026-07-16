import { ISupplierRepository } from '../../domain/repositories/ISupplierRepository';
import { Supplier } from '../../domain/entities/supplier';
import { BaseElectronRepository } from './BaseElectronRepository';
import type { IDatabaseDriver } from '../database/IDatabaseDriver';

export class SQLiteSupplierRepository extends BaseElectronRepository<Supplier> implements ISupplierRepository {
  constructor(dbDriver?: IDatabaseDriver) {
    super('suppliers', dbDriver);
  }

  async getSuppliers(cafeId: string): Promise<Supplier[]> {
    const list = await this.dbDriver.findMany('suppliers', { cafe_id: cafeId });
    return list.filter((s: any) => !s.deleted_at).sort((a: any, b: any) => a.name.localeCompare(b.name)) as Supplier[];
  }

  async findOne(id: string): Promise<Supplier | null> {
    const s = await this.dbDriver.findOne('suppliers', id);
    if (!s || s.deleted_at) return null;
    return s as Supplier;
  }

  async createSupplier(supplier: Supplier): Promise<void> {
    await this.dbDriver.insert('suppliers', supplier as any);
  }

  async updateSupplier(id: string, updates: Partial<Supplier>): Promise<void> {
    await this.dbDriver.update('suppliers', id, updates as any);
  }

  async deleteSupplier(id: string): Promise<void> {
    await this.dbDriver.delete('suppliers', id);
  }
}
