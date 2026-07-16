import type { AnalyticsRawData } from '../useCases/reports/getAnalytics';
import type { Order, OrderItem } from '../../domain/entities/order';
import type { Expense } from '../../domain/entities/expense';

export interface FilterOptions {
  dateRange: string;
  customStart?: string;
  customEnd?: string;
  categoryFilter: string;
  paymentFilter: string;
}

export interface FilteredAnalyticsData {
  orders: Order[];
  items: OrderItem[];
  expenses: Expense[];
}

export interface ProductPerformanceItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  revenue: number;
}

export interface AnalyticsMetrics {
  totalRevenue: number;
  totalOrders: number;
  salesChartData: Array<{ date: string; total: number }>;
  productArray: ProductPerformanceItem[];
  topProductsByRev: ProductPerformanceItem[];
  totalExpenses: number;
  expenseChartData: Array<{ name: string; value: number }>;
}

export class ReportingAnalyticsService {
  static filterData(analytics: AnalyticsRawData, options: FilterOptions): FilteredAnalyticsData {
    const now = new Date();
    let startStr = '1970-01-01';
    let endStr = '2999-12-31';

    if (options.dateRange === 'today') {
      startStr = now.toISOString().split('T')[0];
      endStr = startStr;
    } else if (options.dateRange === 'this_week') {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      startStr = start.toISOString().split('T')[0];
      endStr = now.toISOString().split('T')[0];
    } else if (options.dateRange === 'this_month') {
      startStr = now.toISOString().slice(0, 7) + '-01';
      endStr = now.toISOString().split('T')[0];
    } else if (options.dateRange === 'custom') {
      startStr = options.customStart || '1970-01-01';
      endStr = options.customEnd || '2999-12-31';
    }

    const filteredOrders = analytics.orders.filter(o =>
      o.status === 'paid' &&
      o.created_at.split('T')[0] >= startStr &&
      o.created_at.split('T')[0] <= endStr &&
      (options.paymentFilter === 'all' || o.payment_method === options.paymentFilter)
    );

    const orderIds = new Set(filteredOrders.map(o => o.id));
    let filteredItems = analytics.orderItems.filter(i => orderIds.has(i.order_id));

    if (options.categoryFilter !== 'all') {
      filteredItems = filteredItems.filter(i => {
        const p = analytics.products.find(prod => prod.id === i.product_id);
        return p && p.category_id === options.categoryFilter;
      });
    }

    const filteredExpenses = analytics.expenses.filter(e =>
      e.date >= startStr && e.date <= endStr
    );

    return { orders: filteredOrders, items: filteredItems, expenses: filteredExpenses };
  }

  static calculateMetrics(filteredData: FilteredAnalyticsData, analytics: AnalyticsRawData): AnalyticsMetrics {
    const totalRevenue = filteredData.orders.reduce((sum, o) => sum + o.total_amount, 0);
    const totalOrders = filteredData.orders.length;

    const salesByDate: Record<string, number> = {};
    filteredData.orders.forEach(o => {
      const d = o.created_at.split('T')[0];
      salesByDate[d] = (salesByDate[d] || 0) + o.total_amount;
    });
    const salesChartData = Object.entries(salesByDate)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, total]) => ({ date, total }));

    const productStats: Record<string, { qty: number; rev: number }> = {};
    filteredData.items.forEach(i => {
      if (!productStats[i.product_id]) productStats[i.product_id] = { qty: 0, rev: 0 };
      productStats[i.product_id].qty += i.quantity;
      productStats[i.product_id].rev += i.subtotal;
    });

    const productArray: ProductPerformanceItem[] = Object.entries(productStats).map(([id, stats]) => {
      const product = analytics.products.find(p => p.id === id);
      const category = product ? analytics.categories.find(c => c.id === product.category_id) : null;
      return {
        id,
        name: product?.name || 'Unknown',
        category: category?.name || 'Unknown',
        quantity: stats.qty,
        revenue: stats.rev,
      };
    });

    const topProductsByRev = [...productArray].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    const sortedProducts = [...productArray].sort((a, b) => b.quantity - a.quantity);

    const totalExpenses = filteredData.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const expensesByCategory: Record<string, number> = {};
    filteredData.expenses.forEach(e => {
      const cat = e.category.replace('_', ' ');
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + Number(e.amount);
    });
    const expenseChartData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));

    return {
      totalRevenue,
      totalOrders,
      salesChartData,
      productArray: sortedProducts,
      topProductsByRev,
      totalExpenses,
      expenseChartData,
    };
  }
}
