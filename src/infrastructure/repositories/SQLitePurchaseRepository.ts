import { IPurchaseRepository } from '../../domain/repositories/IPurchaseRepository';
import { Purchase, PurchaseItem, SupplierPayment } from '../../domain/entities/supplier';
import { BaseElectronRepository } from './BaseElectronRepository';
import type { IDatabaseDriver } from '../database/IDatabaseDriver';

export class SQLitePurchaseRepository extends BaseElectronRepository<Purchase> implements IPurchaseRepository {
  constructor(dbDriver?: IDatabaseDriver) {
    super('purchases', dbDriver);
  }

  async getPurchases(cafeId: string): Promise<Purchase[]> {
    const list = await this.dbDriver.findMany('purchases', { cafe_id: cafeId });
    return list
      .filter((p: any) => !p.deleted_at)
      .map((p: any) => ({ ...p, amount_remaining: p.total_amount - (p.amount_paid || 0) }))
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .reverse() as Purchase[];
  }

  async getPurchaseById(id: string): Promise<Purchase | null> {
    const p = await this.dbDriver.findOne('purchases', id);
    if (!p || p.deleted_at) return null;
    return { ...p, amount_remaining: p.total_amount - (p.amount_paid || 0) } as Purchase;
  }

  async getPurchaseItems(purchaseId: string): Promise<PurchaseItem[]> {
    const list = await this.dbDriver.findMany('purchase_items', { purchase_id: purchaseId });
    return list.filter((i: any) => !i.deleted_at) as PurchaseItem[];
  }

  async getPurchaseItemsByPurchaseIds(purchaseIds: string[]): Promise<PurchaseItem[]> {
    if (purchaseIds.length === 0) return [];
    const results: PurchaseItem[] = [];
    const chunkSize = 100;
    for (let i = 0; i < purchaseIds.length; i += chunkSize) {
      const chunk = purchaseIds.slice(i, i + chunkSize);
      const items = await this.dbDriver.findMany('purchase_items', {
        purchase_id: { $in: chunk }
      }, {
        operators: { purchase_id: '$in' }
      } as any);
      results.push(...items.filter((item: any) => !item.deleted_at));
    }
    return results;
  }

  async getSupplierPayments(purchaseId: string): Promise<SupplierPayment[]> {
    const list = await this.dbDriver.findMany('supplier_payments', { purchase_id: purchaseId });
    return list.filter((p: any) => !p.deleted_at) as SupplierPayment[];
  }

  async getPayments(cafeId: string): Promise<SupplierPayment[]> {
    const list = await this.dbDriver.findMany('supplier_payments');
    return list.filter((p: any) => !p.deleted_at) as SupplierPayment[];
  }
}
