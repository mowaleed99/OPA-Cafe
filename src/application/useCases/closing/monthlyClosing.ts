import { db } from '../../../infrastructure/database/db';
import type { DailyClosing, DailyClosingItem } from '../../../core/entities/daily_closing';

export interface MonthlyClosingReport {
  month: string;
  total_sales: number;
  total_orders: number;
  closings: DailyClosing[];
  aggregatedItems: Record<string, { quantity: number; revenue: number }>;
}

/**
 * Fetch all daily closings for a cafe in a given month (YYYY-MM).
 */
export async function getMonthlyClosing(cafeId: string, monthPrefix: string): Promise<MonthlyClosingReport> {
  const closings = await db.daily_closings
    .where('cafe_id')
    .equals(cafeId)
    .filter(c => c.closing_date.startsWith(monthPrefix))
    .sortBy('closing_date');
    
  let total_sales = 0;
  let total_orders = 0;
  const aggregatedItems: Record<string, { quantity: number; revenue: number }> = {};
  
  if (closings.length === 0) {
    return { month: monthPrefix, total_sales, total_orders, closings, aggregatedItems };
  }

  const closingIds = closings.map(c => c.id);
  const items = await db.daily_closing_items
    .where('daily_closing_id')
    .anyOf(closingIds)
    .toArray();

  for (const c of closings) {
    total_sales += c.total_sales;
    total_orders += c.total_orders;
  }

  for (const item of items) {
    if (!aggregatedItems[item.product_id]) {
      aggregatedItems[item.product_id] = { quantity: 0, revenue: 0 };
    }
    aggregatedItems[item.product_id].quantity += item.quantity_sold;
    aggregatedItems[item.product_id].revenue += item.total_revenue;
  }

  return { month: monthPrefix, total_sales, total_orders, closings, aggregatedItems };
}
