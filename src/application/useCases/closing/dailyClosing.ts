import { buildSyncOperation } from '../../sync/syncQueue';
import { closingRepository, orderRepository, supplierRepository, purchaseRepository, productRepository, categoryRepository, expenseRepository, inventoryRepository } from '../../../infrastructure/repositories/index';
import { executeTransaction, TransactionOperation } from '../../../infrastructure/database/transaction';
import type { DailyClosing, DailyClosingItem } from '../../../domain/entities/daily_closing';

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

export async function closingDay(cafeId: string, selectedDate: string = new Date().toISOString().split('T')[0]): Promise<ClosingReport> {
  // Check for existing duplicate and update it if necessary
  const existing = await getClosingByDate(cafeId, selectedDate);
  const closingId = existing ? existing.id : crypto.randomUUID();

  // Determine time window for this closing
  let startTime = '1970-01-01T00:00:00.000Z';
  let endTime = new Date().toISOString();

  const allClosings = await closingRepository.getClosings(cafeId);
  // sort ascending by created_at for time window logic
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
  const allOrders = await orderRepository.getOrders(cafeId);
  const shiftOrders = allOrders.filter(o => o.status === 'paid' && o.created_at > startTime && o.created_at <= endTime);

  if (shiftOrders.length === 0 && !existing) {
    throw new Error(`No paid orders found since the last closing to close for ${selectedDate}.`);
  }

  const orderIds = new Set(shiftOrders.map(o => o.id));
  const totalSales = shiftOrders.reduce((sum, o) => sum + o.total_amount, 0);

  // 2. Get all order items for those orders
  const productTotals: Record<string, { quantity: number; revenue: number }> = {};
  for (const orderId of orderIds) {
    const items = await orderRepository.getOrderItems(orderId);
    for (const item of items) {
      if (!productTotals[item.product_id]) {
        productTotals[item.product_id] = { quantity: 0, revenue: 0 };
      }
      productTotals[item.product_id].quantity += item.quantity;
      productTotals[item.product_id].revenue += item.subtotal;
    }
  }

  // 4. Find all supplier payments (expenses) within the time window
  const allPayments = await purchaseRepository.getPayments(cafeId);
  const shiftPayments = allPayments.filter(p => p.payment_date.startsWith(selectedDate));
    
  const cafeSuppliers = await supplierRepository.getSuppliers(cafeId);
  const cafeSupplierIds = new Set(cafeSuppliers.map(s => s.id));
  
  const cafeShiftPayments = shiftPayments.filter(p => cafeSupplierIds.has(p.supplier_id));
  const purchaseExpenses = cafeShiftPayments.reduce((sum, p) => sum + p.amount, 0);

  // 4b. Find other direct expenses
  const allDirectExpenses = await expenseRepository.getExpenses(cafeId);
  const directExpenses = allDirectExpenses.filter(e => e.expense_date.startsWith(selectedDate));
  const totalDirectExpenses = directExpenses.reduce((sum, e) => sum + e.amount, 0);

  const totalExpenses = purchaseExpenses + totalDirectExpenses;

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

  const ops: TransactionOperation[] = [];

  // 6. Write to DB and sync
  if (existing) {
    ops.push({ type: 'update', table: 'daily_closings', id: closingId, data: closing });
    ops.push(buildSyncOperation('update', 'daily_closings', closing as unknown as Record<string, unknown>));

    const oldItems = await closingRepository.getClosingItems(closingId);
    for (const oldItem of oldItems) {
      ops.push({ type: 'delete', table: 'daily_closing_items', id: oldItem.id });
      ops.push(buildSyncOperation('delete', 'daily_closing_items', { id: oldItem.id }));
    }
    
    if (closingItems.length > 0) {
      ops.push({ type: 'insertMany', table: 'daily_closing_items', data: closingItems });
      for (const item of closingItems) {
        ops.push(buildSyncOperation('insert', 'daily_closing_items', item as unknown as Record<string, unknown>));
      }
    }
  } else {
    ops.push({ type: 'insert', table: 'daily_closings', data: closing });
    ops.push(buildSyncOperation('insert', 'daily_closings', closing as unknown as Record<string, unknown>));

    if (closingItems.length > 0) {
      ops.push({ type: 'insertMany', table: 'daily_closing_items', data: closingItems });
      for (const item of closingItems) {
        ops.push(buildSyncOperation('insert', 'daily_closing_items', item as unknown as Record<string, unknown>));
      }
    }
  }

  await executeTransaction(ops);

  if (navigator.onLine && window.electronAPI) {
    window.electronAPI.triggerSync();
  }

  const enrichedPayments = cafeShiftPayments.map(p => {
    const supplier = cafeSuppliers.find(s => s.id === p.supplier_id);
    return {
      ...p,
      supplierName: supplier ? supplier.name : 'Unknown Supplier',
    };
  });

  // Calculate detailed metrics for Phase 10a
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

  const inventoryCurrentValue = allInventory.reduce((sum, p) => sum + ((p.cost || 0) * (p.stock_quantity || 0)), 0);
  const lowStockCount = allInventory.filter(p => (p.stock_quantity || 0) <= (p.low_stock_threshold || 5) && (p.stock_quantity || 0) > 0).length;
  const outOfStockCount = allInventory.filter(p => (p.stock_quantity || 0) <= 0).length;

  return {
    closing,
    items: closingItems,
    expenses: totalExpenses,
    payments: enrichedPayments,
    metrics: {
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
      profit: {
        revenue: totalSales,
        cogs,
        expenses: totalExpenses,
        netProfit,
        profitMargin
      },
      inventory: {
        currentValue: inventoryCurrentValue,
        lowStockCount,
        outOfStockCount
      }
    }
  };
}

export async function getClosingPayments(cafeId: string, selectedDate: string) {
  const allPayments = await purchaseRepository.getPayments(cafeId);
  const shiftPayments = allPayments.filter(p => p.payment_date.startsWith(selectedDate));
    
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

