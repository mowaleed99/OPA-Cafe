import { orderRepository, productRepository, categoryRepository, expenseRepository, purchaseRepository, supplierRepository } from '../../../infrastructure/repositories/index';
import type { Order, OrderItem } from '../../../domain/entities/order';
import type { Product } from '../../../domain/entities/product';
import type { Expense } from '../../../domain/entities/expense';
import type { Category } from '../../../domain/entities/category';
import type { SupplierPayment } from '../../../domain/entities/supplier';

export interface AnalyticsRawData {
  orders: Order[];
  orderItems: OrderItem[];
  products: Product[];
  categories: Category[];
  expenses: Expense[];
  payments: SupplierPayment[];
}

export async function getAnalyticsData(cafeId: string): Promise<AnalyticsRawData> {
  const [
    orders,
    orderItems,
    products,
    categories,
    expenses,
    payments,
    suppliers
  ] = await Promise.all([
    orderRepository.getOrders(cafeId),
    orderRepository.getAllOrderItems(),
    productRepository.getProducts(cafeId),
    categoryRepository.getCategories(cafeId),
    expenseRepository.getExpenses(cafeId),
    purchaseRepository.getPayments(cafeId),
    supplierRepository.getSuppliers(cafeId)
  ]);

  // Filter payments to only those for this cafe's suppliers
  const cafeSupplierIds = new Set(suppliers.map(s => s.id));
  const cafePayments = payments.filter(p => cafeSupplierIds.has(p.supplier_id));

  return {
    orders,
    orderItems,
    products,
    categories,
    expenses,
    payments: cafePayments
  };
}
