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
 * Checks if there is already a closing for today's date.
 */
export async function getTodayClosing(cafeId: string): Promise<DailyClosing | undefined> {
  const today = new Date().toISOString().split('T')[0];
  return await db.daily_closings
    .where('cafe_id')
    .equals(cafeId)
    .filter(c => c.closing_date === today)
    .first();
}

export interface ClosingReport {
  closing: DailyClosing;
  items: DailyClosingItem[];
}

/**
 * Aggregates all PAID orders for today and creates a DailyClosing snapshot.
 * This is the main "Close Day" action.
 */
export async function closingDay(cafeId: string): Promise<ClosingReport> {
  const today = new Date().toISOString().split('T')[0];

  // Check for duplicate
  const existing = await getTodayClosing(cafeId);
  if (existing) {
    const items = await getDailyClosingItems(existing.id);
    return { closing: existing, items };
  }

  // 1. Find all paid orders for today
  const todayOrders = await db.orders
    .where('cafe_id')
    .equals(cafeId)
    .filter(o => o.status === 'paid' && o.created_at.startsWith(today))
    .toArray();

  if (todayOrders.length === 0) {
    throw new Error('No paid orders found for today to close.');
  }

  const orderIds = todayOrders.map(o => o.id);
  const totalSales = todayOrders.reduce((sum, o) => sum + o.total_amount, 0);

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

  // 4. Create the DailyClosing record
  const closingId = crypto.randomUUID();
  const closing: DailyClosing = {
    id: closingId,
    cafe_id: cafeId,
    closing_date: today,
    total_sales: totalSales,
    total_orders: todayOrders.length,
    created_at: new Date().toISOString(),
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
    await db.daily_closings.add(closing);
    await db.daily_closing_items.bulkAdd(closingItems);
    await enqueueSync('insert', 'daily_closings', closing as unknown as Record<string, unknown>);
    for (const item of closingItems) {
      await enqueueSync('insert', 'daily_closing_items', item as unknown as Record<string, unknown>);
    }
  });

  return { closing, items: closingItems };
}
