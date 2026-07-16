import { orderRepository, purchaseRepository, supplierRepository } from '../../../infrastructure/repositories/index';
import type { Order, OrderItem } from '../../../domain/entities/order';
import type { Purchase, PurchaseItem, Supplier } from '../../../domain/entities/supplier';

export interface SalesInvoiceWithItems extends Order {
  items: OrderItem[];
}

export interface PurchaseWithDetails extends Purchase {
  supplierName: string;
  items: PurchaseItem[];
}

/**
 * Retrieves all sales invoices along with their order items for a given cafe.
 * Decouples presentation layer from direct repository and schema access.
 */
export async function getSalesInvoicesData(cafeId: string): Promise<SalesInvoiceWithItems[]> {
  const [orders, allItems] = await Promise.all([
    orderRepository.getOrders(cafeId),
    orderRepository.getAllOrderItems()
  ]);

  const itemsByOrderId: Record<string, OrderItem[]> = {};
  for (const item of allItems) {
    if (!itemsByOrderId[item.order_id]) {
      itemsByOrderId[item.order_id] = [];
    }
    itemsByOrderId[item.order_id].push(item);
  }

  return orders.map(order => ({
    ...order,
    items: itemsByOrderId[order.id] || []
  }));
}

/**
 * Retrieves supplier purchases with supplier names and purchase items.
 */
export async function getSupplierInvoicesData(cafeId: string): Promise<PurchaseWithDetails[]> {
  const [purchases, suppliers] = await Promise.all([
    purchaseRepository.getPurchases(cafeId),
    supplierRepository.getSuppliers(cafeId)
  ]);

  const purchaseIds = purchases.map(p => p.id);
  const allItems = await purchaseRepository.getPurchaseItemsByPurchaseIds(purchaseIds);

  const supplierMap: Record<string, Supplier> = {};
  for (const s of suppliers) {
    supplierMap[s.id] = s;
  }

  const itemsByPurchaseId: Record<string, PurchaseItem[]> = {};
  for (const item of allItems) {
    if (!itemsByPurchaseId[item.purchase_id]) {
      itemsByPurchaseId[item.purchase_id] = [];
    }
    itemsByPurchaseId[item.purchase_id].push(item);
  }

  return purchases.map(purchase => ({
    ...purchase,
    supplierName: supplierMap[purchase.supplier_id]?.name || 'Unknown Supplier',
    items: itemsByPurchaseId[purchase.id] || []
  }));
}
