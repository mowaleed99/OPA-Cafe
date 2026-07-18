const schema = require('../database/schema.cjs');

const LOCAL_TO_SUPABASE = {
  dining_tables: 'tables',
};

const LOCAL_SYNC_TABLES = {
  categories: schema.categories,
  products: schema.products,
  inventory_items: schema.inventoryItems,
  stock_movements: schema.stockMovements,
  dining_tables: schema.diningTables,
  orders: schema.orders,
  order_items: schema.orderItems,
  suppliers: schema.suppliers,
  purchases: schema.purchases,
  purchase_items: schema.purchaseItems,
  supplier_payments: schema.supplierPayments,
  expenses: schema.expenses,
  daily_closings: schema.dailyClosings,
  daily_closing_items: schema.dailyClosingItems,
  settings: schema.settings,
  order_audit_log: schema.orderAuditLog,
};

function toSupabaseName(localName) {
  return LOCAL_TO_SUPABASE[localName] ?? localName;
}

function getTablePriority(item) {
  const tablePriority = {
    app_users: 0,
    categories: 1,
    inventory_items: 1,
    suppliers: 1,
    tables: 1,
    dining_tables: 1,
    products: 2,
    orders: 2,
    purchases: 2,
    settings: 2,
    daily_closings: 2,
    order_items: 3,
    purchase_items: 3,
    supplier_payments: 3,
    stock_movements: 3,
    daily_closing_items: 3,
    order_audit_log: 3,
  };

  // A table can reference its current order. Process that update only after
  // the order exists in Supabase, preventing a transient foreign-key failure.
  if ((item.table_name === 'tables' || item.table_name === 'dining_tables') && item.action !== 'delete') {
    try {
      const payload = typeof item.payload === 'string' ? JSON.parse(item.payload) : item.payload;
      if (payload?.current_order_id) return 3;
    } catch {
      // Let normal processing record malformed queue items as failures.
    }
  }

  return tablePriority[item.table_name] ?? 2;
}

module.exports = {
  LOCAL_TO_SUPABASE,
  LOCAL_SYNC_TABLES,
  toSupabaseName,
  getTablePriority,
};
