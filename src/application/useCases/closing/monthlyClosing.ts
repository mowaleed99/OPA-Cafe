import { closingRepository, supplierRepository, purchaseRepository, expenseRepository, productRepository, categoryRepository, orderRepository } from '../../../infrastructure/repositories/index';
import type { DailyClosing } from '../../../domain/entities/daily_closing';
import type { Expense } from '../../../domain/entities/expense';

export interface MonthlyClosingReport {
  month: string;
  total_sales: number;
  total_orders: number;
  total_expenses: number;
  total_cost_of_goods: number;
  total_explicit_expenses: number;
  closings: DailyClosing[];
  aggregatedItems: Record<string, { quantity: number; revenue: number }>;
  payments?: any[];
  explicitExpenses?: Expense[];
  metrics?: {
    dailySalesDistribution: { date: string; revenue: number }[];
    bestSalesDay: { date: string; revenue: number } | null;
    lowestSalesDay: { date: string; revenue: number } | null;
    topProductsQuantity: { name: string; quantity: number }[];
    topProductsRevenue: { name: string; revenue: number }[];
    slowProducts: { name: string; quantity: number }[];
    categoryDistribution: { name: string; revenue: number; percentage: number }[];
    profit: {
      income: number;
      expenses: number;
      netProfit: number;
      profitPercentage: number;
    };
    cashierPerformance: { cashierId: string; orders: number; sales: number; discounts: number }[];
  };
}

