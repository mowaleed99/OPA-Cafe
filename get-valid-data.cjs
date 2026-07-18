 const db = require('better-sqlite3')('C:/Users/moham/AppData/Roaming/OPA Cafe/database/cafe.sqlite');
const validProduct = db.prepare('SELECT id FROM products LIMIT 1').get();
const validOrder = db.prepare('SELECT status, order_type FROM orders LIMIT 1').get();
console.log('Product ID:', validProduct?.id);
console.log('Order Status:', validOrder?.status);
console.log('Order Type:', validOrder?.order_type);
process.exit(0);
