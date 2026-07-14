import { enqueueSync } from '../../sync/syncQueue';
import { supplierRepository } from '../../../infrastructure/repositories/index';
import type { Supplier } from '../../../domain/entities/supplier';

export async function getSuppliers(cafeId: string): Promise<Supplier[]> {
  return await supplierRepository.getSuppliers(cafeId);
}

export async function createSupplier(
  cafeId: string,
  name: string,
  contactInfo?: string
): Promise<Supplier> {
  const supplier: Supplier = {
    id: crypto.randomUUID(),
    cafe_id: cafeId,
    name,
    contact_info: contactInfo || null,
    created_at: new Date().toISOString(),
  };
  await supplierRepository.createSupplier(supplier);
  await enqueueSync('insert', 'suppliers', supplier as unknown as Record<string, unknown>);
  return supplier;
}

export async function updateSupplier(supplier: Supplier): Promise<Supplier> {
  await supplierRepository.updateSupplier(supplier.id, supplier);
  await enqueueSync('update', 'suppliers', supplier as unknown as Record<string, unknown>);
  return supplier;
}

export async function deleteSupplier(supplier: Supplier): Promise<void> {
  await supplierRepository.deleteSupplier(supplier.id);
  await enqueueSync('delete', 'suppliers', { id: supplier.id });
}
