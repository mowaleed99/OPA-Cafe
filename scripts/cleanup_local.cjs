const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');
const fs = require('fs');

console.log('Starting local SQLite database cleanup...');

// 1. Locate the database file
const appDataPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME + "/.local/share");
const dbDir = path.join(appDataPath, 'OPA Cafe', 'database');
const dbPath = path.join(dbDir, 'cafe.sqlite');

if (!fs.existsSync(dbPath)) {
  console.error(`Database not found at ${dbPath}`);
  process.exit(1);
}

console.log(`Connecting to database at: ${dbPath}`);
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

try {
  // Start a transaction
  const executeCleanup = db.transaction(() => {
    console.log('Unlinking current orders from dining tables...');
    db.prepare(`UPDATE dining_tables SET current_order_id = NULL, status = 'available'`).run();

    console.log('Clearing Sync Queue and Conflicts...');
    db.prepare(`DELETE FROM sync_queue`).run();
    db.prepare(`DELETE FROM sync_conflicts`).run();

    console.log('Clearing Sales and Order Data...');
    db.prepare(`DELETE FROM order_audit_log`).run();
    db.prepare(`DELETE FROM daily_closing_items`).run();
    db.prepare(`DELETE FROM daily_closings`).run();
    db.prepare(`DELETE FROM order_items`).run();
    db.prepare(`DELETE FROM orders`).run();

    console.log('Clearing Inventory and Purchase Transactions...');
    db.prepare(`DELETE FROM stock_movements`).run();
    db.prepare(`DELETE FROM purchase_items`).run();
    db.prepare(`DELETE FROM supplier_payments`).run();
    db.prepare(`DELETE FROM purchases`).run();
    db.prepare(`DELETE FROM expenses`).run();

    console.log('Resetting Aggregate Data...');
    db.prepare(`UPDATE inventory_items SET stock_quantity = 0`).run();
    db.prepare(`UPDATE suppliers SET total_purchases = 0, total_paid = 0, total_due = 0`).run();
  });

  executeCleanup();
  console.log('Cleanup completed successfully!');
  console.log('You can now restart the application. The sync_queue is empty and no transactional data remains.');

} catch (error) {
  console.error('An error occurred during cleanup:', error);
  process.exit(1);
} finally {
  db.close();
}