export async function getMonthlyClosing(cafeId: string, monthPrefix: string): Promise<MonthlyClosingReport> {
  const allClosings = await closingRepository.getClosings(cafeId);
  const closings = allClosings
    .filter(c => c.closing_date.startsWith(monthPrefix))
    .sort((a, b) => a.closing_date.localeCompare(b.closing_date));
    
  let total_sales = 0;
  let total_orders = 0;
  let total_expenses = 0;
  let total_cost_of_goods = 0;
  let total_explicit_expenses = 0;
  const aggregatedItems: Record<string, { quantity: number; revenue: number }> = {};
  
  if (closings.length === 0) {
    return { month: monthPrefix, total_sales, total_orders, total_expenses, total_cost_of_goods, total_explicit_expenses, closings, aggregatedItems, payments: [], explicitExpenses: [] };
  }

  const closingIds = new Set(closings.map(c => c.id));
  const dailySalesDistribution: { date: string; revenue: number }[] = [];
  
  for (const c of closings) {
    total_sales += c.total_sales;
    total_orders += c.total_orders;
    dailySalesDistribution.push({ date: c.closing_date, revenue: c.total_sales });
    
    const items = await closingRepository.getClosingItems(c.id);
    for (const item of items) {
      if (!aggregatedItems[item.product_id]) {
        aggregatedItems[item.product_id] = { quantity: 0, revenue: 0 };
      }
      aggregatedItems[item.product_id].quantity += item.quantity_sold;
      aggregatedItems[item.product_id].revenue += item.total_revenue;
    }
  }

  dailySalesDistribution.sort((a, b) => a.date.localeCompare(b.date));
  let bestSalesDay = null;
  let lowestSalesDay = null;
  
  if (dailySalesDistribution.length > 0) {
    const sortedByRev = [...dailySalesDistribution].sort((a, b) => b.revenue - a.revenue);
    bestSalesDay = sortedByRev[0];
    lowestSalesDay = sortedByRev[sortedByRev.length - 1];
  }

  const cafeSuppliers = await supplierRepository.getSuppliers(cafeId);
  const cafeSupplierIds = new Set(cafeSuppliers.map(s => s.id));
  
  const allPayments = await purchaseRepository.getPayments(cafeId);
  const monthPayments = allPayments.filter(p => p.payment_date.startsWith(monthPrefix));

  const cafeShiftPayments = monthPayments.filter(p => cafeSupplierIds.has(p.supplier_id));

  total_cost_of_goods = cafeShiftPayments.reduce((sum, p) => sum + p.amount, 0);

  const allExpenses = await expenseRepository.getExpenses(cafeId);
  const explicitExpenses = allExpenses.filter(e => e.expense_date.startsWith(monthPrefix));

  total_explicit_expenses = explicitExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  
  total_expenses = total_cost_of_goods + total_explicit_expenses;

  const enrichedPayments = cafeShiftPayments.map(p => {
    const supplier = cafeSuppliers.find(s => s.id === p.supplier_id);
    return {
      ...p,
      supplierName: supplier ? supplier.name : 'Unknown Supplier',
    };
  });

  // Calculate detailed metrics
  const allProducts = await productRepository.getProducts(cafeId);
  const allCategories = await categoryRepository.getCategories(cafeId);
  
  const productStats: { name: string; quantity: number; revenue: number; catId: string }[] = [];
  const catStatsMap: Record<string, number> = {};
  
  for (const [productId, agg] of Object.entries(aggregatedItems)) {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
      productStats.push({ name: product.name, quantity: agg.quantity, revenue: agg.revenue, catId: product.category_id });
      
      const catId = product.category_id;
      if (!catStatsMap[catId]) catStatsMap[catId] = 0;
      catStatsMap[catId] += agg.revenue;
    }
  }

  const topProductsQuantity = [...productStats].sort((a, b) => b.quantity - a.quantity).slice(0, 5).map(p => ({ name: p.name, quantity: p.quantity }));
  const topProductsRevenue = [...productStats].sort((a, b) => b.revenue - a.revenue).slice(0, 5).map(p => ({ name: p.name, revenue: p.revenue }));
  const slowProducts = [...productStats].sort((a, b) => a.quantity - b.quantity).slice(0, 5).map(p => ({ name: p.name, quantity: p.quantity }));

  const categoryDistribution = Object.entries(catStatsMap).map(([catId, revenue]) => {
    const cat = allCategories.find(c => c.id === catId);
    return {
      name: cat ? cat.name : 'Unknown',
      revenue,
      percentage: total_sales > 0 ? Math.round((revenue / total_sales) * 100) : 0
    };
  });

  const netProfit = total_sales - total_expenses;
  const profitPercentage = total_sales > 0 ? (netProfit / total_sales) * 100 : 0;

  // Cashier Performance (extracting from orders in the month)
  const allOrders = await orderRepository.getOrders(cafeId);
  const monthOrders = allOrders.filter(o => o.created_at.startsWith(monthPrefix) && o.status === 'paid');
  
  const cashierMap: Record<string, { cashierName: string; orders: number; sales: number; discounts: number }> = {};
  for (const o of monthOrders) {
    const cid = o.user_id || 'Owner';
    if (!cashierMap[cid]) cashierMap[cid] = { cashierName: o.user_name || 'Unknown', orders: 0, sales: 0, discounts: 0 };
    cashierMap[cid].orders += 1;
    cashierMap[cid].sales += o.total_amount;
    cashierMap[cid].discounts += o.discount || 0;
  }
  const cashierPerformance = Object.entries(cashierMap).map(([cashierId, data]) => ({
    cashierId,
    cashierName: data.cashierName,
    orders: data.orders,
    sales: data.sales,
    discounts: data.discounts
  }));

  return { 
    month: monthPrefix, 
    total_sales, 
    total_orders, 
    total_expenses, 
    total_cost_of_goods, 
    total_explicit_expenses, 
    closings, 
    aggregatedItems, 
    payments: enrichedPayments, 
    explicitExpenses,
    metrics: {
      dailySalesDistribution,
      bestSalesDay,
      lowestSalesDay,
      topProductsQuantity,
      topProductsRevenue,
      slowProducts,
      categoryDistribution,
      profit: {
        income: total_sales,
        expenses: total_expenses,
        netProfit,
        profitPercentage
      },
      cashierPerformance
    }
  };
}
