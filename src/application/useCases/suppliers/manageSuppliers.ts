import { db } from '../../../infrastructure/database/db';
import { enqueueSync } from '../../sync/syncQueue';
import type { Supplier } from '../../../core/entities/supplier';

export async function getSuppliers(cafeId: string): Promise<Supplier[]> {
  return await db.suppliers.where('cafe_id').equals(cafeId).sortBy('name');
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
  await db.suppliers.add(supplier);
  await enqueueSync('insert', 'suppliers', supplier as unknown as Record<string, unknown>);
  return supplier;
}

export async function updateSupplier(supplier: Supplier): Promise<Supplier> {
  await db.suppliers.put(supplier);
  await enqueueSync('update', 'suppliers', supplier as unknown as Record<string, unknown>);
  return supplier;
}

export async function deleteSupplier(supplier: Supplier): Promise<void> {
  await db.suppliers.delete(supplier.id);
  await enqueueSync('delete', 'suppliers', { id: supplier.id });
}
