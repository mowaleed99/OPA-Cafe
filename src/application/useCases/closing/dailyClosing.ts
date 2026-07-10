import { db } from '../../../infrastructure/database/db';
import { enqueueSync } from '../../sync/syncQueue';
import type { DailyClosing, DailyClosingItem } from '../../../core/entities/daily_closing';

/**
 * Fetch all daily closings for a cafe, sorted newest first.
 */
export async function getDailyClosings(cafeId: string): Promise<DailyClosing[]> {
  const closings = await db.daily_closings
    .where('cafe_id')
    .equals(cafeId)
    .sortBy('closing_date');
  return closings.reverse();
}

/**
 * Fetch the line items for a given closing.
 */
export async function getDailyClosingItems(dailyClosingId: string): Promise<DailyClosingItem[]> {
  return await db.daily_closing_items
    .where('daily_closing_id')
    .equals(dailyClosingId)
    .toArray();
}

/**
 * Checks if there is already a closing for a specific date.
 */
export async function getClosingByDate(cafeId: string, date: string): Promise<DailyClosing | undefined> {
  return await db.daily_closings
    .where('cafe_id')
    .equals(cafeId)
    .filter(c => c.closing_date === date)
    .first();
}

/**
 * Checks if there is already a closing for today's date (legacy support/convenience).
 */
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

  if (existing) {
    // If it exists, find the closing right before it to get the start time
    const allClosings = await db.daily_closings
      .where('cafe_id')
      .equals(cafeId)
      .sortBy('created_at');
    
    const currentIndex = allClosings.findIndex(c => c.id === existing.id);
    if (currentIndex > 0) {
      startTime = allClosings[currentIndex - 1].created_at;
    }
    endTime = existing.created_at; // keep the original end time window
  } else {
    // If it's new, find the latest closing for the start time
    const allClosings = await db.daily_closings
      .where('cafe_id')
      .equals(cafeId)
      .sortBy('created_at');
    
    if (allClosings.length > 0) {
      startTime = allClosings[allClosings.length - 1].created_at;
    }
  }

  // 1. Find all paid orders within the time window
  const shiftOrders = await db.orders
    .where('cafe_id')
    .equals(cafeId)
    .filter(o => o.status === 'paid' && o.created_at > startTime && o.created_at <= endTime)
    .toArray();

  if (shiftOrders.length === 0 && !existing) {
    throw new Error(`No paid orders found since the last closing to close for ${selectedDate}.`);
  }

  const orderIds = shiftOrders.map(o => o.id);
  const totalSales = shiftOrders.reduce((sum, o) => sum + o.total_amount, 0);

  // 2. Get all order items for those orders
  const allOrderItems = await db.order_items
    .where('order_id')
    .anyOf(orderIds)
    .toArray();

  // 3. Aggregate per product
  const productTotals: Record<string, { quantity: number; revenue: number }> = {};
  for (const item of allOrderItems) {
    if (!productTotals[item.product_id]) {
      productTotals[item.product_id] = { quantity: 0, revenue: 0 };
    }
    productTotals[item.product_id].quantity += item.quantity;
    productTotals[item.product_id].revenue += item.subtotal;
  }

  // 4. Find all supplier payments (expenses) within the time window
  const shiftPayments = await db.supplier_payments
    .filter(p => {
      // payment_date is usually just YYYY-MM-DD but we'll use created_at if possible.
      // Wait, supplier_payments doesn't have created_at. Let's filter by payment_date string matching or just date comparison.
      // If payment_date is YYYY-MM-DD, we can check if it matches selectedDate, or falls within startTime/endTime if it has time.
      // Assuming payment_date is YYYY-MM-DD, we can just match selectedDate.
      return p.payment_date.startsWith(selectedDate);
    })
    .toArray();
    
  // Filter shift payments by cafe_id? supplier_payments don't have cafe_id directly, we need to join or assume they belong to this cafe based on suppliers.
  // Actually, let's get all suppliers for this cafe first.
  const cafeSuppliers = await db.suppliers.where('cafe_id').equals(cafeId).toArray();
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

  // 6. Write to Dexie and sync
  await db.transaction('rw', db.daily_closings, db.daily_closing_items, db.sync_queue, async () => {
    if (existing) {
      await db.daily_closings.put(closing);
      
      // Fetch and delete old items
      const oldItems = await db.daily_closing_items.where('daily_closing_id').equals(closingId).toArray();
      const oldItemIds = oldItems.map(i => i.id);
      await db.daily_closing_items.bulkDelete(oldItemIds);
      
      for (const oldItem of oldItems) {
        await enqueueSync('delete', 'daily_closing_items', oldItem as unknown as Record<string, unknown>);
      }
      
      await db.daily_closing_items.bulkAdd(closingItems);
      
      await enqueueSync('update', 'daily_closings', closing as unknown as Record<string, unknown>);
      for (const item of closingItems) {
        await enqueueSync('insert', 'daily_closing_items', item as unknown as Record<string, unknown>);
      }
    } else {
      await db.daily_closings.add(closing);
      await db.daily_closing_items.bulkAdd(closingItems);
      await enqueueSync('insert', 'daily_closings', closing as unknown as Record<string, unknown>);
      for (const item of closingItems) {
        await enqueueSync('insert', 'daily_closing_items', item as unknown as Record<string, unknown>);
      }
    }
  });

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
  const shiftPayments = await db.supplier_payments
    .filter(p => p.payment_date.startsWith(selectedDate))
    .toArray();
    
  const cafeSuppliers = await db.suppliers.where('cafe_id').equals(cafeId).toArray();
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

