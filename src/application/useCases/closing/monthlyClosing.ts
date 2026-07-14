import { createRepository } from '../../../infrastructure/repositories/RepositoryFactory';
import type { DailyClosing, DailyClosingItem } from '../../../domain/entities/daily_closing';
import type { Expense } from '../../../domain/entities/expense';
import type { Supplier, SupplierPayment } from '../../../domain/entities/supplier';

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

export async function getMonthlyClosing(cafeId: string, monthPrefix: string): Promise<MonthlyClosingReport> {
  const closingsRepo = createRepository<DailyClosing>('daily_closings');
  const itemsRepo = createRepository<DailyClosingItem>('daily_closing_items');
  const suppliersRepo = createRepository<Supplier>('suppliers');
  const paymentsRepo = createRepository<SupplierPayment>('supplier_payments');
  const expensesRepo = createRepository<Expense>('expenses');

  const allClosings = await closingsRepo.findMany({ cafe_id: cafeId });
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
  const allItems = await itemsRepo.findMany(); // Or fetch in a loop/query if supported
  const items = allItems.filter(i => closingIds.has(i.daily_closing_id));

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

  const cafeSuppliers = await suppliersRepo.findMany({ cafe_id: cafeId });
  const cafeSupplierIds = new Set(cafeSuppliers.map(s => s.id));
  
  const allPayments = await paymentsRepo.findMany();
  const monthPayments = allPayments.filter(p => p.payment_date.startsWith(monthPrefix));

  const cafeShiftPayments = monthPayments.filter(p => cafeSupplierIds.has(p.supplier_id));

  total_cost_of_goods = cafeShiftPayments.reduce((sum, p) => sum + p.amount, 0);

  const allExpenses = await expensesRepo.findMany({ cafe_id: cafeId });
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

  return { month: monthPrefix, total_sales, total_orders, total_expenses, total_cost_of_goods, total_explicit_expenses, closings, aggregatedItems, payments: enrichedPayments, explicitExpenses };
}
