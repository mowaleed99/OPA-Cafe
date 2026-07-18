const db = require('better-sqlite3')('C:/Users/moham/AppData/Roaming/OPA Cafe/database/cafe.sqlite');
const orders = db.prepare('SELECT id, created_at, status, sync_status FROM orders ORDER BY created_at DESC LIMIT 5').all();
console.log("Local Orders:", orders);
process.exit(0);
