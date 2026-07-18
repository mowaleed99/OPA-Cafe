const db = require('better-sqlite3')('C:/Users/moham/AppData/Roaming/OPA Cafe/database/cafe.sqlite');
const rows = db.prepare("SELECT table_name, status, last_error FROM sync_queue WHERE status IN ('pending', 'failed', 'syncing')").all();
console.log(rows);
process.exit(0);
