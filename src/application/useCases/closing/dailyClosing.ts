import { buildSyncOperation, createSyncableOperation, triggerBackgroundSync } from '../../sync/syncQueue';
import { closingRepository, orderRepository, supplierRepository, purchaseRepository, productRepository, categoryRepository, expenseRepository, inventoryRepository } from '../../../infrastructure/repositories/index';
import { executeTransaction, TransactionOperation } from '../../../infrastructure/database/transaction';
import { Money } from '../../../domain/entities/money';
import { OrderCalculator } from '../../../domain/services/orderCalculator';
import type { DailyClosing, DailyClosingItem } from '../../../domain/entities/daily_closing';
import type { Order } from '../../../domain/entities/order';
import type { Product } from '../../../domain/entities/product';
import type { Category } from '../../../domain/entities/category';
import type { SupplierPayment } from '../../../domain/entities/supplier';
import type { Expense } from '../../../domain/entities/expense';
import type { InventoryItem } from '../../../domain/entities/inventory';

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

export async function getClosingProducts(cafeId: string): Promise<Product[]> {
  return await productRepository.getProducts(cafeId);
}

export async function getClosingCategories(cafeId: string): Promise<Category[]> {
  return await categoryRepository.getCategories(cafeId);
}

export interface ClosingReport {
  closing: DailyClosing;
  items: DailyClosingItem[];
  expenses: number;
  payments?: any[]; // Array of payments with supplier details
  metrics?: {
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    totalItemsSold: number;
    paymentMethods: {
      cash: { amount: number; percentage: number };
      card: { amount: number; percentage: number };
      other: { amount: number; percentage: number };
    };
    topProducts: { name: string; quantity: number; revenue: number }[];
    slowProducts: { name: string; quantity: number; revenue: number }[];
    categories: { name: string; quantity: number; revenue: number }[];
    expensesByCategory: { name: string; amount: number; count: number }[];
    expenseCount: number;
    profit: {
      revenue: number;
      cogs: number;
      expenses: number;
      netProfit: number;
      profitMargin: number;
    };
    inventory: {
      currentValue: number;
      lowStockCount: number;
      outOfStockCount: number;
    };
  };
}

// ── Helper: Time Window Determination ─────────────────────────────────────────
async function determineShiftTimeWindow(cafeId: string, existing: DailyClosing | undefined, endTime: string): Promise<string> {
  let startTime = '1970-01-01T00:00:00.000Z';
  const allClosings = await closingRepository.getClosings(cafeId);
  allClosings.sort((a, b) => new Date(a.closed_at).getTime() - new Date(b.closed_at).getTime());

  if (existing) {
    const currentIndex = allClosings.findIndex(c => c.id === existing.id);
    if (currentIndex > 0) {
      startTime = allClosings[currentIndex - 1].closed_at;
    }
  } else if (allClosings.length > 0) {
    startTime = allClosings[allClosings.length - 1].closed_at;
  }
  return startTime;
}

// ── Helper: Calculate Shift Orders & Product Totals ───────────────────────────
async function computeShiftOrdersAndRevenues(cafeId: string, startTime: string, endTime: string) {
  const ordersInRange = await orderRepository.getOrdersByDateRange(cafeId, startTime, endTime);
  const shiftOrders = ordersInRange.filter(o => o.status === 'paid');

  const orderIds = shiftOrders.map(o => o.id);
  const totalSales = shiftOrders.reduce((sum, o) => Money.add(sum, o.total_amount), 0);

  const allItems = await orderRepository.getOrderItemsByOrderIds(orderIds);
  const productTotals = OrderCalculator.aggregateByProduct(allItems);

  let cashSales = 0;
  let instapaySales = 0;
  let vodafoneSales = 0;
  shiftOrders.forEach(o => {
    if (o.payment_method === 'cash') cashSales = Money.add(cashSales, o.total_amount);
    else if (o.payment_method === 'instapay') instapaySales = Money.add(instapaySales, o.total_amount);
    else if (o.payment_method === 'vodafone_cash') vodafoneSales = Money.add(vodafoneSales, o.total_amount);
  });

  return { shiftOrders, totalSales, productTotals, cashSales, instapaySales, vodafoneSales };
}

// ── Helper: Calculate Shift Expenses & Supplier Payments ─────────────────────
async function computeShiftExpenses(cafeId: string, selectedDate: string) {
  const allPayments = await purchaseRepository.getPayments(cafeId);
  const shiftPayments = allPayments.filter(p => (p.date || '').startsWith(selectedDate));
    
  const cafeSuppliers = await supplierRepository.getSuppliers(cafeId);
  const cafeSupplierIds = new Set(cafeSuppliers.map(s => s.id));
  
  const cafeShiftPayments = shiftPayments.filter(p => cafeSupplierIds.has(p.supplier_id));
  const purchaseExpenses = cafeShiftPayments.reduce((sum, p) => sum + p.amount, 0);

  const allDirectExpenses = await expenseRepository.getExpenses(cafeId);
  const directExpenses = allDirectExpenses.filter(e => e.date.startsWith(selectedDate));
  const totalDirectExpenses = directExpenses.reduce((sum, e) => sum + e.amount, 0);

  const totalExpenses = purchaseExpenses + totalDirectExpenses;
  return { cafeSuppliers, cafeShiftPayments, purchaseExpenses, directExpenses, totalExpenses };
}

