const db = require('better-sqlite3')('C:/Users/moham/AppData/Roaming/OPA Cafe/database/cafe.sqlite');
const order = db.prepare("SELECT * FROM orders WHERE id = '91b88c75-b55c-4d38-bf43-4f8a310b1fe7'").get();
console.log(order);
process.exit(0);
