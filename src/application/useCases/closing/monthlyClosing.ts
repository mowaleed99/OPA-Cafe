import { db } from '../../../infrastructure/database/db';
import type { DailyClosing, DailyClosingItem } from '../../../core/entities/daily_closing';
import type { Expense } from '../../../core/entities/expense';

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
  let total_expenses = 0;
  let total_cost_of_goods = 0;
  let total_explicit_expenses = 0;
  const aggregatedItems: Record<string, { quantity: number; revenue: number }> = {};
  
  if (closings.length === 0) {
    return { month: monthPrefix, total_sales, total_orders, total_expenses, total_cost_of_goods, total_explicit_expenses, closings, aggregatedItems, payments: [], explicitExpenses: [] };
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

  const cafeSuppliers = await db.suppliers.where('cafe_id').equals(cafeId).toArray();
  const cafeSupplierIds = new Set(cafeSuppliers.map(s => s.id));
  
  const monthPayments = await db.supplier_payments
    .filter(p => p.payment_date.startsWith(monthPrefix))
    .toArray();

  const cafeShiftPayments = monthPayments.filter(p => cafeSupplierIds.has(p.supplier_id));

  total_cost_of_goods = cafeShiftPayments.reduce((sum, p) => sum + p.amount, 0);

  const explicitExpenses = await db.expenses
    .where('cafe_id')
    .equals(cafeId)
    .filter(e => e.expense_date.startsWith(monthPrefix))
    .toArray();

  total_explicit_expenses = explicitExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  
  total_expenses = total_cost_of_goods + total_explicit_expenses;

  const enrichedPayments = cafeShiftPayments.map(p => {
    const supplier = cafeSuppliers.find(s => s.id === p.supplier_id);
    return {
      ...p,
      supplierName: supplier ? supplier.name : 'Unknown Supplier',
    };
  });

  return { month: monthPrefix, total_sales, total_orders, total_expenses, total_cost_of_goods, total_explicit_expenses, closings, aggregatedItems, payments: enrichedPayments, explicitExpenses };
}
