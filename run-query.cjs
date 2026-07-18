const db = require('better-sqlite3')('C:/Users/moham/AppData/Roaming/OPA Cafe/database/cafe.sqlite'); 
const rows = db.prepare("SELECT payload FROM sync_queue WHERE status = 'failed' AND table_name = 'daily_closing_items' LIMIT 1").all(); 
console.log(JSON.stringify(rows, null, 2));
process.exit(0);
