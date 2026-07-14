import { Supplier, Purchase, PurchaseItem, SupplierPayment } from '../entities/supplier';

export interface ISupplierRepository {
  getSuppliers(cafeId: string): Promise<Supplier[]>;
  findOne(id: string): Promise<Supplier | null>;
  createSupplier(supplier: Supplier): Promise<void>;
  updateSupplier(id: string, updates: Partial<Supplier>): Promise<void>;
  deleteSupplier(id: string): Promise<void>;
}
