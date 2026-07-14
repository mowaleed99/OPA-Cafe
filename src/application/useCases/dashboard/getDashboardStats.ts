import { orderRepository, closingRepository } from '../../../infrastructure/repositories/index';
import type { DailyClosing } from '../../../domain/entities/daily_closing';

export interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  todayAverageOrder: number;
  weekSales: number;
  recentClosings: DailyClosing[];
}

export async function getDashboardStats(cafeId: string): Promise<DashboardStats> {
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Today's paid orders (live)
  const allOrders = await orderRepository.getOrders(cafeId);
  const todayOrders = allOrders.filter(o => o.status === 'paid' && o.created_at.startsWith(today));

  const todaySales = todayOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const todayOrderCount = todayOrders.length;
  const todayAverageOrder = todayOrderCount > 0 ? todaySales / todayOrderCount : 0;

  // This week's closings for the chart
  const allClosings = await closingRepository.getClosings(cafeId);
  const recentClosings = allClosings
    .filter(c => c.closing_date >= weekAgo)
    .sort((a, b) => a.closing_date.localeCompare(b.closing_date));

  const weekSales = recentClosings.reduce((sum, c) => sum + c.total_sales, 0);

  return {
    todaySales,
    todayOrders: todayOrderCount,
    todayAverageOrder,
    weekSales,
    recentClosings,
  };
}