// ── Helper: Build Line Items ──────────────────────────────────────────────────
async function buildDailyClosingItems(cafeId: string, closingId: string, productTotals: Record<string, { quantity: number; revenue: number }>): Promise<DailyClosingItem[]> {
  const allProductsForItems = await productRepository.getProducts(cafeId);
  const allCategoriesForItems = await categoryRepository.getCategories(cafeId);
  
  return Object.entries(productTotals).map(([productId, agg]) => {
    const product = allProductsForItems.find(p => p.id === productId);
    const category = product ? allCategoriesForItems.find(c => c.id === product.category_id) : null;
    return {
      id: crypto.randomUUID(),
      daily_closing_id: closingId,
      product_id: productId,
      quantity_sold: agg.quantity,
      total_sales: agg.revenue,
      product_name: product?.name ?? 'Unknown',
      category_name: category?.name ?? 'Unknown',
    };
  });
}

// ── Helper: Persist Closing & Sync ────────────────────────────────────────────
async function persistDailyClosing(existing: DailyClosing | undefined, closing: DailyClosing, closingItems: DailyClosingItem[]): Promise<void> {
  const ops: TransactionOperation[] = [];

  if (existing) {
    ops.push(...createSyncableOperation('update', 'daily_closings', closing as unknown as Record<string, unknown>, closing.id));

    const oldItems = await closingRepository.getClosingItems(closing.id);
    for (const oldItem of oldItems) {
      ops.push(...createSyncableOperation('delete', 'daily_closing_items', { id: oldItem.id }, oldItem.id));
    }
    
    if (closingItems.length > 0) {
      ops.push({ type: 'insertMany', table: 'daily_closing_items', data: closingItems });
      for (const item of closingItems) {
        ops.push(buildSyncOperation('insert', 'daily_closing_items', item as unknown as Record<string, unknown>));
      }
    }
  } else {
    ops.push(...createSyncableOperation('insert', 'daily_closings', closing as unknown as Record<string, unknown>));

    if (closingItems.length > 0) {
      ops.push({ type: 'insertMany', table: 'daily_closing_items', data: closingItems });
      for (const item of closingItems) {
        ops.push(buildSyncOperation('insert', 'daily_closing_items', item as unknown as Record<string, unknown>));
      }
    }
  }

  await executeTransaction(ops);
  triggerBackgroundSync();
}

