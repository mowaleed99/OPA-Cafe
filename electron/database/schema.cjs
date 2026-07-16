const { sqliteTable, text, integer, real } = require('drizzle-orm/sqlite-core');

const syncFields = {
  updated_at: text('updated_at'),
  deleted_at: text('deleted_at'),
  sync_status: text('sync_status', { enum: ['synced', 'pending', 'failed'] }).default('pending'),
  device_id: text('device_id'),
  version: integer('version').default(1),
  last_modified_by: text('last_modified_by'),
};

const appUsers = sqliteTable('app_users', {
  id: text('id').primaryKey(),
  cafe_id: text('cafe_id').notNull(),
  role: text('role').notNull(),
  name: text('name'),
  email: text('email'),
  created_at: text('created_at'),
  local_password_hash: text('local_password_hash'),
  ...syncFields
});

const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  cafe_id: text('cafe_id').notNull(),
  name: text('name').notNull(),
  order: integer('order').default(0),
  status: text('status').default('active'),
  created_at: text('created_at'),
  ...syncFields
});

const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  cafe_id: text('cafe_id').notNull(),
  category_id: text('category_id').notNull(),
  name: text('name').notNull(),
  price: real('price').notNull(),
  cost: real('cost').notNull(),
  image_url: text('image_url'),
  status: text('status').default('active'),
  track_stock: integer('track_stock', { mode: 'boolean' }).default(false),
  inventory_item_id: text('inventory_item_id'),
  created_at: text('created_at'),
  ...syncFields
});

const inventoryItems = sqliteTable('inventory_items', {
  id: text('id').primaryKey(),
  cafe_id: text('cafe_id').notNull(),
  name: text('name').notNull(),
  sku: text('sku'),
  unit: text('unit').notNull(),
  stock_quantity: real('stock_quantity').notNull().default(0),
  low_stock_threshold: real('low_stock_threshold').notNull().default(10),
  cost_per_unit: real('cost_per_unit').notNull().default(0),
  created_at: text('created_at'),
  ...syncFields
});

const stockMovements = sqliteTable('stock_movements', {
  id: text('id').primaryKey(),
  cafe_id: text('cafe_id').notNull(),
  inventory_item_id: text('inventory_item_id').notNull(),
  type: text('type').notNull(), // 'in' | 'out' | 'adjustment'
  quantity: real('quantity').notNull(),
  reason: text('reason'),
  reference_type: text('reference_type'),
  reference_id: text('reference_id'),
  notes: text('notes'),
  created_at: text('created_at'),
  ...syncFields
});

const diningTables = sqliteTable('dining_tables', {
  id: text('id').primaryKey(),
  cafe_id: text('cafe_id').notNull(),
  name_or_number: text('name_or_number').notNull(),
  status: text('status').default('available'),
  current_order_id: text('current_order_id'),
  capacity: integer('capacity'),
  created_at: text('created_at'),
  ...syncFields
});

const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  cafe_id: text('cafe_id').notNull(),
  table_id: text('table_id'),
  order_type: text('order_type').notNull(),
  status: text('status').notNull(),
  payment_method: text('payment_method'),
  total_amount: real('total_amount').notNull(),
  created_at: text('created_at'),
  ...syncFields
});

const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey(),
  order_id: text('order_id').notNull(),
  product_id: text('product_id').notNull(),
  quantity: integer('quantity').notNull(),
  unit_price: real('unit_price').notNull(),
  subtotal: real('subtotal').notNull(),
  ...syncFields
});

