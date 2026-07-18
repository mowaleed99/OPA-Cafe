const db = require('better-sqlite3')('C:/Users/moham/AppData/Roaming/OPA Cafe/database/cafe.sqlite');
db.prepare("UPDATE sync_queue SET status = 'pending' WHERE status = 'syncing'").run();
console.log('Reset stuck syncing records to pending.');
process.exit(0);
