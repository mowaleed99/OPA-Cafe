import Dexie, { type Table } from 'dexie';
import type { AppUser } from '../../core/entities/user';
import type { Category } from '../../core/entities/category';
import type { Product } from '../../core/entities/product';
import type { InventoryItem } from '../../core/entities/inventory';
import type { StockMovement } from '../../core/entities/stock_movement';
import type { DiningTable } from '../../core/entities/table';
import type { Order, OrderItem } from '../../core/entities/order';
import type { Supplier, Purchase, PurchaseItem, SupplierPayment } from '../../core/entities/supplier';
import type { DailyClosing, DailyClosingItem } from '../../core/entities/daily_closing';
import type { Settings } from '../../core/entities/settings';
import type { Expense } from '../../core/entities/expense';

export interface SyncQueueItem {
  id?: number; // Auto-incremented primary key
  action: 'insert' | 'update' | 'delete';
  table: string;
  payload: Record<string, unknown>;
  created_at: string;
  status: 'pending' | 'syncing' | 'failed';
  retry_count: number;
}

export class CafeDatabase extends Dexie {
  app_users!: Table<AppUser, string>;
  categories!: Table<Category, string>;
  products!: Table<Product, string>;
  inventory_items!: Table<InventoryItem, string>;
  stock_movements!: Table<StockMovement, string>;
  dining_tables!: Table<DiningTable, string>;
  orders!: Table<Order, string>;
  order_items!: Table<OrderItem, string>;
  suppliers!: Table<Supplier, string>;
  purchases!: Table<Purchase, string>;
  purchase_items!: Table<PurchaseItem, string>;
  supplier_payments!: Table<SupplierPayment, string>;
  daily_closings!: Table<DailyClosing, string>;
  daily_closing_items!: Table<DailyClosingItem, string>;
  settings!: Table<Settings, string>;
  expenses!: Table<Expense, string>;
  sync_queue!: Table<SyncQueueItem, number>;

  constructor() {
    super('CafeDatabase');
    this.version(1).stores({
      app_users: 'id, cafe_id, role',
      categories: 'id, cafe_id',
      products: 'id, cafe_id, category_id, status',
      inventory_items: 'id, cafe_id',
      stock_movements: 'id, cafe_id, inventory_item_id',
      dining_tables: 'id, cafe_id, status',
      orders: 'id, cafe_id, table_id, status',
      order_items: 'id, order_id, product_id',
      suppliers: 'id, cafe_id',
      purchases: 'id, cafe_id, supplier_id, payment_status',
      purchase_items: 'id, purchase_id, product_id',
      supplier_payments: 'id, purchase_id, supplier_id',
      daily_closings: 'id, cafe_id, closing_date',
      daily_closing_items: 'id, daily_closing_id, product_id',
      settings: 'id, cafe_id',
      expenses: 'id, cafe_id, expense_date',
      sync_queue: '++id, status, created_at',
    });
  }
}

export const db = new CafeDatabase();
