import { IPurchaseRepository } from '../../domain/repositories/IPurchaseRepository';
import { Purchase, PurchaseItem, SupplierPayment } from '../../domain/entities/supplier';

export class SQLitePurchaseRepository implements IPurchaseRepository {
  async getPurchases(cafeId: string): Promise<Purchase[]> {
    const list = await window.electronAPI.db.findMany('purchases', { cafe_id: cafeId });
    return list
      .filter((p: any) => !p.deleted_at)
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .reverse() as Purchase[];
  }

  async getPurchaseById(id: string): Promise<Purchase | null> {
    const p = await window.electronAPI.db.findOne('purchases', id);
    if (!p || p.deleted_at) return null;
    return p as Purchase;
  }

  async getPurchaseItems(purchaseId: string): Promise<PurchaseItem[]> {
    const list = await window.electronAPI.db.findMany('purchase_items', { purchase_id: purchaseId });
    return list.filter((i: any) => !i.deleted_at) as PurchaseItem[];
  }

  async getSupplierPayments(purchaseId: string): Promise<SupplierPayment[]> {
    const list = await window.electronAPI.db.findMany('supplier_payments', { purchase_id: purchaseId });
    return list.filter((p: any) => !p.deleted_at) as SupplierPayment[];
  }

  async getPayments(cafeId: string): Promise<SupplierPayment[]> {
    const list = await window.electronAPI.db.findMany('supplier_payments');
    // Note: Since supplier_payments does not have cafe_id, we fetch all and let use cases filter by supplier_ids.
    // Or if they DO have cafe_id, we could filter here. schema.cjs shows supplier_payments doesn't have cafe_id.
    return list.filter((p: any) => !p.deleted_at) as SupplierPayment[];
  }
}
