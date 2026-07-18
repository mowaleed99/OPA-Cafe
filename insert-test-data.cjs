const db = require('better-sqlite3')('C:/Users/moham/AppData/Roaming/OPA Cafe/database/cafe.sqlite');
const crypto = require('crypto');

function uuid() { return crypto.randomUUID(); }

const cafeId = '630b8cff-02d5-4262-8170-7ffd47b6bebd';
const productId = 'c716854c-89e3-42aa-bef4-b9eb933b2c37';

const orderId = uuid();
const orderItemId = uuid();
const dailyClosingId = uuid();
const dailyClosingItemId = uuid();

const t0 = new Date().getTime();
const tOrder = new Date(t0).toISOString();
const tOrderItem = new Date(t0 + 10).toISOString();
const tClosing = new Date(t0 + 20).toISOString();
const tClosingItem = new Date(t0 + 30).toISOString();

const order = {
  id: orderId,
  cafe_id: cafeId,
  order_type: 'dine_in',
  status: 'paid',
  payment_method: 'cash',
  total_amount: 150,
  created_at: tOrder,
  sync_status: 'pending',
  version: 1
};

const orderItem = {
  id: orderItemId,
  order_id: orderId,
  product_id: productId,
  quantity: 2,
  unit_price: 75,
  subtotal: 150,
  sync_status: 'pending',
  version: 1
};

const dailyClosing = {
  id: dailyClosingId,
  cafe_id: cafeId,
  closing_date: tClosing.split('T')[0],
  closed_at: tClosing,
  closed_by: uuid(),
  total_orders: 1,
  total_sales: 150,
  cash_sales: 150,
  instapay_sales: 0,
  vodafone_cash_sales: 0,
  total_expenses: 0,
  cash_in_drawer: 150,
  expected_cash: 150,
  difference: 0,
  sync_status: 'pending',
  version: 1
};

const dailyClosingItem = {
  id: dailyClosingItemId,
  daily_closing_id: dailyClosingId,
  product_id: productId,
  quantity_sold: 2,
  total_sales: 150,
  category_name: 'Test Category',
  product_name: 'Test Product',
  sync_status: 'pending',
  version: 1
};

db.prepare(`CREATE TABLE IF NOT EXISTS sync_queue (id TEXT PRIMARY KEY, action TEXT, table_name TEXT, payload TEXT, status TEXT, retry_count INTEGER, created_at TEXT, last_error TEXT, record_id TEXT)`).run();

const insertQueue = db.prepare(`INSERT INTO sync_queue (id, action, table_name, payload, status, retry_count, created_at, record_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

// Insert parents FIRST, then children, matching the slightly delayed created_at timestamps!
insertQueue.run(uuid(), 'insert', 'orders', JSON.stringify(order), 'pending', 0, tOrder, order.id);
insertQueue.run(uuid(), 'insert', 'order_items', JSON.stringify(orderItem), 'pending', 0, tOrderItem, orderItem.id);
insertQueue.run(uuid(), 'insert', 'daily_closings', JSON.stringify(dailyClosing), 'pending', 0, tClosing, dailyClosing.id);
insertQueue.run(uuid(), 'insert', 'daily_closing_items', JSON.stringify(dailyClosingItem), 'pending', 0, tClosingItem, dailyClosingItem.id);

console.log('Successfully created test order, daily closing, and queued them for sync.');
console.log('Order ID:', order.id);
console.log('Daily Closing ID:', dailyClosing.id);
process.exit(0);
