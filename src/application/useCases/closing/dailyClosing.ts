import { buildSyncOperation } from '../../sync/syncQueue';
import { closingRepository, orderRepository, supplierRepository, purchaseRepository } from '../../../infrastructure/repositories/index';
import { executeTransaction, TransactionOperation } from '../../../infrastructure/database/transaction';
import type { DailyClosing, DailyClosingItem } from '../../../domain/entities/daily_closing';

export async function getDailyClosings(cafeId: string): Promise<DailyClosing[]> {
  return await closingRepository.getClosings(cafeId);
}

export async function getDailyClosingItems(dailyClosingId: string): Promise<DailyClosingItem[]> {
  return await closingRepository.getClosingItems(dailyClosingId);
}

export async function getClosingByDate(cafeId: string, date: string): Promise<DailyClosing | undefined> {
  const closing = await closingRepository.getClosingByDate(cafeId, date);
  return closing || undefined;
}

export async function getTodayClosing(cafeId: string): Promise<DailyClosing | undefined> {
  const today = new Date().toISOString().split('T')[0];
  return getClosingByDate(cafeId, today);
}

export interface ClosingReport {
  closing: DailyClosing;
  items: DailyClosingItem[];
  expenses: number;
  payments?: any[]; // Array of payments with supplier details
}

export async function closingDay(cafeId: string, selectedDate: string = new Date().toISOString().split('T')[0]): Promise<ClosingReport> {
  // Check for existing duplicate and update it if necessary
  const existing = await getClosingByDate(cafeId, selectedDate);
  const closingId = existing ? existing.id : crypto.randomUUID();

  // Determine time window for this closing
  let startTime = '1970-01-01T00:00:00.000Z';
  let endTime = new Date().toISOString();

  const allClosings = await closingRepository.getClosings(cafeId);
  // sort ascending by created_at for time window logic
  allClosings.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  if (existing) {
    const currentIndex = allClosings.findIndex(c => c.id === existing.id);
    if (currentIndex > 0) {
      startTime = allClosings[currentIndex - 1].created_at;
    }
    endTime = existing.created_at;
  } else {
    if (allClosings.length > 0) {
      startTime = allClosings[allClosings.length - 1].created_at;
    }
  }

  // 1. Find all paid orders within the time window
  const allOrders = await orderRepository.getOrders(cafeId);
  const shiftOrders = allOrders.filter(o => o.status === 'paid' && o.created_at > startTime && o.created_at <= endTime);

  if (shiftOrders.length === 0 && !existing) {
    throw new Error(`No paid orders found since the last closing to close for ${selectedDate}.`);
  }

  const orderIds = new Set(shiftOrders.map(o => o.id));
  const totalSales = shiftOrders.reduce((sum, o) => sum + o.total_amount, 0);

  // 2. Get all order items for those orders
  const productTotals: Record<string, { quantity: number; revenue: number }> = {};
  for (const orderId of orderIds) {
    const items = await orderRepository.getOrderItems(orderId);
    for (const item of items) {
      if (!productTotals[item.product_id]) {
        productTotals[item.product_id] = { quantity: 0, revenue: 0 };
      }
      productTotals[item.product_id].quantity += item.quantity;
      productTotals[item.product_id].revenue += item.subtotal;
    }
  }

  // 4. Find all supplier payments (expenses) within the time window
  const allPayments = await purchaseRepository.getPayments(cafeId);
  const shiftPayments = allPayments.filter(p => p.payment_date.startsWith(selectedDate));
    
  const cafeSuppliers = await supplierRepository.getSuppliers(cafeId);
  const cafeSupplierIds = new Set(cafeSuppliers.map(s => s.id));
  
  const cafeShiftPayments = shiftPayments.filter(p => cafeSupplierIds.has(p.supplier_id));
  const totalExpenses = cafeShiftPayments.reduce((sum, p) => sum + p.amount, 0);

  const closing: DailyClosing = {
    id: closingId,
    cafe_id: cafeId,
    closing_date: selectedDate,
    total_sales: totalSales,
    total_orders: shiftOrders.length,
    total_expenses: totalExpenses,
    created_at: existing ? existing.created_at : endTime,
  };

  // 5. Build line items
  const closingItems: DailyClosingItem[] = Object.entries(productTotals).map(([productId, agg]) => ({
    id: crypto.randomUUID(),
    daily_closing_id: closingId,
    product_id: productId,
    quantity_sold: agg.quantity,
    total_revenue: agg.revenue,
  }));

  const ops: TransactionOperation[] = [];

  // 6. Write to DB and sync
  if (existing) {
    ops.push({ type: 'update', table: 'daily_closings', id: closingId, data: closing });
    ops.push(buildSyncOperation('update', 'daily_closings', closing as unknown as Record<string, unknown>));

    const oldItems = await closingRepository.getClosingItems(closingId);
    for (const oldItem of oldItems) {
      ops.push({ type: 'delete', table: 'daily_closing_items', id: oldItem.id });
      ops.push(buildSyncOperation('delete', 'daily_closing_items', { id: oldItem.id }));
    }
    
    if (closingItems.length > 0) {
      ops.push({ type: 'insertMany', table: 'daily_closing_items', data: closingItems });
      for (const item of closingItems) {
        ops.push(buildSyncOperation('insert', 'daily_closing_items', item as unknown as Record<string, unknown>));
      }
    }
  } else {
    ops.push({ type: 'insert', table: 'daily_closings', data: closing });
    ops.push(buildSyncOperation('insert', 'daily_closings', closing as unknown as Record<string, unknown>));

    if (closingItems.length > 0) {
      ops.push({ type: 'insertMany', table: 'daily_closing_items', data: closingItems });
      for (const item of closingItems) {
        ops.push(buildSyncOperation('insert', 'daily_closing_items', item as unknown as Record<string, unknown>));
      }
    }
  }

  await executeTransaction(ops);

  if (navigator.onLine && window.electronAPI) {
    window.electronAPI.triggerSync();
  }

  const enrichedPayments = cafeShiftPayments.map(p => {
    const supplier = cafeSuppliers.find(s => s.id === p.supplier_id);
    return {
      ...p,
      supplierName: supplier ? supplier.name : 'Unknown Supplier',
    };
  });

  return { closing, items: closingItems, expenses: totalExpenses, payments: enrichedPayments };
}

export async function getClosingPayments(cafeId: string, selectedDate: string) {
  const allPayments = await purchaseRepository.getPayments(cafeId);
  const shiftPayments = allPayments.filter(p => p.payment_date.startsWith(selectedDate));
    
  const cafeSuppliers = await supplierRepository.getSuppliers(cafeId);
  const cafeSupplierIds = new Set(cafeSuppliers.map(s => s.id));
  
  const cafeShiftPayments = shiftPayments.filter(p => cafeSupplierIds.has(p.supplier_id));
  
  return cafeShiftPayments.map(p => {
    const supplier = cafeSuppliers.find(s => s.id === p.supplier_id);
    return {
      ...p,
      supplierName: supplier ? supplier.name : 'Unknown Supplier',
    };
  });
}

