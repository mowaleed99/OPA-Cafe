import { ISupplierRepository } from '../../domain/repositories/ISupplierRepository';
import { Supplier } from '../../domain/entities/supplier';

export class SQLiteSupplierRepository implements ISupplierRepository {
  async getSuppliers(cafeId: string): Promise<Supplier[]> {
    const list = await window.electronAPI.db.findMany('suppliers', { cafe_id: cafeId });
    return list.filter((s: any) => !s.deleted_at).sort((a: any, b: any) => a.name.localeCompare(b.name)) as Supplier[];
  }

  async findOne(id: string): Promise<Supplier | null> {
    const s = await window.electronAPI.db.findOne('suppliers', id);
    if (!s || s.deleted_at) return null;
    return s as Supplier;
  }

  async createSupplier(supplier: Supplier): Promise<void> {
    await window.electronAPI.db.insert('suppliers', supplier as any);
  }

  async updateSupplier(id: string, updates: Partial<Supplier>): Promise<void> {
    await window.electronAPI.db.update('suppliers', id, updates as any);
  }

  async deleteSupplier(id: string): Promise<void> {
    await window.electronAPI.db.delete('suppliers', id);
  }
}
