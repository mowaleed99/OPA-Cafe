const db = require('better-sqlite3')('C:/Users/moham/AppData/Roaming/OPA Cafe/database/cafe.sqlite'); 

const failedItems = db.prepare("SELECT * FROM sync_queue WHERE status = 'failed' AND table_name = 'order_items'").all();
const toDelete = [];

for (const item of failedItems) {
  const payload = JSON.parse(item.payload);
  const parentId = payload.order_id;
  
  const localParent = db.prepare(`SELECT id FROM orders WHERE id = ?`).get(parentId);
  if (!localParent) {
    toDelete.push(item.id);
  }
}

if (toDelete.length > 0) {
  const deleteStmt = db.prepare("DELETE FROM sync_queue WHERE id = ?");
  const deleteMany = db.transaction((ids) => {
    for (const id of ids) deleteStmt.run(id);
  });
  deleteMany(toDelete);
  console.log(`Deleted ${toDelete.length} orphaned order_items.`);
}

const remainingFailed = db.prepare("SELECT table_name, count(*) as c FROM sync_queue WHERE status = 'failed' GROUP BY table_name").all();
console.log("Remaining failed records:", remainingFailed);
process.exit(0);
