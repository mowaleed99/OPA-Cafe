import { db } from '../../../infrastructure/database/db';
import { enqueueSync } from '../../sync/syncQueue';
import type { Purchase, PurchaseItem, SupplierPayment } from '../../../core/entities/supplier';

export interface PurchaseWithItems {
  purchase: Purchase;
  items: PurchaseItem[];
  payments: SupplierPayment[];
}

export interface CreatePurchaseParams {
  cafeId: string;
  supplierId: string;
  items: Array<{ inventoryItemId: string; itemName?: string; quantity: number; unitCost: number }>;
}

export async function getPurchases(cafeId: string): Promise<Purchase[]> {
  const purchases = await db.purchases.where('cafe_id').equals(cafeId).sortBy('created_at');
  return purchases.reverse();
}

export async function getPurchaseDetails(purchaseId: string): Promise<PurchaseWithItems | null> {
  const purchase = await db.purchases.get(purchaseId);
  if (!purchase) return null;
  const [items, payments] = await Promise.all([
    db.purchase_items.where('purchase_id').equals(purchaseId).toArray(),
    db.supplier_payments.where('purchase_id').equals(purchaseId).toArray(),
  ]);
  return { purchase, items, payments };
}

export async function createPurchase(params: CreatePurchaseParams): Promise<Purchase> {
  const purchaseId = crypto.randomUUID();
  const now = new Date().toISOString();

  const purchaseItems: PurchaseItem[] = params.items.map(item => ({
    id: crypto.randomUUID(),
    purchase_id: purchaseId,
    inventory_item_id: item.inventoryItemId,
    item_name: item.itemName,
    quantity: item.quantity,
    unit_cost: item.unitCost,
    subtotal: item.quantity * item.unitCost,
  }));

  const totalAmount = purchaseItems.reduce((sum, i) => sum + i.subtotal, 0);

  const purchase: Purchase = {
    id: purchaseId,
    cafe_id: params.cafeId,
    supplier_id: params.supplierId,
    total_amount: totalAmount,
    amount_paid: 0,
    amount_remaining: totalAmount,
    payment_status: 'unpaid',
    created_at: now,
  };

  await db.transaction('rw', db.purchases, db.purchase_items, db.inventory_items, db.sync_queue, async () => {
    await db.purchases.add(purchase);
    await db.purchase_items.bulkAdd(purchaseItems);
    await enqueueSync('insert', 'purchases', purchase as unknown as Record<string, unknown>);
    
    for (const item of purchaseItems) {
      await enqueueSync('insert', 'purchase_items', item as unknown as Record<string, unknown>);
      
      // Update inventory stock
      const inventoryItem = await db.inventory_items.get(item.inventory_item_id);
      if (inventoryItem) {
        const updatedItem = {
          ...inventoryItem,
          stock_quantity: inventoryItem.stock_quantity + item.quantity
        };
        await db.inventory_items.put(updatedItem);
        await enqueueSync('update', 'inventory_items', updatedItem as unknown as Record<string, unknown>);
      }
    }
  });

  return purchase;
}

export async function recordPayment(
  purchase: Purchase,
  amount: number,
  notes?: string
): Promise<{ purchase: Purchase; payment: SupplierPayment }> {
  const newAmountPaid = purchase.amount_paid + amount;
  const newAmountRemaining = purchase.total_amount - newAmountPaid;
  const newStatus = newAmountRemaining <= 0 ? 'paid' : 'partial';

  const updatedPurchase: Purchase = {
    ...purchase,
    amount_paid: newAmountPaid,
    amount_remaining: Math.max(0, newAmountRemaining),
    payment_status: newStatus,
  };

  const payment: SupplierPayment = {
    id: crypto.randomUUID(),
    purchase_id: purchase.id,
    supplier_id: purchase.supplier_id,
    amount,
    payment_date: new Date().toISOString().split('T')[0],
    notes: notes || null,
  };

  await db.transaction('rw', db.purchases, db.supplier_payments, db.sync_queue, async () => {
    await db.purchases.put(updatedPurchase);
    await db.supplier_payments.add(payment);
    await enqueueSync('update', 'purchases', updatedPurchase as unknown as Record<string, unknown>);
    await enqueueSync('insert', 'supplier_payments', payment as unknown as Record<string, unknown>);
  });

  return { purchase: updatedPurchase, payment };
}
