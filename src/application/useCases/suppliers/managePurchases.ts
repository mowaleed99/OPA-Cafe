import { buildSyncOperation, enqueueSync } from '../../sync/syncQueue';
import { purchaseRepository, inventoryRepository } from '../../../infrastructure/repositories/index';
import { executeTransaction, TransactionOperation } from '../../../infrastructure/database/transaction';
import type { Purchase, PurchaseItem, SupplierPayment } from '../../../domain/entities/supplier';

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
  return await purchaseRepository.getPurchases(cafeId);
}

export async function getPurchaseDetails(purchaseId: string): Promise<PurchaseWithItems | null> {
  const purchase = await purchaseRepository.getPurchaseById(purchaseId);
  if (!purchase) return null;
  const [items, payments] = await Promise.all([
    purchaseRepository.getPurchaseItems(purchaseId),
    purchaseRepository.getSupplierPayments(purchaseId),
  ]);
  return { purchase, items, payments };
}

export async function createPurchase(params: CreatePurchaseParams): Promise<Purchase> {
  if (!params.items || params.items.length === 0) {
    throw new Error('Purchase must contain at least one item');
  }

  const purchaseId = crypto.randomUUID();
  const now = new Date().toISOString();

  const purchaseItems: PurchaseItem[] = params.items.map(item => {
    if (item.quantity <= 0) throw new Error(`Invalid quantity for item ${item.itemName || item.inventoryItemId}`);
    if (item.unitCost < 0) throw new Error(`Invalid unit cost for item ${item.itemName || item.inventoryItemId}`);

    return {
      id: crypto.randomUUID(),
      purchase_id: purchaseId,
      inventory_item_id: item.inventoryItemId,
      item_name: item.itemName,
      quantity: item.quantity,
      unit_cost: item.unitCost,
      subtotal: item.quantity * item.unitCost,
    };
  });

  const totalAmount = purchaseItems.reduce((sum, i) => sum + i.subtotal, 0);

  const purchase: Purchase = {
    id: purchaseId,
    cafe_id: params.cafeId,
    supplier_id: params.supplierId,
    total_amount: totalAmount,
    amount_paid: 0,
    amount_remaining: totalAmount,
    payment_status: 'unpaid',
    date: now,
    created_at: now,
  };

  const ops: TransactionOperation[] = [];

  const dbPurchase = { ...purchase };
  delete (dbPurchase as any).amount_remaining;

  ops.push({ type: 'insert', table: 'purchases', data: dbPurchase });
  ops.push(buildSyncOperation('insert', 'purchases', purchase as unknown as Record<string, unknown>));

  if (purchaseItems.length > 0) {
    ops.push({ type: 'insertMany', table: 'purchase_items', data: purchaseItems });
    for (const item of purchaseItems) {
      ops.push(buildSyncOperation('insert', 'purchase_items', item as unknown as Record<string, unknown>));
      
      // Update inventory stock
      const inventoryItem = await inventoryRepository.findOne(item.inventory_item_id);
      if (inventoryItem) {
        const updatedItem = {
          ...inventoryItem,
          stock_quantity: inventoryItem.stock_quantity + item.quantity
        };
        ops.push({ type: 'update', table: 'inventory_items', id: updatedItem.id, data: updatedItem });
        ops.push(buildSyncOperation('update', 'inventory_items', updatedItem as unknown as Record<string, unknown>));
      }
    }
  }

  await executeTransaction(ops);
  
  // Trigger background sync processing if online
  if (navigator.onLine && window.electronAPI) {
    window.electronAPI.triggerSync();
  }

  return purchase;
}

export async function recordPayment(
  purchase: Purchase,
  amount: number,
  notes?: string,
  paymentMethod: string = 'cash'
): Promise<{ purchase: Purchase; payment: SupplierPayment }> {
  if (amount <= 0) {
    throw new Error('Payment amount must be greater than zero');
  }

  const newAmountPaid = purchase.amount_paid + amount;
  const newAmountRemaining = purchase.total_amount - newAmountPaid;
  const newStatus = newAmountRemaining <= 0 ? 'paid' : 'partial';

  const updatedPurchase: Purchase = {
    ...purchase,
    amount_paid: newAmountPaid,
    amount_remaining: Math.max(0, newAmountRemaining),
    payment_status: newStatus,
  };

  const now = new Date().toISOString();
  const payment: SupplierPayment = {
    id: crypto.randomUUID(),
    cafe_id: purchase.cafe_id,
    purchase_id: purchase.id,
    supplier_id: purchase.supplier_id,
    amount,
    payment_method: paymentMethod,
    date: now.split('T')[0],
    notes: notes || null,
    created_at: now,
  };

  const dbPurchase = { ...updatedPurchase };
  delete (dbPurchase as any).amount_remaining;

  const ops: TransactionOperation[] = [
    { type: 'update', table: 'purchases', id: updatedPurchase.id, data: dbPurchase },
    buildSyncOperation('update', 'purchases', updatedPurchase as unknown as Record<string, unknown>),
    { type: 'insert', table: 'supplier_payments', data: payment },
    buildSyncOperation('insert', 'supplier_payments', payment as unknown as Record<string, unknown>)
  ];

  await executeTransaction(ops);

  if (navigator.onLine && window.electronAPI) {
    window.electronAPI.triggerSync();
  }

  return { purchase: updatedPurchase, payment };
}
