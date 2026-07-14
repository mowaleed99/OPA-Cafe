import { enqueueSync } from '../../sync/syncQueue';
import { createRepository } from '../../../infrastructure/repositories/RepositoryFactory';
import type { DailyClosing, DailyClosingItem } from '../../../domain/entities/daily_closing';
import type { Order, OrderItem } from '../../../domain/entities/order';
import type { Supplier, SupplierPayment } from '../../../domain/entities/supplier';

export async function getDailyClosings(cafeId: string): Promise<DailyClosing[]> {
  const repo = createRepository<DailyClosing>('daily_closings');
  const closings = await repo.findMany({ cafe_id: cafeId });
  return closings.sort((a, b) => b.closing_date.localeCompare(a.closing_date));
}

export async function getDailyClosingItems(dailyClosingId: string): Promise<DailyClosingItem[]> {
  const repo = createRepository<DailyClosingItem>('daily_closing_items');
  return await repo.findMany({ daily_closing_id: dailyClosingId });
}

export async function getClosingByDate(cafeId: string, date: string): Promise<DailyClosing | undefined> {
  const repo = createRepository<DailyClosing>('daily_closings');
  const closings = await repo.findMany({ cafe_id: cafeId });
  return closings.find(c => c.closing_date === date);
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
  const closingsRepo = createRepository<DailyClosing>('daily_closings');
  const itemsRepo = createRepository<DailyClosingItem>('daily_closing_items');
  const orderRepo = createRepository<Order>('orders');
  const orderItemsRepo = createRepository<OrderItem>('order_items');
  const suppliersRepo = createRepository<Supplier>('suppliers');
  const paymentsRepo = createRepository<SupplierPayment>('supplier_payments');

  // Check for existing duplicate and update it if necessary
  const existing = await getClosingByDate(cafeId, selectedDate);
  const closingId = existing ? existing.id : crypto.randomUUID();

  // Determine time window for this closing
  let startTime = '1970-01-01T00:00:00.000Z';
  let endTime = new Date().toISOString();

  const allClosings = await closingsRepo.findMany({ cafe_id: cafeId });
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
  const allOrders = await orderRepo.findMany({ cafe_id: cafeId });
  const shiftOrders = allOrders.filter(o => o.status === 'paid' && o.created_at > startTime && o.created_at <= endTime);

  if (shiftOrders.length === 0 && !existing) {
    throw new Error(`No paid orders found since the last closing to close for ${selectedDate}.`);
  }

  const orderIds = new Set(shiftOrders.map(o => o.id));
  const totalSales = shiftOrders.reduce((sum, o) => sum + o.total_amount, 0);

  // 2. Get all order items for those orders
  const allOrderItems = await orderItemsRepo.findMany();
  const shiftOrderItems = allOrderItems.filter(i => orderIds.has(i.order_id));

  // 3. Aggregate per product
  const productTotals: Record<string, { quantity: number; revenue: number }> = {};
  for (const item of shiftOrderItems) {
    if (!productTotals[item.product_id]) {
      productTotals[item.product_id] = { quantity: 0, revenue: 0 };
    }
    productTotals[item.product_id].quantity += item.quantity;
    productTotals[item.product_id].revenue += item.subtotal;
  }

  // 4. Find all supplier payments (expenses) within the time window
  const allPayments = await paymentsRepo.findMany();
  const shiftPayments = allPayments.filter(p => p.payment_date.startsWith(selectedDate));
    
  const cafeSuppliers = await suppliersRepo.findMany({ cafe_id: cafeId });
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

  // 6. Write to DB and sync
  if (existing) {
    await closingsRepo.update(closingId, closing);
    
    const oldItems = await itemsRepo.findMany({ daily_closing_id: closingId });
    for (const oldItem of oldItems) {
      await itemsRepo.delete(oldItem.id);
      await enqueueSync('delete', 'daily_closing_items', { id: oldItem.id });
    }
    
    await itemsRepo.insertMany(closingItems);
    
    await enqueueSync('update', 'daily_closings', closing as unknown as Record<string, unknown>);
    for (const item of closingItems) {
      await enqueueSync('insert', 'daily_closing_items', item as unknown as Record<string, unknown>);
    }
  } else {
    await closingsRepo.insert(closing);
    await itemsRepo.insertMany(closingItems);
    await enqueueSync('insert', 'daily_closings', closing as unknown as Record<string, unknown>);
    for (const item of closingItems) {
      await enqueueSync('insert', 'daily_closing_items', item as unknown as Record<string, unknown>);
    }
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
  const suppliersRepo = createRepository<Supplier>('suppliers');
  const paymentsRepo = createRepository<SupplierPayment>('supplier_payments');

  const allPayments = await paymentsRepo.findMany();
  const shiftPayments = allPayments.filter(p => p.payment_date.startsWith(selectedDate));
    
  const cafeSuppliers = await suppliersRepo.findMany({ cafe_id: cafeId });
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

