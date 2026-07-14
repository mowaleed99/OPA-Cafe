import Dexie, { type Table } from 'dexie';
import type { AppUser } from '../../domain/entities/user';
import type { Category } from '../../domain/entities/category';
import type { Product } from '../../domain/entities/product';
import type { InventoryItem } from '../../domain/entities/inventory';
import type { StockMovement } from '../../domain/entities/stock_movement';
import type { DiningTable } from '../../domain/entities/table';
import type { Order, OrderItem } from '../../domain/entities/order';
import type { Supplier, Purchase, PurchaseItem, SupplierPayment } from '../../domain/entities/supplier';
import type { DailyClosing, DailyClosingItem } from '../../domain/entities/daily_closing';
import type { Settings } from '../../domain/entities/settings';
import type { Expense } from '../../domain/entities/expense';
import type { OrderAuditLog } from '../../domain/entities/order_audit_log';

export interface SyncQueueItem {
  id?: string;
  action: 'insert' | 'update' | 'delete';
  table_name: string;
  payload: string; // JSON string
  created_at: string;
  status: 'pending' | 'syncing' | 'failed';
  retry_count: number;
  record_id?: string;
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
  order_audit_log!: Table<OrderAuditLog, string>;
  sync_queue!: Table<SyncQueueItem, number>;

  constructor() {
    super('CafeDatabase');
    // Version 1 — original schema (kept for upgrade path)
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

    // Version 2 — adds order_audit_log table
    this.version(2).stores({
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
      order_audit_log: 'id, cafe_id, order_id, action_type, created_at',
      sync_queue: '++id, status, created_at',
    });
  }
}

export const db = new CafeDatabase();

