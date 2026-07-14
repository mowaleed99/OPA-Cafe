import { orderRepository, closingRepository, inventoryRepository, productRepository, expenseRepository, purchaseRepository, supplierRepository } from '../../../infrastructure/repositories/index';
import type { DailyClosing } from '../../../domain/entities/daily_closing';
import type { InventoryItem } from '../../../domain/entities/inventory';

export interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  todayAverageOrder: number;
  yesterdaySales: number;
  salesComparisonPct: number;

  estimatedProfit: number;
  profitMarginPct: number;
  totalExpenses: number;
  totalCOGS: number;

  fastSellingProducts: { id: string; name: string; quantity: number }[];
  slowMovingProducts: { id: string; name: string; quantity: number }[];

  weekSales: number;
  recentClosings: DailyClosing[];
  lowStockItems: InventoryItem[];
}

export async function getDashboardStats(cafeId: string): Promise<DashboardStats> {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [
    allOrders,
    allOrderItems,
    allProducts,
    allExpenses,
    allPayments,
    allClosings,
    allInventory,
    allSuppliers
  ] = await Promise.all([
    orderRepository.getOrders(cafeId),
    orderRepository.getAllOrderItems(),
    productRepository.getProducts(cafeId),
    expenseRepository.getExpenses(cafeId),
    purchaseRepository.getPayments(cafeId),
    closingRepository.getClosings(cafeId),
    inventoryRepository.getInventoryItems(cafeId),
    supplierRepository.getSuppliers(cafeId)
  ]);

  // --- Sales Intelligence ---
  const todayOrdersArr = allOrders.filter(o => o.status === 'paid' && o.created_at.startsWith(today));
  const yesterdayOrdersArr = allOrders.filter(o => o.status === 'paid' && o.created_at.startsWith(yesterday));

  const todaySales = todayOrdersArr.reduce((sum, o) => sum + o.total_amount, 0);
  const yesterdaySales = yesterdayOrdersArr.reduce((sum, o) => sum + o.total_amount, 0);
  const todayOrderCount = todayOrdersArr.length;
  const todayAverageOrder = todayOrderCount > 0 ? todaySales / todayOrderCount : 0;
  
  let salesComparisonPct = 0;
  if (yesterdaySales > 0) {
    salesComparisonPct = ((todaySales - yesterdaySales) / yesterdaySales) * 100;
  } else if (todaySales > 0) {
    salesComparisonPct = 100;
  }

  // --- Profit Intelligence (Last 30 Days as reference for estimated profit) ---
  const recentOrders = allOrders.filter(o => o.status === 'paid' && o.created_at >= thirtyDaysAgo);
  const totalSales30d = recentOrders.reduce((sum, o) => sum + o.total_amount, 0);

  const recentExpenses = allExpenses.filter(e => e.expense_date >= thirtyDaysAgo);
  const totalExpenses = recentExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const cafeSupplierIds = new Set(allSuppliers.map(s => s.id));
  const recentPayments = allPayments.filter(p => p.payment_date && p.payment_date >= thirtyDaysAgo && cafeSupplierIds.has(p.supplier_id));
  const totalCOGS = recentPayments.reduce((sum, p) => sum + p.amount, 0);

  const estimatedProfit = totalSales30d - totalExpenses - totalCOGS;
  const profitMarginPct = totalSales30d > 0 ? (estimatedProfit / totalSales30d) * 100 : 0;

  // --- Product Intelligence (Last 30 Days) ---
  const recentOrderIds = new Set(recentOrders.map(o => o.id));
  const recentOrderItems = allOrderItems.filter(item => recentOrderIds.has(item.order_id));

  const productQtyMap: Record<string, number> = {};
  allProducts.forEach(p => productQtyMap[p.id] = 0); 

  recentOrderItems.forEach(item => {
    if (productQtyMap[item.product_id] !== undefined) {
      productQtyMap[item.product_id] += item.quantity;
    }
  });

  const productPerformance = allProducts.map(p => ({
    id: p.id,
    name: p.name,
    quantity: productQtyMap[p.id] || 0
  }));

  // Sort by quantity desc
  productPerformance.sort((a, b) => b.quantity - a.quantity);
  
  const fastSellingProducts = productPerformance.slice(0, 5).filter(p => p.quantity > 0);
  
  const activeProducts = productPerformance.filter(p => allProducts.find(x => x.id === p.id)?.status === 'active');
  const slowMovingProducts = activeProducts.slice().reverse().slice(0, 5);

  // --- Existing logic ---
  const recentClosings = allClosings
    .filter(c => c.closing_date >= weekAgo)
    .sort((a, b) => a.closing_date.localeCompare(b.closing_date));

  const weekSales = recentClosings.reduce((sum, c) => sum + c.total_sales, 0);

  const lowStockItems = allInventory
    .filter(item => item.low_stock_threshold !== null && item.stock_quantity <= item.low_stock_threshold)
    .sort((a, b) => a.stock_quantity - b.stock_quantity)
    .slice(0, 5);

  return {
    todaySales,
    todayOrders: todayOrderCount,
    todayAverageOrder,
    yesterdaySales,
    salesComparisonPct,
    
    estimatedProfit,
    profitMarginPct,
    totalExpenses,
    totalCOGS,
    
    fastSellingProducts,
    slowMovingProducts,

    weekSales,
    recentClosings,
    lowStockItems,
  };
}
