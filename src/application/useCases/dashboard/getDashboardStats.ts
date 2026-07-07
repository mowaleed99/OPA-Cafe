import { db } from '../../../infrastructure/database/db';
import type { DailyClosing } from '../../../core/entities/daily_closing';

export interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  todayAverageOrder: number;
  weekSales: number;
  recentClosings: DailyClosing[];
}

/**
 * Aggregates paid orders for today (live, not from closing snapshot)
 * plus recent closing history for the dashboard.
 */
export async function getDashboardStats(cafeId: string): Promise<DashboardStats> {
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Today's paid orders (live)
  const todayOrders = await db.orders
    .where('cafe_id')
    .equals(cafeId)
    .filter(o => o.status === 'paid' && o.created_at.startsWith(today))
    .toArray();

  const todaySales = todayOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const todayOrderCount = todayOrders.length;
  const todayAverageOrder = todayOrderCount > 0 ? todaySales / todayOrderCount : 0;

  // This week's closings for the chart
  const recentClosings = await db.daily_closings
    .where('cafe_id')
    .equals(cafeId)
    .filter(c => c.closing_date >= weekAgo)
    .sortBy('closing_date');

  const weekSales = recentClosings.reduce((sum, c) => sum + c.total_sales, 0);

  return {
    todaySales,
    todayOrders: todayOrderCount,
    todayAverageOrder,
    weekSales,
    recentClosings,
  };
}