const suppliers = sqliteTable('suppliers', {
  id: text('id').primaryKey(),
  cafe_id: text('cafe_id').notNull(),
  name: text('name').notNull(),
  contact_name: text('contact_name'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  total_purchases: real('total_purchases').default(0),
  total_paid: real('total_paid').default(0),
  total_due: real('total_due').default(0),
  created_at: text('created_at'),
  ...syncFields
});

const purchases = sqliteTable('purchases', {
  id: text('id').primaryKey(),
  cafe_id: text('cafe_id').notNull(),
  supplier_id: text('supplier_id').notNull(),
  reference_number: text('reference_number'),
  date: text('date').notNull(),
  total_amount: real('total_amount').notNull(),
  payment_status: text('payment_status').notNull(),
  amount_paid: real('amount_paid').default(0),
  created_at: text('created_at'),
  ...syncFields
});

const purchaseItems = sqliteTable('purchase_items', {
  id: text('id').primaryKey(),
  purchase_id: text('purchase_id').notNull(),
  inventory_item_id: text('inventory_item_id').notNull(),
  quantity: real('quantity').notNull(),
  unit_cost: real('unit_cost').notNull(),
  subtotal: real('subtotal').notNull(),
  ...syncFields
});

const supplierPayments = sqliteTable('supplier_payments', {
  id: text('id').primaryKey(),
  cafe_id: text('cafe_id').notNull(),
  supplier_id: text('supplier_id').notNull(),
  purchase_id: text('purchase_id'),
  amount: real('amount').notNull(),
  payment_method: text('payment_method').notNull(),
  date: text('date').notNull(),
  reference_number: text('reference_number'),
  notes: text('notes'),
  created_at: text('created_at'),
  ...syncFields
});

const expenses = sqliteTable('expenses', {
  id: text('id').primaryKey(),
  cafe_id: text('cafe_id').notNull(),
  category: text('category').notNull(),
  amount: real('amount').notNull(),
  description: text('description'),
  date: text('date').notNull(),
  created_by: text('created_by'),
  payment_method: text('payment_method'),
  reference_number: text('reference_number'),
  created_at: text('created_at'),
  ...syncFields
});

const dailyClosings = sqliteTable('daily_closings', {
  id: text('id').primaryKey(),
  cafe_id: text('cafe_id').notNull(),
  closing_date: text('closing_date').notNull(),
  closed_at: text('closed_at').notNull(),
  closed_by: text('closed_by').notNull(),
  total_orders: integer('total_orders').notNull(),
  total_sales: real('total_sales').notNull(),
  cash_sales: real('cash_sales').notNull(),
  instapay_sales: real('instapay_sales').notNull(),
  vodafone_cash_sales: real('vodafone_cash_sales').notNull(),
  total_expenses: real('total_expenses').notNull(),
  cash_in_drawer: real('cash_in_drawer').notNull(),
  expected_cash: real('expected_cash').notNull(),
  difference: real('difference').notNull(),
  notes: text('notes'),
  created_at: text('created_at'),
  ...syncFields
});

const dailyClosingItems = sqliteTable('daily_closing_items', {
  id: text('id').primaryKey(),
  daily_closing_id: text('daily_closing_id').notNull(),
  product_id: text('product_id').notNull(),
  quantity_sold: integer('quantity_sold').notNull(),
  total_sales: real('total_sales').notNull(),
  category_name: text('category_name').notNull(),
  product_name: text('product_name').notNull(),
  created_at: text('created_at'),
  ...syncFields
});

const settings = sqliteTable('settings', {
  id: text('id').primaryKey(),
  cafe_id: text('cafe_id').notNull(),
  language: text('language'),
  cafe_name: text('cafe_name'),
  currency: text('currency'),
  print_paper_size: text('print_paper_size'),
  cashier_permissions: text('cashier_permissions'), // store as JSON string
  auto_backup_enabled: integer('auto_backup_enabled', { mode: 'boolean' }),
  auto_backup_frequency: text('auto_backup_frequency'),
  auto_backup_time: text('auto_backup_time'),
  last_backup_date: text('last_backup_date'),
  owner_pin_hash: text('owner_pin_hash'),
  default_printer: text('default_printer'),
  paper_size: text('paper_size').default('80mm'), // 58mm, 80mm, custom
  auto_print_receipts: integer('auto_print_receipts', { mode: 'boolean' }).default(false),
  receipt_copies: integer('receipt_copies').default(1),
  report_default_output: text('report_default_output').default('thermal'), // thermal, pdf
  receipt_template_config: text('receipt_template_config'), // JSON: { showLogo: boolean, showCashier: boolean, showDiscount: boolean, footerMessage: string }
  ...syncFields
});

const orderAuditLog = sqliteTable('order_audit_log', {
  id: text('id').primaryKey(),
  cafe_id: text('cafe_id').notNull(),
  order_id: text('order_id').notNull(),
  action: text('action').notNull(),
  performed_by: text('performed_by'),
  timestamp: text('timestamp').notNull(),
  reason: text('reason'),
  details: text('details'), // JSON string
  ...syncFields
});

const syncQueue = sqliteTable('sync_queue', {
  id: text('id').primaryKey(),
  action: text('action').notNull(),
  table_name: text('table_name').notNull(),
  payload: text('payload').notNull(), // JSON string
  status: text('status').notNull().default('pending'),
  retry_count: integer('retry_count').notNull().default(0),
  created_at: text('created_at').notNull(),
  record_id: text('record_id'),
  last_error: text('last_error')
});

const syncConflicts = sqliteTable('sync_conflicts', {
  id: text('id').primaryKey(),
  entity_name: text('entity_name').notNull(),
  entity_id: text('entity_id').notNull(),
  local_version: integer('local_version'),
  remote_version: integer('remote_version'),
  resolution: text('resolution'), // 'local_wins' | 'remote_wins' | 'merged'
  created_at: text('created_at').notNull()
});

module.exports = {
  appUsers, categories, products, inventoryItems, stockMovements,
  diningTables, orders, orderItems, suppliers, purchases, purchaseItems,
  supplierPayments, expenses, dailyClosings, dailyClosingItems, settings,
  orderAuditLog, syncQueue, syncConflicts
};
