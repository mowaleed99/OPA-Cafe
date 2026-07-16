import { Purchase, PurchaseItem, SupplierPayment } from '../entities/supplier';

export interface IPurchaseRepository {
  getPurchases(cafeId: string): Promise<Purchase[]>;
  getPurchaseById(id: string): Promise<Purchase | null>;
  getPurchaseItems(purchaseId: string): Promise<PurchaseItem[]>;
  getPurchaseItemsByPurchaseIds(purchaseIds: string[]): Promise<PurchaseItem[]>;
  getSupplierPayments(purchaseId: string): Promise<SupplierPayment[]>;
  getPayments(cafeId: string): Promise<SupplierPayment[]>;
}
