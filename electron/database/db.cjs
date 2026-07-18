const Database = require('better-sqlite3');
const { drizzle } = require('drizzle-orm/better-sqlite3');
const schema = require('./schema.cjs');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

let _db = null;
let _drizzleDb = null;

async function initDb() {
  if (_db) return _drizzleDb;

  const userDataPath = app.getPath('userData'); // e.g. AppData/Roaming/opa-cafe
  // But user requested AppData/Roaming/OPA Cafe/database/cafe.sqlite
  // Let's use app.getPath('appData') and manually build the path to be exact
  const appDataPath = app.getPath('appData');
  const dbDir = path.join(appDataPath, 'OPA Cafe', 'database');

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'cafe.sqlite');
  
  _db = new Database(dbPath);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  _drizzleDb = drizzle(_db, { schema });

  // Run migrations
  const { migrate } = require('drizzle-orm/better-sqlite3/migrator');
  const migrationsFolder = path.join(__dirname, 'migrations');
  
  // Create auto-backup before migrations
  try {
    const backupDir = path.join(appDataPath, 'OPA Cafe', 'AutoBackups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `pre-migration-${timestamp}.sqlite`);
    
    // Check if we already have a clean shutdown WAL etc., better-sqlite3 backup handles WAL safely
    await _db.backup(backupFile);
    
    // Clean up old backups (keep last 30)
    const files = fs.readdirSync(backupDir).filter(f => f.startsWith('pre-migration-') && f.endsWith('.sqlite'));
    if (files.length > 30) {
      files.sort((a, b) => {
        const aStat = fs.statSync(path.join(backupDir, a));
        const bStat = fs.statSync(path.join(backupDir, b));
        return aStat.mtimeMs - bStat.mtimeMs;
      });
      const toDelete = files.slice(0, files.length - 30);
      toDelete.forEach(f => fs.unlinkSync(path.join(backupDir, f)));
    }
  } catch (e) {
    console.error('Failed to create pre-migration backup', e);
  }

  // Run Drizzle migrations first so that base tables exist
  migrate(_drizzleDb, { migrationsFolder });

  // Phase 9 Safe Migrations for sync tracking
  try {
    // Add last_error to sync_queue if it doesn't exist
    _db.exec(`ALTER TABLE sync_queue ADD COLUMN last_error TEXT`);
  } catch (e) {
    // Column already exists
  }

  try {
    // Check if sync_conflicts has old schema (table_name instead of entity_name)
    const tableInfo = _db.prepare("PRAGMA table_info(sync_conflicts)").all();
    const hasTableName = tableInfo.some(col => col.name === 'table_name');
    
    if (hasTableName) {
      // Recreate the lightweight sync_conflicts table
      _db.exec(`DROP TABLE sync_conflicts;`);
      _db.exec(`
        CREATE TABLE sync_conflicts (
          id TEXT PRIMARY KEY,
          entity_name TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          local_version INTEGER,
          remote_version INTEGER,
          resolution TEXT,
          created_at TEXT NOT NULL
        );
      `);
    }
  } catch (e) {
    console.error('Failed to migrate sync_conflicts', e);
  }

  // Phase 10 Settings Migrations for Printing
  const addColumnSafe = (table, column, def) => {
    try {
      _db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`);
    } catch (e) {
      // Column already exists
    }
  };

  addColumnSafe('settings', 'default_printer', 'TEXT');
  addColumnSafe('settings', 'paper_size', "TEXT DEFAULT '80mm'");
  addColumnSafe('settings', 'auto_print_receipts', 'INTEGER DEFAULT 0');
  addColumnSafe('settings', 'receipt_copies', 'INTEGER DEFAULT 1');
  addColumnSafe('settings', 'report_default_output', "TEXT DEFAULT 'thermal'");
  addColumnSafe('settings', 'receipt_template_config', 'TEXT');
  
  // Phase 11 Missing columns
  addColumnSafe('inventory_items', 'cost_per_unit', 'REAL DEFAULT 0');
  addColumnSafe('inventory_items', 'sku', 'TEXT');
  addColumnSafe('inventory_items', 'is_countable', 'INTEGER DEFAULT 0');
  addColumnSafe('inventory_items', 'pieces_per_carton', 'INTEGER');
  addColumnSafe('inventory_items', 'minimum_stock', 'INTEGER');
  addColumnSafe('stock_movements', 'reason', 'TEXT');
  addColumnSafe('settings', 'auto_backup_frequency', 'TEXT');

  // Phase 12 — Schema alignment with Supabase
  // purchases
  addColumnSafe('purchases', 'date', 'TEXT');

  // supplier_payments
  addColumnSafe('supplier_payments', 'cafe_id', 'TEXT');
  addColumnSafe('supplier_payments', 'payment_method', 'TEXT');
  addColumnSafe('supplier_payments', 'date', 'TEXT');
  addColumnSafe('supplier_payments', 'reference_number', 'TEXT');

  // daily_closings
  addColumnSafe('daily_closings', 'closed_at', 'TEXT');
  addColumnSafe('daily_closings', 'closed_by', 'TEXT');
  addColumnSafe('daily_closings', 'cash_sales', 'REAL DEFAULT 0');
  addColumnSafe('daily_closings', 'instapay_sales', 'REAL DEFAULT 0');
  addColumnSafe('daily_closings', 'vodafone_cash_sales', 'REAL DEFAULT 0');
  addColumnSafe('daily_closings', 'cash_in_drawer', 'REAL DEFAULT 0');
  addColumnSafe('daily_closings', 'expected_cash', 'REAL DEFAULT 0');
  addColumnSafe('daily_closings', 'difference', 'REAL DEFAULT 0');

  // daily_closing_items
  addColumnSafe('daily_closing_items', 'category_name', 'TEXT');
  addColumnSafe('daily_closing_items', 'product_name', 'TEXT');
  addColumnSafe('daily_closing_items', 'total_sales', 'REAL DEFAULT 0');

  // order_audit_log
  addColumnSafe('order_audit_log', 'action', 'TEXT');
  addColumnSafe('order_audit_log', 'performed_by', 'TEXT');
  addColumnSafe('order_audit_log', 'timestamp', 'TEXT');
  addColumnSafe('order_audit_log', 'details', 'TEXT');
  addColumnSafe('order_audit_log', 'reason', 'TEXT');

  return _drizzleDb;
}

function getDb() {
  if (!_drizzleDb) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return _drizzleDb;
}

function getRawDb() {
    return _db;
}

function getDbPath() {
    const appDataPath = app.getPath('appData');
    return path.join(appDataPath, 'OPA Cafe', 'database', 'cafe.sqlite');
}

function closeDb() {
  if (_db) {
    _db.close();
    _db = null;
    _drizzleDb = null;
  }
}

module.exports = {
  initDb,
  getDb,
  getRawDb,
  getDbPath,
  closeDb,
  schema
};