// ── Helper: Compute UI Reporting Metrics ──────────────────────────────────────
async function computeClosingMetrics({
  cafeId,
  shiftOrders,
  totalSales,
  productTotals,
  totalExpenses,
  directExpenses,
  cafeShiftPayments,
  purchaseExpenses,
}: {
  cafeId: string;
  shiftOrders: Order[];
  totalSales: number;
  productTotals: Record<string, { quantity: number; revenue: number }>;
  totalExpenses: number;
  directExpenses: Expense[];
  cafeShiftPayments: SupplierPayment[];
  purchaseExpenses: number;
}) {
  const allProducts = await productRepository.getProducts(cafeId);
  const allCategories = await categoryRepository.getCategories(cafeId);
  const allInventory = await inventoryRepository.getInventoryItems(cafeId);

  let cogs = 0;
  let totalItemsSold = 0;
  
  const productStats: { name: string; quantity: number; revenue: number }[] = [];
  const catStatsMap: Record<string, { quantity: number; revenue: number }> = {};
  
  for (const [productId, agg] of Object.entries(productTotals)) {
    const product = allProducts.find(p => p.id === productId);
    const cost = product?.cost || 0;
    cogs += cost * agg.quantity;
    totalItemsSold += agg.quantity;
    
    if (product) {
      productStats.push({ name: product.name, quantity: agg.quantity, revenue: agg.revenue });
      
      const catId = product.category_id;
      if (!catStatsMap[catId]) catStatsMap[catId] = { quantity: 0, revenue: 0 };
      catStatsMap[catId].quantity += agg.quantity;
      catStatsMap[catId].revenue += agg.revenue;
    }
  }

  productStats.sort((a, b) => b.quantity - a.quantity);
  const topProducts = productStats.slice(0, 5);
  const slowProducts = productStats.slice(-5).reverse();

  const categories = Object.entries(catStatsMap).map(([catId, stats]) => {
    const cat = allCategories.find(c => c.id === catId);
    return { name: cat ? cat.name : 'Unknown', quantity: stats.quantity, revenue: stats.revenue };
  });

  const paymentMethods = {
    cash: { amount: 0, percentage: 0 },
    card: { amount: 0, percentage: 0 },
    other: { amount: 0, percentage: 0 },
  };

  shiftOrders.forEach(o => {
    if (o.payment_method === 'cash') paymentMethods.cash.amount += o.total_amount;
    else if (o.payment_method === 'instapay' || 
             o.payment_method === 'vodafone_cash' || 
             (o.payment_method as string) === 'card') paymentMethods.card.amount += o.total_amount;
    else paymentMethods.other.amount += o.total_amount;
  });

  if (totalSales > 0) {
    paymentMethods.cash.percentage = Math.round((paymentMethods.cash.amount / totalSales) * 100);
    paymentMethods.card.percentage = Math.round((paymentMethods.card.amount / totalSales) * 100);
    paymentMethods.other.percentage = Math.round((paymentMethods.other.amount / totalSales) * 100);
  }

  const expensesByCategoryMap: Record<string, { amount: number; count: number }> = {};
  directExpenses.forEach(e => {
    if (!expensesByCategoryMap[e.category]) expensesByCategoryMap[e.category] = { amount: 0, count: 0 };
    expensesByCategoryMap[e.category].amount += e.amount;
    expensesByCategoryMap[e.category].count++;
  });
  
  if (cafeShiftPayments.length > 0) {
    if (!expensesByCategoryMap['Purchases']) expensesByCategoryMap['Purchases'] = { amount: 0, count: 0 };
    expensesByCategoryMap['Purchases'].amount += purchaseExpenses;
    expensesByCategoryMap['Purchases'].count += cafeShiftPayments.length;
  }

  const expensesByCategory = Object.entries(expensesByCategoryMap).map(([name, stats]) => ({
    name,
    amount: stats.amount,
    count: stats.count
  }));

  const netProfit = totalSales - cogs - totalExpenses;
  const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

  const inventoryCurrentValue = allInventory.reduce((sum, p) => sum + ((p.cost_per_unit || 0) * (p.stock_quantity || 0)), 0);
  const lowStockCount = allInventory.filter(p => (p.stock_quantity || 0) <= (p.low_stock_threshold || 5) && (p.stock_quantity || 0) > 0).length;
  const outOfStockCount = allInventory.filter(p => (p.stock_quantity || 0) <= 0).length;

  return {
    totalSales,
    totalOrders: shiftOrders.length,
    averageOrderValue: shiftOrders.length > 0 ? totalSales / shiftOrders.length : 0,
    totalItemsSold,
    paymentMethods,
    topProducts,
    slowProducts,
    categories,
    expensesByCategory,
    expenseCount: directExpenses.length + cafeShiftPayments.length,
    profit: { revenue: totalSales, cogs, expenses: totalExpenses, netProfit, profitMargin },
    inventory: { currentValue: inventoryCurrentValue, lowStockCount, outOfStockCount }
  };
}

// ── Main Use Case: closingDay ─────────────────────────────────────────────────
export async function closingDay(cafeId: string, selectedDate: string = new Date().toISOString().split('T')[0]): Promise<ClosingReport> {
  const existing = await getClosingByDate(cafeId, selectedDate);
  const closingId = existing ? existing.id : crypto.randomUUID();
  const endTime = existing ? existing.closed_at : new Date().toISOString();

  const startTime = await determineShiftTimeWindow(cafeId, existing, endTime);
  const { shiftOrders, totalSales, productTotals, cashSales, instapaySales, vodafoneSales } =
    await computeShiftOrdersAndRevenues(cafeId, startTime, endTime);

  if (shiftOrders.length === 0 && !existing) {
    throw new Error(`No paid orders found since the last closing to close for ${selectedDate}.`);
  }

  const { cafeSuppliers, cafeShiftPayments, purchaseExpenses, directExpenses, totalExpenses } =
    await computeShiftExpenses(cafeId, selectedDate);

  const closingNow = new Date().toISOString();
  const closing: DailyClosing = {
    id: closingId,
    cafe_id: cafeId,
    closing_date: selectedDate,
    closed_at: closingNow,
    closed_by: 'System',
    total_sales: totalSales,
    total_orders: shiftOrders.length,
    cash_sales: cashSales,
    instapay_sales: instapaySales,
    vodafone_cash_sales: vodafoneSales,
    total_expenses: totalExpenses,
    cash_in_drawer: cashSales,
    expected_cash: cashSales,
    difference: 0,
    created_at: existing ? existing.created_at : endTime,
  };

  const closingItems = await buildDailyClosingItems(cafeId, closingId, productTotals);
  await persistDailyClosing(existing, closing, closingItems);

  const enrichedPayments = cafeShiftPayments.map(p => ({
    ...p,
    supplierName: cafeSuppliers.find(s => s.id === p.supplier_id)?.name ?? 'Unknown Supplier',
  }));

  const metrics = await computeClosingMetrics({
    cafeId, shiftOrders, totalSales, productTotals, totalExpenses, directExpenses, cafeShiftPayments, purchaseExpenses
  });

  return {
    closing,
    items: closingItems,
    expenses: totalExpenses,
    payments: enrichedPayments,
    metrics,
  };
}

export async function getClosingPayments(cafeId: string, selectedDate: string) {
  const allPayments = await purchaseRepository.getPayments(cafeId);
  const shiftPayments = allPayments.filter(p => (p.date || '').startsWith(selectedDate));
    
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
