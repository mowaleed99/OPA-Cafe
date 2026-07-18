const db = require('better-sqlite3')('C:/Users/moham/AppData/Roaming/OPA Cafe/database/cafe.sqlite');
db.prepare("DELETE FROM sync_queue WHERE payload LIKE '%948b4fcc%' OR payload LIKE '%9c12363e%' OR table_name IN ('orders', 'order_items', 'daily_closings', 'daily_closing_items')").run();
console.log('Cleaned up previous test data.');
process.exit(0);
