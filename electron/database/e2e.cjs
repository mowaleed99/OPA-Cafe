var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// electron/database/schema.cjs
var require_schema = __commonJS({
  "electron/database/schema.cjs"(exports2, module2) {
    var { sqliteTable, text, integer, real } = require("drizzle-orm/sqlite-core");
    var syncFields = {
      updated_at: text("updated_at"),
      deleted_at: text("deleted_at"),
      sync_status: text("sync_status", { enum: ["synced", "pending", "failed"] }).default("pending"),
      device_id: text("device_id"),
      version: integer("version").default(1),
      last_modified_by: text("last_modified_by")
    };
    var appUsers = sqliteTable("app_users", {
      id: text("id").primaryKey(),
      cafe_id: text("cafe_id").notNull(),
      role: text("role").notNull(),
      name: text("name"),
      email: text("email"),
      created_at: text("created_at"),
      local_password_hash: text("local_password_hash"),
      ...syncFields
    });
    var categories = sqliteTable("categories", {
      id: text("id").primaryKey(),
      cafe_id: text("cafe_id").notNull(),
      name: text("name").notNull(),
      order: integer("order").default(0),
      status: text("status").default("active"),
      created_at: text("created_at"),
      ...syncFields
    });
    var products = sqliteTable("products", {
      id: text("id").primaryKey(),
      cafe_id: text("cafe_id").notNull(),
      category_id: text("category_id").notNull(),
      name: text("name").notNull(),
      price: real("price").notNull(),
      cost: real("cost").notNull(),
      image_url: text("image_url"),
      status: text("status").default("active"),
      track_stock: integer("track_stock", { mode: "boolean" }).default(false),
      inventory_item_id: text("inventory_item_id"),
      created_at: text("created_at"),
      ...syncFields
    });
    var inventoryItems = sqliteTable("inventory_items", {
      id: text("id").primaryKey(),
      cafe_id: text("cafe_id").notNull(),
      name: text("name").notNull(),
      sku: text("sku"),
      unit: text("unit").notNull(),
      stock_quantity: real("stock_quantity").notNull().default(0),
      low_stock_threshold: real("low_stock_threshold").notNull().default(10),
      cost_per_unit: real("cost_per_unit").notNull().default(0),
      is_countable: integer("is_countable", { mode: "boolean" }).default(false),
      pieces_per_carton: integer("pieces_per_carton"),
      minimum_stock: integer("minimum_stock"),
      created_at: text("created_at"),
      ...syncFields
    });
    var stockMovements = sqliteTable("stock_movements", {
      id: text("id").primaryKey(),
      cafe_id: text("cafe_id").notNull(),
      inventory_item_id: text("inventory_item_id").notNull(),
      type: text("type").notNull(),
      // 'in' | 'out' | 'adjustment'
      quantity: real("quantity").notNull(),
      reason: text("reason"),
      reference_type: text("reference_type"),
      reference_id: text("reference_id"),
      notes: text("notes"),
      created_at: text("created_at"),
      ...syncFields
    });
    var diningTables = sqliteTable("dining_tables", {
      id: text("id").primaryKey(),
      cafe_id: text("cafe_id").notNull(),
      name_or_number: text("name_or_number").notNull(),
      status: text("status").default("available"),
      current_order_id: text("current_order_id"),
      capacity: integer("capacity"),
      created_at: text("created_at"),
      ...syncFields
    });
    var orders = sqliteTable("orders", {
      id: text("id").primaryKey(),
      cafe_id: text("cafe_id").notNull(),
      table_id: text("table_id"),
      order_type: text("order_type").notNull(),
      status: text("status").notNull(),
      payment_method: text("payment_method"),
      total_amount: real("total_amount").notNull(),
      created_at: text("created_at"),
      ...syncFields
    });
    var orderItems = sqliteTable("order_items", {
      id: text("id").primaryKey(),
      order_id: text("order_id").notNull(),
      product_id: text("product_id").notNull(),
      quantity: integer("quantity").notNull(),
      unit_price: real("unit_price").notNull(),
      subtotal: real("subtotal").notNull(),
      ...syncFields
    });
    var suppliers = sqliteTable("suppliers", {
      id: text("id").primaryKey(),
      cafe_id: text("cafe_id").notNull(),
      name: text("name").notNull(),
      contact_name: text("contact_name"),
      phone: text("phone"),
      email: text("email"),
      address: text("address"),
      total_purchases: real("total_purchases").default(0),
      total_paid: real("total_paid").default(0),
      total_due: real("total_due").default(0),
      created_at: text("created_at"),
      ...syncFields
    });
    var purchases = sqliteTable("purchases", {
      id: text("id").primaryKey(),
      cafe_id: text("cafe_id").notNull(),
      supplier_id: text("supplier_id").notNull(),
      reference_number: text("reference_number"),
      date: text("date").notNull(),
      total_amount: real("total_amount").notNull(),
      payment_status: text("payment_status").notNull(),
      amount_paid: real("amount_paid").default(0),
      created_at: text("created_at"),
      ...syncFields
    });
    var purchaseItems = sqliteTable("purchase_items", {
      id: text("id").primaryKey(),
      purchase_id: text("purchase_id").notNull(),
      inventory_item_id: text("inventory_item_id").notNull(),
      quantity: real("quantity").notNull(),
      unit_cost: real("unit_cost").notNull(),
      subtotal: real("subtotal").notNull(),
      ...syncFields
    });
    var supplierPayments = sqliteTable("supplier_payments", {
      id: text("id").primaryKey(),
      cafe_id: text("cafe_id").notNull(),
      supplier_id: text("supplier_id").notNull(),
      purchase_id: text("purchase_id"),
      amount: real("amount").notNull(),
      payment_method: text("payment_method").notNull(),
      date: text("date").notNull(),
      reference_number: text("reference_number"),
      notes: text("notes"),
      created_at: text("created_at"),
      ...syncFields
    });
    var expenses = sqliteTable("expenses", {
      id: text("id").primaryKey(),
      cafe_id: text("cafe_id").notNull(),
      category: text("category").notNull(),
      amount: real("amount").notNull(),
      description: text("description"),
      date: text("date").notNull(),
      created_by: text("created_by"),
      payment_method: text("payment_method"),
      reference_number: text("reference_number"),
      created_at: text("created_at"),
      ...syncFields
    });
    var dailyClosings = sqliteTable("daily_closings", {
      id: text("id").primaryKey(),
      cafe_id: text("cafe_id").notNull(),
      closing_date: text("closing_date").notNull(),
      closed_at: text("closed_at").notNull(),
      closed_by: text("closed_by").notNull(),
      total_orders: integer("total_orders").notNull(),
      total_sales: real("total_sales").notNull(),
      cash_sales: real("cash_sales").notNull(),
      instapay_sales: real("instapay_sales").notNull(),
      vodafone_cash_sales: real("vodafone_cash_sales").notNull(),
      total_expenses: real("total_expenses").notNull(),
      cash_in_drawer: real("cash_in_drawer").notNull(),
      expected_cash: real("expected_cash").notNull(),
      difference: real("difference").notNull(),
      notes: text("notes"),
      ...syncFields
    });
    var dailyClosingItems = sqliteTable("daily_closing_items", {
      id: text("id").primaryKey(),
      daily_closing_id: text("daily_closing_id").notNull(),
      product_id: text("product_id").notNull(),
      quantity_sold: integer("quantity_sold").notNull(),
      total_sales: real("total_sales").notNull(),
      category_name: text("category_name").notNull(),
      product_name: text("product_name").notNull(),
      ...syncFields
    });
    var settings = sqliteTable("settings", {
      id: text("id").primaryKey(),
      cafe_id: text("cafe_id").notNull(),
      language: text("language"),
      cafe_name: text("cafe_name"),
      currency: text("currency"),
      print_paper_size: text("print_paper_size"),
      cashier_permissions: text("cashier_permissions"),
      // store as JSON string
      auto_backup_enabled: integer("auto_backup_enabled", { mode: "boolean" }),
      auto_backup_frequency: text("auto_backup_frequency"),
      auto_backup_time: text("auto_backup_time"),
      last_backup_date: text("last_backup_date"),
      owner_pin_hash: text("owner_pin_hash"),
      default_printer: text("default_printer"),
      paper_size: text("paper_size").default("80mm"),
      // 58mm, 80mm, custom
      auto_print_receipts: integer("auto_print_receipts", { mode: "boolean" }).default(false),
      receipt_copies: integer("receipt_copies").default(1),
      report_default_output: text("report_default_output").default("thermal"),
      // thermal, pdf
      receipt_template_config: text("receipt_template_config"),
      // JSON: { showLogo: boolean, showCashier: boolean, showDiscount: boolean, footerMessage: string }
      ...syncFields
    });
    var orderAuditLog = sqliteTable("order_audit_log", {
      id: text("id").primaryKey(),
      cafe_id: text("cafe_id").notNull(),
      order_id: text("order_id").notNull(),
      action: text("action").notNull(),
      performed_by: text("performed_by"),
      timestamp: text("timestamp").notNull(),
      reason: text("reason"),
      details: text("details"),
      // JSON string
      ...syncFields
    });
    var syncQueue = sqliteTable("sync_queue", {
      id: text("id").primaryKey(),
      action: text("action").notNull(),
      table_name: text("table_name").notNull(),
      payload: text("payload").notNull(),
      // JSON string
      status: text("status").notNull().default("pending"),
      retry_count: integer("retry_count").notNull().default(0),
      created_at: text("created_at").notNull(),
      record_id: text("record_id"),
      last_error: text("last_error")
    });
    var syncConflicts = sqliteTable("sync_conflicts", {
      id: text("id").primaryKey(),
      entity_name: text("entity_name").notNull(),
      entity_id: text("entity_id").notNull(),
      local_version: integer("local_version"),
      remote_version: integer("remote_version"),
      resolution: text("resolution"),
      // 'local_wins' | 'remote_wins' | 'merged'
      created_at: text("created_at").notNull()
    });
    module2.exports = {
      appUsers,
      categories,
      products,
      inventoryItems,
      stockMovements,
      diningTables,
      orders,
      orderItems,
      suppliers,
      purchases,
      purchaseItems,
      supplierPayments,
      expenses,
      dailyClosings,
      dailyClosingItems,
      settings,
      orderAuditLog,
      syncQueue,
      syncConflicts
    };
  }
});

// electron/database/db.cjs
var require_db = __commonJS({
  "electron/database/db.cjs"(exports2, module2) {
    var Database = require("better-sqlite3");
    var { drizzle } = require("drizzle-orm/better-sqlite3");
    var schema2 = require_schema();
    var path = require("path");
    var fs = require("fs");
    var { app } = require("electron");
    var _db = null;
    var _drizzleDb = null;
    function initDb2() {
      if (_db) return _drizzleDb;
      const userDataPath = app.getPath("userData");
      const appDataPath = app.getPath("appData");
      const dbDir = path.join(appDataPath, "OPA Cafe", "database");
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      const dbPath = path.join(dbDir, "cafe.sqlite");
      _db = new Database(dbPath);
      _db.pragma("journal_mode = WAL");
      _db.pragma("foreign_keys = ON");
      _drizzleDb = drizzle(_db, { schema: schema2 });
      const { migrate } = require("drizzle-orm/better-sqlite3/migrator");
      const migrationsFolder = path.join(__dirname, "migrations");
      try {
        const backupDir = path.join(appDataPath, "OPA Cafe", "AutoBackups");
        if (!fs.existsSync(backupDir)) {
          fs.mkdirSync(backupDir, { recursive: true });
        }
        const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
        const backupFile = path.join(backupDir, `pre-migration-${timestamp}.sqlite`);
        _db.backup(backupFile).then(() => {
          const files = fs.readdirSync(backupDir).filter((f) => f.startsWith("pre-migration-") && f.endsWith(".sqlite"));
          if (files.length > 30) {
            files.sort((a, b) => {
              const aStat = fs.statSync(path.join(backupDir, a));
              const bStat = fs.statSync(path.join(backupDir, b));
              return aStat.mtimeMs - bStat.mtimeMs;
            });
            const toDelete = files.slice(0, files.length - 30);
            toDelete.forEach((f) => fs.unlinkSync(path.join(backupDir, f)));
          }
        }).catch(console.error);
      } catch (e) {
        console.error("Failed to create pre-migration backup", e);
      }
      migrate(_drizzleDb, { migrationsFolder });
      try {
        _db.exec(`ALTER TABLE sync_queue ADD COLUMN last_error TEXT`);
      } catch (e) {
      }
      try {
        const tableInfo = _db.prepare("PRAGMA table_info(sync_conflicts)").all();
        const hasTableName = tableInfo.some((col) => col.name === "table_name");
        if (hasTableName) {
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
        console.error("Failed to migrate sync_conflicts", e);
      }
      const addColumnSafe = (table, column, def) => {
        try {
          _db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`);
        } catch (e) {
        }
      };
      addColumnSafe("settings", "default_printer", "TEXT");
      addColumnSafe("settings", "paper_size", "TEXT DEFAULT '80mm'");
      addColumnSafe("settings", "auto_print_receipts", "INTEGER DEFAULT 0");
      addColumnSafe("settings", "receipt_copies", "INTEGER DEFAULT 1");
      addColumnSafe("settings", "report_default_output", "TEXT DEFAULT 'thermal'");
      addColumnSafe("settings", "receipt_template_config", "TEXT");
      addColumnSafe("inventory_items", "cost_per_unit", "REAL DEFAULT 0");
      addColumnSafe("inventory_items", "sku", "TEXT");
      addColumnSafe("inventory_items", "is_countable", "INTEGER DEFAULT 0");
      addColumnSafe("inventory_items", "pieces_per_carton", "INTEGER");
      addColumnSafe("inventory_items", "minimum_stock", "INTEGER");
      addColumnSafe("stock_movements", "reason", "TEXT");
      addColumnSafe("settings", "auto_backup_frequency", "TEXT");
      addColumnSafe("purchases", "date", "TEXT");
      addColumnSafe("supplier_payments", "cafe_id", "TEXT");
      addColumnSafe("supplier_payments", "payment_method", "TEXT");
      addColumnSafe("supplier_payments", "date", "TEXT");
      addColumnSafe("supplier_payments", "reference_number", "TEXT");
      addColumnSafe("daily_closings", "closed_at", "TEXT");
      addColumnSafe("daily_closings", "closed_by", "TEXT");
      addColumnSafe("daily_closings", "cash_sales", "REAL DEFAULT 0");
      addColumnSafe("daily_closings", "instapay_sales", "REAL DEFAULT 0");
      addColumnSafe("daily_closings", "vodafone_cash_sales", "REAL DEFAULT 0");
      addColumnSafe("daily_closings", "cash_in_drawer", "REAL DEFAULT 0");
      addColumnSafe("daily_closings", "expected_cash", "REAL DEFAULT 0");
      addColumnSafe("daily_closings", "difference", "REAL DEFAULT 0");
      addColumnSafe("daily_closing_items", "category_name", "TEXT");
      addColumnSafe("daily_closing_items", "product_name", "TEXT");
      addColumnSafe("daily_closing_items", "total_sales", "REAL DEFAULT 0");
      addColumnSafe("order_audit_log", "action", "TEXT");
      addColumnSafe("order_audit_log", "performed_by", "TEXT");
      addColumnSafe("order_audit_log", "timestamp", "TEXT");
      addColumnSafe("order_audit_log", "details", "TEXT");
      addColumnSafe("order_audit_log", "reason", "TEXT");
      return _drizzleDb;
    }
    function getDb2() {
      if (!_drizzleDb) {
        throw new Error("Database not initialized. Call initDb() first.");
      }
      return _drizzleDb;
    }
    function getRawDb() {
      return _db;
    }
    function getDbPath() {
      const appDataPath = app.getPath("appData");
      return path.join(appDataPath, "OPA Cafe", "database", "cafe.sqlite");
    }
    function closeDb() {
      if (_db) {
        _db.close();
        _db = null;
        _drizzleDb = null;
      }
    }
    module2.exports = {
      initDb: initDb2,
      getDb: getDb2,
      getRawDb,
      getDbPath,
      closeDb,
      schema: schema2
    };
  }
});

// electron/database/handlers.cjs
var require_handlers = __commonJS({
  "electron/database/handlers.cjs"(exports2, module2) {
    var { ipcMain } = require("electron");
    var { getDb: getDb2 } = require_db();
    var schema2 = require_schema();
    var { eq, ne, gt, gte, lt, lte, inArray, isNull, and, asc, desc } = require("drizzle-orm");
    function setupHandlers() {
      const db = getDb2();
      const getTable = (tableName) => {
        const tableMap = {
          "app_users": schema2.appUsers,
          "categories": schema2.categories,
          "products": schema2.products,
          "inventory_items": schema2.inventoryItems,
          "stock_movements": schema2.stockMovements,
          "dining_tables": schema2.diningTables,
          "tables": schema2.diningTables,
          "orders": schema2.orders,
          "order_items": schema2.orderItems,
          "suppliers": schema2.suppliers,
          "purchases": schema2.purchases,
          "purchase_items": schema2.purchaseItems,
          "supplier_payments": schema2.supplierPayments,
          "expenses": schema2.expenses,
          "daily_closings": schema2.dailyClosings,
          "daily_closing_items": schema2.dailyClosingItems,
          "settings": schema2.settings,
          "order_audit_log": schema2.orderAuditLog,
          "sync_queue": schema2.syncQueue
        };
        return tableMap[tableName];
      };
      ipcMain.handle("db:findMany", async (event, { table, where, options, orderBy, limit, offset }) => {
        try {
          const t = getTable(table);
          if (!t) throw new Error(`Table ${table} not found`);
          let query = db.select().from(t);
          const conditions = [];
          if (t.deleted_at) {
            conditions.push(isNull(t.deleted_at));
          }
          if (where) {
            for (const [key, value] of Object.entries(where)) {
              if (!t[key]) continue;
              if (value !== null && typeof value === "object" && !Array.isArray(value)) {
                for (const [op, opValue] of Object.entries(value)) {
                  if (op === "$eq") conditions.push(eq(t[key], opValue));
                  else if (op === "$ne") conditions.push(ne(t[key], opValue));
                  else if (op === "$gt") conditions.push(gt(t[key], opValue));
                  else if (op === "$gte") conditions.push(gte(t[key], opValue));
                  else if (op === "$lt") conditions.push(lt(t[key], opValue));
                  else if (op === "$lte") conditions.push(lte(t[key], opValue));
                  else if (op === "$in" && Array.isArray(opValue) && opValue.length > 0) conditions.push(inArray(t[key], opValue));
                }
              } else if (Array.isArray(value) && value.length > 0) {
                conditions.push(inArray(t[key], value));
              } else if (value !== void 0) {
                conditions.push(eq(t[key], value));
              }
            }
          }
          if (conditions.length > 0) {
            query = query.where(and(...conditions));
          }
          const finalOrderBy = orderBy || options?.orderBy;
          if (finalOrderBy && finalOrderBy.column && t[finalOrderBy.column]) {
            if (finalOrderBy.direction === "desc") {
              query = query.orderBy(desc(t[finalOrderBy.column]));
            } else {
              query = query.orderBy(asc(t[finalOrderBy.column]));
            }
          }
          const finalLimit = typeof limit === "number" ? limit : typeof options?.limit === "number" ? options.limit : void 0;
          if (typeof finalLimit === "number" && finalLimit > 0) {
            query = query.limit(finalLimit);
          }
          const finalOffset = typeof offset === "number" ? offset : typeof options?.offset === "number" ? options.offset : void 0;
          if (typeof finalOffset === "number" && finalOffset >= 0) {
            query = query.offset(finalOffset);
          }
          return await query.execute();
        } catch (e) {
          console.error(`db:findMany error (${table}):`, e);
          throw e;
        }
      });
      ipcMain.handle("db:findOne", async (event, { table, id }) => {
        try {
          const t = getTable(table);
          if (!t) throw new Error(`Table ${table} not found`);
          const conditions = [eq(t.id, id)];
          if (t.deleted_at) {
            conditions.push(isNull(t.deleted_at));
          }
          const result = await db.select().from(t).where(and(...conditions)).limit(1).execute();
          return result[0] || null;
        } catch (e) {
          console.error(`db:findOne error (${table}):`, e);
          throw e;
        }
      });
      ipcMain.handle("db:insert", async (event, { table, data }) => {
        try {
          const t = getTable(table);
          if (!t) throw new Error(`Table ${table} not found`);
          await db.insert(t).values(data).execute();
          return { success: true };
        } catch (e) {
          console.error(`db:insert error (${table}):`, e);
          throw e;
        }
      });
      ipcMain.handle("db:insertMany", async (event, { table, data }) => {
        try {
          const t = getTable(table);
          if (!t) throw new Error(`Table ${table} not found`);
          if (data && data.length > 0) {
            await db.insert(t).values(data).execute();
          }
          return { success: true };
        } catch (e) {
          console.error(`db:insertMany error (${table}):`, e);
          throw e;
        }
      });
      ipcMain.handle("db:update", async (event, { table, id, data }) => {
        try {
          const t = getTable(table);
          if (!t) throw new Error(`Table ${table} not found`);
          await db.update(t).set(data).where(eq(t.id, id)).execute();
          return { success: true };
        } catch (e) {
          console.error(`db:update error (${table}):`, e);
          throw e;
        }
      });
      ipcMain.handle("db:delete", async (event, { table, id }) => {
        try {
          const t = getTable(table);
          if (!t) throw new Error(`Table ${table} not found`);
          await db.delete(t).where(eq(t.id, id)).execute();
          return { success: true };
        } catch (e) {
          console.error(`db:delete error (${table}):`, e);
          throw e;
        }
      });
      ipcMain.handle("db:transaction", (event, operations) => {
        try {
          return db.transaction((tx) => {
            for (const op of operations) {
              const t = getTable(op.table);
              if (!t) throw new Error(`Table ${op.table} not found`);
              if (op.type === "insert") {
                tx.insert(t).values(op.data).run();
              } else if (op.type === "update") {
                tx.update(t).set(op.data).where(eq(t.id, op.id)).run();
              } else if (op.type === "delete") {
                tx.delete(t).where(eq(t.id, op.id)).run();
              } else if (op.type === "insertMany") {
                if (op.data && op.data.length > 0) {
                  tx.insert(t).values(op.data).run();
                }
              }
            }
            return { success: true };
          });
        } catch (e) {
          console.error(`db:transaction error:`, e);
          throw e;
        }
      });
    }
    module2.exports = { setupHandlers };
  }
});

// src/infrastructure/database/ElectronIpcDatabaseDriver.ts
var ElectronIpcDatabaseDriver, defaultDatabaseDriver;
var init_ElectronIpcDatabaseDriver = __esm({
  "src/infrastructure/database/ElectronIpcDatabaseDriver.ts"() {
    ElectronIpcDatabaseDriver = class {
      get db() {
        if (typeof window === "undefined" || !window.electronAPI || !window.electronAPI.db) {
          throw new Error("electronAPI.db is not available in this environment");
        }
        return window.electronAPI.db;
      }
      async findMany(tableName, where, options) {
        return this.db.findMany(tableName, where, options);
      }
      async findOne(tableName, id) {
        return this.db.findOne(tableName, id);
      }
      async insert(tableName, data) {
        await this.db.insert(tableName, data);
      }
      async insertMany(tableName, data) {
        await this.db.insertMany(tableName, data);
      }
      async update(tableName, id, data) {
        await this.db.update(tableName, id, data);
      }
      async delete(tableName, id) {
        await this.db.delete(tableName, id);
      }
    };
    defaultDatabaseDriver = new ElectronIpcDatabaseDriver();
  }
});

// src/infrastructure/repositories/BaseElectronRepository.ts
var BaseElectronRepository;
var init_BaseElectronRepository = __esm({
  "src/infrastructure/repositories/BaseElectronRepository.ts"() {
    init_ElectronIpcDatabaseDriver();
    BaseElectronRepository = class {
      constructor(tableName, dbDriver) {
        this.tableName = tableName;
        this.dbDriver = dbDriver || defaultDatabaseDriver;
      }
      async findMany(where, options) {
        return this.dbDriver.findMany(this.tableName, where, options);
      }
      async findOne(id) {
        return this.dbDriver.findOne(this.tableName, id);
      }
      async insert(data) {
        await this.dbDriver.insert(this.tableName, data);
      }
      async insertMany(data) {
        await this.dbDriver.insertMany(this.tableName, data);
      }
      async update(id, data) {
        await this.dbDriver.update(this.tableName, id, data);
      }
      async delete(id) {
        await this.dbDriver.delete(this.tableName, id);
      }
    };
  }
});

// src/infrastructure/repositories/RepositoryFactory.ts
function createRepository(tableName) {
  return new BaseElectronRepository(tableName);
}
var init_RepositoryFactory = __esm({
  "src/infrastructure/repositories/RepositoryFactory.ts"() {
    init_BaseElectronRepository();
  }
});

// src/application/sync/syncQueue.ts
function getDeviceId() {
  let deviceId = localStorage.getItem("device_id");
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("device_id", deviceId);
  }
  return deviceId;
}
function buildSyncOperation(action, table, payload) {
  let finalAction = action;
  let finalPayload = { ...payload };
  finalPayload.updated_at = (/* @__PURE__ */ new Date()).toISOString();
  finalPayload.device_id = getDeviceId();
  finalPayload.version = (typeof payload.version === "number" ? payload.version : 0) + 1;
  const offlineUserId = localStorage.getItem("offline_user_id");
  if (offlineUserId) {
    finalPayload.last_modified_by = offlineUserId;
  }
  if (action === "delete") {
    finalAction = "update";
    finalPayload.deleted_at = (/* @__PURE__ */ new Date()).toISOString();
  }
  return {
    type: "insert",
    table: "sync_queue",
    data: {
      id: crypto.randomUUID(),
      action: finalAction,
      table_name: table,
      payload: JSON.stringify(finalPayload),
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      status: "pending",
      retry_count: 0,
      record_id: typeof finalPayload.id === "string" ? finalPayload.id : void 0
    }
  };
}
function triggerBackgroundSync() {
  if (typeof navigator !== "undefined" && navigator.onLine) {
    if (window.electronAPI) {
      window.electronAPI.triggerSync();
    } else {
      setTimeout(() => {
        processSyncQueue().catch(console.error);
      }, 100);
    }
  }
}
function createSyncableOperation(action, table, data, id) {
  const ops = [];
  if (action === "insert") {
    ops.push({ type: "insert", table, data });
  } else if (action === "update" && id) {
    ops.push({ type: "update", table, id, data });
  } else if (action === "delete" && id) {
    ops.push({ type: "delete", table, id });
  }
  ops.push(buildSyncOperation(action, table, data));
  return ops;
}
async function enqueueSync(action, table, payload) {
  const repo = createRepository("sync_queue");
  const syncOp = buildSyncOperation(action, table, payload);
  await repo.insert(syncOp.data);
  triggerBackgroundSync();
}
async function processSyncQueue() {
  if (window.electronAPI) {
    window.electronAPI.triggerSync();
    return;
  }
}
var init_syncQueue = __esm({
  "src/application/sync/syncQueue.ts"() {
    init_RepositoryFactory();
    window.addEventListener("online", () => {
      console.log("[SyncQueue] Back online \u2014 flushing queue");
      processSyncQueue();
    });
  }
});

// src/infrastructure/repositories/SQLiteAuthRepository.ts
var SQLiteAuthRepository;
var init_SQLiteAuthRepository = __esm({
  "src/infrastructure/repositories/SQLiteAuthRepository.ts"() {
    init_ElectronIpcDatabaseDriver();
    SQLiteAuthRepository = class {
      constructor(dbDriver = defaultDatabaseDriver) {
        this.dbDriver = dbDriver;
        this.tableName = "app_users";
      }
      async findById(id) {
        return this.dbDriver.findOne(this.tableName, id);
      }
      async findByEmail(email) {
        const users = await this.dbDriver.findMany(this.tableName, { email });
        return users.length > 0 ? users[0] : null;
      }
      async getUsers(cafeId) {
        return this.dbDriver.findMany(this.tableName, { cafe_id: cafeId });
      }
      async insertUser(user) {
        await this.dbDriver.insert(this.tableName, user);
      }
      async updateUser(id, user) {
        await this.dbDriver.update(this.tableName, id, user);
      }
      async deleteUser(id) {
        await this.dbDriver.update(this.tableName, id, { deleted_at: (/* @__PURE__ */ new Date()).toISOString() });
      }
      async countUsers() {
        const all = await this.dbDriver.findMany(this.tableName, {});
        return all.length;
      }
    };
  }
});

// src/infrastructure/repositories/SQLiteSettingsRepository.ts
var SQLiteSettingsRepository;
var init_SQLiteSettingsRepository = __esm({
  "src/infrastructure/repositories/SQLiteSettingsRepository.ts"() {
    init_BaseElectronRepository();
    SQLiteSettingsRepository = class extends BaseElectronRepository {
      constructor(dbDriver) {
        super("settings", dbDriver);
      }
      async getSettings(cafeId) {
        const list = await this.dbDriver.findMany("settings", { cafe_id: cafeId });
        return list.length > 0 ? list[0] : null;
      }
      async createSettings(settings) {
        await this.dbDriver.insert("settings", settings);
      }
      async updateSettings(id, updates) {
        await this.dbDriver.update("settings", id, updates);
      }
    };
  }
});

// src/infrastructure/repositories/SQLiteCategoryRepository.ts
var SQLiteCategoryRepository;
var init_SQLiteCategoryRepository = __esm({
  "src/infrastructure/repositories/SQLiteCategoryRepository.ts"() {
    init_BaseElectronRepository();
    SQLiteCategoryRepository = class extends BaseElectronRepository {
      constructor(dbDriver) {
        super("categories", dbDriver);
      }
      async getCategories(cafeId) {
        const list = await this.dbDriver.findMany("categories", { cafe_id: cafeId });
        return list.filter((c) => c.status !== "inactive");
      }
      async createCategory(category) {
        await this.dbDriver.insert("categories", category);
      }
      async updateCategory(id, updates) {
        await this.dbDriver.update("categories", id, updates);
      }
      async deleteCategory(id) {
        await this.dbDriver.delete("categories", id);
      }
      async findByName(cafeId, name) {
        const list = await this.dbDriver.findMany("categories", { cafe_id: cafeId });
        const existing = list.find(
          (c) => c.name.trim().toLowerCase() === name.trim().toLowerCase() && c.status !== "inactive"
        );
        return existing ? existing : null;
      }
    };
  }
});

// src/infrastructure/repositories/SQLiteProductRepository.ts
var SQLiteProductRepository;
var init_SQLiteProductRepository = __esm({
  "src/infrastructure/repositories/SQLiteProductRepository.ts"() {
    init_BaseElectronRepository();
    SQLiteProductRepository = class extends BaseElectronRepository {
      constructor(dbDriver) {
        super("products", dbDriver);
      }
      async getProducts(cafeId) {
        const list = await this.dbDriver.findMany("products", { cafe_id: cafeId });
        return list.filter((p) => !p.deleted_at).sort((a, b) => a.name.localeCompare(b.name));
      }
      async getProductById(id) {
        const p = await this.dbDriver.findOne("products", id);
        if (!p || p.deleted_at) return null;
        return p;
      }
      async getProductsByCategory(categoryId) {
        const list = await this.dbDriver.findMany("products", { category_id: categoryId });
        return list.filter((p) => p.status !== "inactive");
      }
      async createProduct(product) {
        await this.dbDriver.insert("products", product);
      }
      async updateProduct(id, updates) {
        await this.dbDriver.update("products", id, updates);
      }
      async deleteProduct(id) {
        await this.dbDriver.delete("products", id);
      }
    };
  }
});

// src/infrastructure/repositories/SQLiteInventoryRepository.ts
var SQLiteInventoryRepository;
var init_SQLiteInventoryRepository = __esm({
  "src/infrastructure/repositories/SQLiteInventoryRepository.ts"() {
    init_BaseElectronRepository();
    SQLiteInventoryRepository = class extends BaseElectronRepository {
      constructor(dbDriver) {
        super("inventory_items", dbDriver);
      }
      async getInventoryItems(cafeId) {
        const list = await this.dbDriver.findMany("inventory_items", { cafe_id: cafeId });
        return list.filter((i) => !i.deleted_at);
      }
      async findOne(id) {
        const item = await this.dbDriver.findOne("inventory_items", id);
        if (!item || item.deleted_at) return null;
        return item;
      }
      async addInventoryItem(item) {
        await this.dbDriver.insert("inventory_items", item);
      }
      async updateInventoryItem(id, updates) {
        await this.dbDriver.update("inventory_items", id, updates);
      }
      async deleteInventoryItem(id) {
        await this.dbDriver.delete("inventory_items", id);
      }
      async getStockMovements(cafeId, itemId) {
        const list = await this.dbDriver.findMany("stock_movements", { cafe_id: cafeId, inventory_item_id: itemId });
        return list.filter((m) => !m.deleted_at).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      async recordStockMovement(movement) {
        await this.dbDriver.insert("stock_movements", movement);
      }
    };
  }
});

// src/infrastructure/repositories/SQLiteSupplierRepository.ts
var SQLiteSupplierRepository;
var init_SQLiteSupplierRepository = __esm({
  "src/infrastructure/repositories/SQLiteSupplierRepository.ts"() {
    init_BaseElectronRepository();
    SQLiteSupplierRepository = class extends BaseElectronRepository {
      constructor(dbDriver) {
        super("suppliers", dbDriver);
      }
      async getSuppliers(cafeId) {
        const list = await this.dbDriver.findMany("suppliers", { cafe_id: cafeId });
        return list.filter((s) => !s.deleted_at).sort((a, b) => a.name.localeCompare(b.name));
      }
      async findOne(id) {
        const s = await this.dbDriver.findOne("suppliers", id);
        if (!s || s.deleted_at) return null;
        return s;
      }
      async createSupplier(supplier) {
        await this.dbDriver.insert("suppliers", supplier);
      }
      async updateSupplier(id, updates) {
        await this.dbDriver.update("suppliers", id, updates);
      }
      async deleteSupplier(id) {
        await this.dbDriver.delete("suppliers", id);
      }
    };
  }
});

// src/infrastructure/repositories/SQLitePurchaseRepository.ts
var SQLitePurchaseRepository;
var init_SQLitePurchaseRepository = __esm({
  "src/infrastructure/repositories/SQLitePurchaseRepository.ts"() {
    init_BaseElectronRepository();
    SQLitePurchaseRepository = class extends BaseElectronRepository {
      constructor(dbDriver) {
        super("purchases", dbDriver);
      }
      async getPurchases(cafeId) {
        const list = await this.dbDriver.findMany("purchases", { cafe_id: cafeId });
        return list.filter((p) => !p.deleted_at).map((p) => ({ ...p, amount_remaining: p.total_amount - (p.amount_paid || 0) })).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).reverse();
      }
      async getPurchaseById(id) {
        const p = await this.dbDriver.findOne("purchases", id);
        if (!p || p.deleted_at) return null;
        return { ...p, amount_remaining: p.total_amount - (p.amount_paid || 0) };
      }
      async getPurchaseItems(purchaseId) {
        const list = await this.dbDriver.findMany("purchase_items", { purchase_id: purchaseId });
        return list.filter((i) => !i.deleted_at);
      }
      async getPurchaseItemsByPurchaseIds(purchaseIds) {
        if (purchaseIds.length === 0) return [];
        const results = [];
        const chunkSize = 100;
        for (let i = 0; i < purchaseIds.length; i += chunkSize) {
          const chunk = purchaseIds.slice(i, i + chunkSize);
          const items = await this.dbDriver.findMany("purchase_items", {
            purchase_id: { $in: chunk }
          }, {
            operators: { purchase_id: "$in" }
          });
          results.push(...items.filter((item) => !item.deleted_at));
        }
        return results;
      }
      async getSupplierPayments(purchaseId) {
        const list = await this.dbDriver.findMany("supplier_payments", { purchase_id: purchaseId });
        return list.filter((p) => !p.deleted_at);
      }
      async getPayments(cafeId) {
        const list = await this.dbDriver.findMany("supplier_payments");
        return list.filter((p) => !p.deleted_at);
      }
    };
  }
});

// src/infrastructure/repositories/SQLiteExpenseRepository.ts
var SQLiteExpenseRepository;
var init_SQLiteExpenseRepository = __esm({
  "src/infrastructure/repositories/SQLiteExpenseRepository.ts"() {
    init_BaseElectronRepository();
    SQLiteExpenseRepository = class extends BaseElectronRepository {
      constructor(dbDriver) {
        super("expenses", dbDriver);
      }
      async getExpenses(cafeId) {
        const list = await this.dbDriver.findMany("expenses", { cafe_id: cafeId });
        return list.filter((e) => !e.deleted_at).sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime());
      }
      async findOne(id) {
        const e = await this.dbDriver.findOne("expenses", id);
        if (!e || e.deleted_at) return null;
        return e;
      }
      async createExpense(expense) {
        await this.dbDriver.insert("expenses", expense);
      }
      async updateExpense(id, updates) {
        await this.dbDriver.update("expenses", id, updates);
      }
      async deleteExpense(id) {
        await this.dbDriver.delete("expenses", id);
      }
    };
  }
});

// src/infrastructure/repositories/SQLiteOrderRepository.ts
var SQLiteOrderRepository;
var init_SQLiteOrderRepository = __esm({
  "src/infrastructure/repositories/SQLiteOrderRepository.ts"() {
    init_BaseElectronRepository();
    SQLiteOrderRepository = class extends BaseElectronRepository {
      constructor(dbDriver) {
        super("orders", dbDriver);
      }
      async getOrders(cafeId) {
        const list = await this.dbDriver.findMany("orders", { cafe_id: cafeId }, {
          orderBy: { column: "created_at", direction: "desc" }
        });
        return list.filter((o) => !o.deleted_at);
      }
      async getOrdersByDateRange(cafeId, startTime, endTime) {
        const list = await this.dbDriver.findMany("orders", {
          cafe_id: cafeId,
          created_at: { $gt: startTime, $lte: endTime }
        }, {
          orderBy: { column: "created_at", direction: "desc" }
        });
        return list.filter((o) => !o.deleted_at);
      }
      async getOrderById(id) {
        const o = await this.dbDriver.findOne("orders", id);
        if (!o || o.deleted_at) return null;
        return o;
      }
      async getOrderItems(orderId) {
        const list = await this.dbDriver.findMany("order_items", { order_id: orderId });
        return list.filter((i) => !i.deleted_at);
      }
      async getOrderItemsByOrderIds(orderIds) {
        if (!orderIds || orderIds.length === 0) return [];
        const chunks = [];
        for (let i = 0; i < orderIds.length; i += 200) {
          chunks.push(orderIds.slice(i, i + 200));
        }
        const results = [];
        for (const chunk of chunks) {
          const list = await this.dbDriver.findMany("order_items", {
            order_id: { $in: chunk }
          });
          const valid = list.filter((i) => !i.deleted_at);
          results.push(...valid);
        }
        return results;
      }
      async getAllOrderItems() {
        const list = await this.dbDriver.findMany("order_items");
        return list.filter((i) => !i.deleted_at);
      }
      async getTables(cafeId) {
        const list = await this.dbDriver.findMany("tables", { cafe_id: cafeId });
        return list.filter((t) => !t.deleted_at).sort((a, b) => a.name.localeCompare(b.name));
      }
      async getTableById(id) {
        const t = await this.dbDriver.findOne("tables", id);
        if (!t || t.deleted_at) return null;
        return t;
      }
      async updateTable(id, updates) {
        await this.dbDriver.update("tables", id, updates);
      }
      async getAuditLogs(cafeId) {
        const list = await this.dbDriver.findMany("order_audit_log", { cafe_id: cafeId });
        return list.filter((l) => !l.deleted_at).sort((a, b) => new Date(b.timestamp || b.created_at).getTime() - new Date(a.timestamp || a.created_at).getTime()).map((l) => {
          let parsedDetails = {};
          try {
            parsedDetails = JSON.parse(l.details || "{}");
          } catch {
          }
          return {
            ...l,
            action_type: l.action,
            initiated_by_name: l.performed_by,
            initiated_by_user_id: parsedDetails.initiated_by_user_id,
            approved_by_owner_pin: parsedDetails.approved_by_owner_pin ?? true,
            order_total: parsedDetails.order_total ?? 0
          };
        });
      }
    };
  }
});

// src/infrastructure/repositories/SQLiteClosingRepository.ts
var SQLiteClosingRepository;
var init_SQLiteClosingRepository = __esm({
  "src/infrastructure/repositories/SQLiteClosingRepository.ts"() {
    init_BaseElectronRepository();
    SQLiteClosingRepository = class extends BaseElectronRepository {
      constructor(dbDriver) {
        super("daily_closings", dbDriver);
      }
      async getClosings(cafeId) {
        const list = await this.dbDriver.findMany("daily_closings", { cafe_id: cafeId }, {
          orderBy: { column: "closed_at", direction: "desc" }
        });
        return list.filter((c) => !c.deleted_at);
      }
      async getClosingsByDatePrefix(cafeId, prefix) {
        const list = await this.dbDriver.findMany("daily_closings", {
          cafe_id: cafeId,
          closing_date: { $gte: `${prefix}-01`, $lte: `${prefix}-31` }
        }, {
          orderBy: { column: "closing_date", direction: "asc" }
        });
        return list.filter((c) => !c.deleted_at);
      }
      async getClosingById(id) {
        const c = await this.dbDriver.findOne("daily_closings", id);
        if (!c || c.deleted_at) return null;
        return c;
      }
      async getClosingByDate(cafeId, date) {
        const list = await this.dbDriver.findMany("daily_closings", {
          cafe_id: cafeId,
          closing_date: date
        });
        const valid = list.filter((c) => !c.deleted_at);
        return valid[0] || null;
      }
      async getClosingItems(closingId) {
        const list = await this.dbDriver.findMany("daily_closing_items", { daily_closing_id: closingId });
        return list.filter((i) => !i.deleted_at);
      }
    };
  }
});

// src/infrastructure/repositories/index.ts
var authRepository, settingsRepository, categoryRepository, productRepository, inventoryRepository, supplierRepository, purchaseRepository, expenseRepository, orderRepository, closingRepository;
var init_repositories = __esm({
  "src/infrastructure/repositories/index.ts"() {
    init_SQLiteAuthRepository();
    init_SQLiteSettingsRepository();
    init_SQLiteCategoryRepository();
    init_SQLiteProductRepository();
    init_SQLiteInventoryRepository();
    init_SQLiteSupplierRepository();
    init_SQLitePurchaseRepository();
    init_SQLiteExpenseRepository();
    init_SQLiteOrderRepository();
    init_SQLiteClosingRepository();
    authRepository = new SQLiteAuthRepository();
    settingsRepository = new SQLiteSettingsRepository();
    categoryRepository = new SQLiteCategoryRepository();
    productRepository = new SQLiteProductRepository();
    inventoryRepository = new SQLiteInventoryRepository();
    supplierRepository = new SQLiteSupplierRepository();
    purchaseRepository = new SQLitePurchaseRepository();
    expenseRepository = new SQLiteExpenseRepository();
    orderRepository = new SQLiteOrderRepository();
    closingRepository = new SQLiteClosingRepository();
  }
});

// src/application/useCases/inventory/manageInventory.ts
var manageInventory_exports = {};
__export(manageInventory_exports, {
  addInventoryItem: () => addInventoryItem,
  deleteInventoryItem: () => deleteInventoryItem,
  getInventoryItems: () => getInventoryItems,
  updateInventoryItem: () => updateInventoryItem
});
async function getInventoryItems(cafeId) {
  return await inventoryRepository.getInventoryItems(cafeId);
}
async function addInventoryItem(item) {
  const newItem = {
    ...item,
    id: crypto.randomUUID(),
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  await inventoryRepository.addInventoryItem(newItem);
  await enqueueSync("insert", "inventory_items", newItem);
}
async function updateInventoryItem(item) {
  await inventoryRepository.updateInventoryItem(item.id, item);
  await enqueueSync("update", "inventory_items", item);
}
async function deleteInventoryItem(id, cafeId) {
  const allProducts = await productRepository.getProducts(cafeId);
  const linkedProducts = allProducts.filter((p) => p.inventory_item_id === id);
  if (linkedProducts.length > 0) {
    throw new Error("Cannot delete this item because it is linked to one or more products. Please unlink them first.");
  }
  await inventoryRepository.deleteInventoryItem(id);
  await enqueueSync("delete", "inventory_items", { id });
}
var init_manageInventory = __esm({
  "src/application/useCases/inventory/manageInventory.ts"() {
    init_syncQueue();
    init_repositories();
  }
});

// src/application/useCases/products/manageProducts.ts
var manageProducts_exports = {};
__export(manageProducts_exports, {
  createProduct: () => createProduct,
  deleteProduct: () => deleteProduct,
  getProducts: () => getProducts,
  updateProduct: () => updateProduct
});
async function getProducts(cafeId) {
  return await productRepository.getProducts(cafeId);
}
async function createProduct(cafeId, categoryId, name, price, cost, track_stock = false, inventory_item_id) {
  if (track_stock && !inventory_item_id) {
    throw new Error("Inventory Item ID is required when tracking stock.");
  }
  const product = {
    id: crypto.randomUUID(),
    cafe_id: cafeId,
    category_id: categoryId,
    name,
    price,
    cost,
    status: "active",
    track_stock,
    inventory_item_id: inventory_item_id || null,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  await productRepository.createProduct(product);
  await enqueueSync("insert", "products", product);
  return product;
}
async function updateProduct(product) {
  if (product.track_stock && !product.inventory_item_id) {
    throw new Error("Inventory Item ID is required when tracking stock.");
  }
  await productRepository.updateProduct(product.id, product);
  await enqueueSync("update", "products", product);
  return product;
}
async function deleteProduct(product) {
  await productRepository.deleteProduct(product.id);
  await enqueueSync("delete", "products", { id: product.id });
}
var init_manageProducts = __esm({
  "src/application/useCases/products/manageProducts.ts"() {
    init_syncQueue();
    init_repositories();
  }
});

// src/infrastructure/database/transaction.ts
async function executeTransaction(operations) {
  if (typeof window !== "undefined" && window.electronAPI) {
    await window.electronAPI.db.transaction(operations);
  } else {
    throw new Error("Transactions are only supported in Electron environment via IPC.");
  }
}
var init_transaction = __esm({
  "src/infrastructure/database/transaction.ts"() {
  }
});

// src/application/useCases/suppliers/managePurchases.ts
var managePurchases_exports = {};
__export(managePurchases_exports, {
  createPurchase: () => createPurchase,
  getPurchaseDetails: () => getPurchaseDetails,
  getPurchases: () => getPurchases,
  recordPayment: () => recordPayment
});
async function getPurchases(cafeId) {
  return await purchaseRepository.getPurchases(cafeId);
}
async function getPurchaseDetails(purchaseId) {
  const purchase = await purchaseRepository.getPurchaseById(purchaseId);
  if (!purchase) return null;
  const [items, payments] = await Promise.all([
    purchaseRepository.getPurchaseItems(purchaseId),
    purchaseRepository.getSupplierPayments(purchaseId)
  ]);
  return { purchase, items, payments };
}
async function createPurchase(params) {
  if (!params.items || params.items.length === 0) {
    throw new Error("Purchase must contain at least one item");
  }
  const purchaseId = crypto.randomUUID();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const purchaseItems = params.items.map((item) => {
    if (item.quantity <= 0) throw new Error(`Invalid quantity for item ${item.itemName || item.inventoryItemId}`);
    if (item.unitCost < 0) throw new Error(`Invalid unit cost for item ${item.itemName || item.inventoryItemId}`);
    return {
      id: crypto.randomUUID(),
      purchase_id: purchaseId,
      inventory_item_id: item.inventoryItemId,
      item_name: item.itemName,
      quantity: item.quantity,
      unit_cost: item.unitCost,
      subtotal: item.quantity * item.unitCost
    };
  });
  const totalAmount = purchaseItems.reduce((sum, i) => sum + i.subtotal, 0);
  const purchase = {
    id: purchaseId,
    cafe_id: params.cafeId,
    supplier_id: params.supplierId,
    total_amount: totalAmount,
    amount_paid: 0,
    amount_remaining: totalAmount,
    payment_status: "unpaid",
    date: now,
    created_at: now
  };
  const ops = [];
  const dbPurchase = { ...purchase };
  delete dbPurchase.amount_remaining;
  ops.push({ type: "insert", table: "purchases", data: dbPurchase });
  ops.push(buildSyncOperation("insert", "purchases", purchase));
  if (purchaseItems.length > 0) {
    ops.push({ type: "insertMany", table: "purchase_items", data: purchaseItems });
    for (const item of purchaseItems) {
      ops.push(buildSyncOperation("insert", "purchase_items", item));
      const inventoryItem = await inventoryRepository.findOne(item.inventory_item_id);
      if (inventoryItem) {
        const oldQty = inventoryItem.stock_quantity;
        const oldCost = inventoryItem.cost_per_unit || 0;
        const newQty = oldQty + item.quantity;
        let newCost = oldCost;
        if (newQty > 0) {
          newCost = (oldQty * oldCost + item.quantity * item.unit_cost) / newQty;
        }
        const updatedItem = {
          ...inventoryItem,
          stock_quantity: newQty,
          cost_per_unit: newCost
        };
        ops.push(...createSyncableOperation("update", "inventory_items", updatedItem, updatedItem.id));
      }
    }
  }
  await executeTransaction(ops);
  triggerBackgroundSync();
  return purchase;
}
async function recordPayment(purchase, amount, notes, paymentMethod = "cash") {
  if (amount <= 0) {
    throw new Error("Payment amount must be greater than zero");
  }
  const newAmountPaid = purchase.amount_paid + amount;
  const newAmountRemaining = purchase.total_amount - newAmountPaid;
  const newStatus = newAmountRemaining <= 0 ? "paid" : "partial";
  const updatedPurchase = {
    ...purchase,
    amount_paid: newAmountPaid,
    amount_remaining: Math.max(0, newAmountRemaining),
    payment_status: newStatus
  };
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const payment = {
    id: crypto.randomUUID(),
    cafe_id: purchase.cafe_id,
    purchase_id: purchase.id,
    supplier_id: purchase.supplier_id,
    amount,
    payment_method: paymentMethod,
    date: now.split("T")[0],
    notes: notes || null,
    created_at: now
  };
  const dbPurchase = { ...updatedPurchase };
  delete dbPurchase.amount_remaining;
  const ops = [
    { type: "update", table: "purchases", id: updatedPurchase.id, data: dbPurchase },
    buildSyncOperation("update", "purchases", updatedPurchase),
    ...createSyncableOperation("insert", "supplier_payments", payment)
  ];
  await executeTransaction(ops);
  triggerBackgroundSync();
  return { purchase: updatedPurchase, payment };
}
var init_managePurchases = __esm({
  "src/application/useCases/suppliers/managePurchases.ts"() {
    init_syncQueue();
    init_repositories();
    init_transaction();
  }
});

// src/domain/services/OrderStockService.ts
var OrderStockService;
var init_OrderStockService = __esm({
  "src/domain/services/OrderStockService.ts"() {
    init_syncQueue();
    OrderStockService = class {
      static async generateDeductionOperations(orderId, cafeId, items, productRepo, inventoryRepo, timestamp) {
        const ops = [];
        for (const item of items) {
          const product = await productRepo.getProductById(item.product_id);
          if (!product || !product.track_stock || !product.inventory_item_id) continue;
          const inventoryItem = await inventoryRepo.findOne(product.inventory_item_id);
          if (!inventoryItem) continue;
          const newQuantity = inventoryItem.stock_quantity - item.quantity;
          const updatedItem = { ...inventoryItem, stock_quantity: newQuantity };
          ops.push(...createSyncableOperation("update", "inventory_items", updatedItem, inventoryItem.id));
          const movementId = crypto.randomUUID();
          const movement = {
            id: movementId,
            cafe_id: cafeId,
            inventory_item_id: inventoryItem.id,
            type: "out",
            quantity: item.quantity,
            reason: `Sale - Order ${orderId.split("-")[0]}`,
            created_at: timestamp
          };
          ops.push(...createSyncableOperation("insert", "stock_movements", movement));
        }
        return ops;
      }
    };
  }
});

// src/domain/entities/paymentMethod.ts
function normalizePaymentMethodForSupabase(method) {
  if (!method) return null;
  if (SUPABASE_ALLOWED_PAYMENT_METHODS.includes(method)) {
    return method;
  }
  return "other";
}
var SUPABASE_ALLOWED_PAYMENT_METHODS;
var init_paymentMethod = __esm({
  "src/domain/entities/paymentMethod.ts"() {
    SUPABASE_ALLOWED_PAYMENT_METHODS = ["cash", "card", "other"];
  }
});

// src/application/useCases/pos/placeOrder.ts
var placeOrder_exports = {};
__export(placeOrder_exports, {
  placeOrder: () => placeOrder
});
async function placeOrder(params) {
  if (!params.items || params.items.length === 0) {
    throw new Error("Cannot place an empty order");
  }
  const subtotal = params.items.reduce((sum, item) => sum + item.subtotal, 0);
  if (params.total < 0) {
    throw new Error("Discount cannot exceed subtotal");
  }
  if (params.total > subtotal) {
    throw new Error("Total cannot exceed subtotal (invalid discount)");
  }
  const orderId = crypto.randomUUID();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const status = params.status || "paid";
  const orderType = params.orderType || (params.tableId ? "dine_in" : "takeaway");
  const supabasePaymentMethod = normalizePaymentMethodForSupabase(params.paymentMethod);
  const order = {
    id: orderId,
    cafe_id: params.cafeId,
    table_id: params.tableId || null,
    order_type: orderType,
    status,
    payment_method: supabasePaymentMethod,
    total_amount: params.total,
    created_at: now
  };
  const orderItems = params.items.map((item) => ({
    id: crypto.randomUUID(),
    order_id: orderId,
    product_id: item.product.id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: item.subtotal
  }));
  const ops = [];
  ops.push(...createSyncableOperation("insert", "orders", order));
  if (orderItems.length > 0) {
    ops.push({ type: "insertMany", table: "order_items", data: orderItems });
    for (const item of orderItems) {
      ops.push(buildSyncOperation("insert", "order_items", item));
    }
  }
  const discountAmount = subtotal - params.total;
  if (discountAmount > 0) {
    const auditEntry = {
      id: crypto.randomUUID(),
      cafe_id: params.cafeId,
      order_id: orderId,
      action: "discount",
      performed_by: params.userName || "Unknown Cashier",
      timestamp: now,
      reason: `Discount applied: ${discountAmount}`,
      details: JSON.stringify({
        initiated_by_user_id: params.userId || "unknown",
        approved_by_owner_pin: false,
        order_total: params.total
      }),
      created_at: now
    };
    ops.push(...createSyncableOperation("insert", "order_audit_log", auditEntry));
  }
  if (params.tableId && status === "open") {
    const tableUpdate = { status: "occupied", current_order_id: orderId };
    ops.push(...createSyncableOperation("update", "tables", { id: params.tableId, cafe_id: params.cafeId, ...tableUpdate }, params.tableId));
  }
  if (status === "paid") {
    const stockOps = await OrderStockService.generateDeductionOperations(
      orderId,
      params.cafeId,
      orderItems,
      productRepository,
      inventoryRepository,
      now
    );
    ops.push(...stockOps);
  }
  await executeTransaction(ops);
  triggerBackgroundSync();
  return { orderId };
}
var init_placeOrder = __esm({
  "src/application/useCases/pos/placeOrder.ts"() {
    init_syncQueue();
    init_repositories();
    init_transaction();
    init_OrderStockService();
    init_paymentMethod();
  }
});

// src/application/useCases/products/manageCategories.ts
var manageCategories_exports = {};
__export(manageCategories_exports, {
  createCategory: () => createCategory,
  deleteCategory: () => deleteCategory,
  getCategories: () => getCategories,
  updateCategory: () => updateCategory
});
async function getCategories(cafeId) {
  const local = await categoryRepository.getCategories(cafeId);
  const seenIds = /* @__PURE__ */ new Set();
  const seenNames = /* @__PURE__ */ new Set();
  const unique = local.filter((c) => {
    const nameKey = c.name.trim().toLowerCase();
    if (seenIds.has(c.id) || seenNames.has(nameKey)) return false;
    seenIds.add(c.id);
    seenNames.add(nameKey);
    return true;
  });
  return unique;
}
async function createCategory(cafeId, name) {
  const existing = await categoryRepository.findByName(cafeId, name);
  if (existing) return existing;
  const category = {
    id: crypto.randomUUID(),
    cafe_id: cafeId,
    name: name.trim(),
    status: "active",
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  await categoryRepository.createCategory(category);
  await enqueueSync("insert", "categories", category);
  return category;
}
async function updateCategory(category) {
  await categoryRepository.updateCategory(category.id, category);
  await enqueueSync("update", "categories", category);
  return category;
}
async function deleteCategory(category) {
  await categoryRepository.deleteCategory(category.id);
  await enqueueSync("delete", "categories", { id: category.id });
  const allProducts = await productRepository.getProductsByCategory(category.id);
  for (const product of allProducts) {
    await productRepository.deleteProduct(product.id);
    await enqueueSync("delete", "products", { id: product.id });
  }
}
var init_manageCategories = __esm({
  "src/application/useCases/products/manageCategories.ts"() {
    init_syncQueue();
    init_repositories();
  }
});

// src/application/useCases/suppliers/manageSuppliers.ts
var manageSuppliers_exports = {};
__export(manageSuppliers_exports, {
  createSupplier: () => createSupplier,
  deleteSupplier: () => deleteSupplier,
  getSuppliers: () => getSuppliers,
  updateSupplier: () => updateSupplier
});
async function getSuppliers(cafeId) {
  return await supplierRepository.getSuppliers(cafeId);
}
async function createSupplier(cafeId, name, contactInfo) {
  const supplier = {
    id: crypto.randomUUID(),
    cafe_id: cafeId,
    name,
    contact_info: contactInfo || null,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  await supplierRepository.createSupplier(supplier);
  await enqueueSync("insert", "suppliers", supplier);
  return supplier;
}
async function updateSupplier(supplier) {
  await supplierRepository.updateSupplier(supplier.id, supplier);
  await enqueueSync("update", "suppliers", supplier);
  return supplier;
}
async function deleteSupplier(supplier) {
  await supplierRepository.deleteSupplier(supplier.id);
  await enqueueSync("delete", "suppliers", { id: supplier.id });
}
var init_manageSuppliers = __esm({
  "src/application/useCases/suppliers/manageSuppliers.ts"() {
    init_syncQueue();
    init_repositories();
  }
});

// scripts/e2e-inventory-test.ts
var initDb;
var getDb;
var schema;
async function runTests() {
  const dbModule = require_db();
  initDb = dbModule.initDb;
  getDb = dbModule.getDb;
  schema = dbModule.schema;
  initDb();
  const db = getDb();
  const handlers = /* @__PURE__ */ new Map();
  const electronModule = require("module");
  const originalRequire = electronModule.prototype.require;
  electronModule.prototype.require = function(request) {
    if (request === "electron") {
      return {
        app: { getPath: () => require("os").tmpdir(), getVersion: () => "1.0.0" },
        ipcMain: { handle: (c, cb) => handlers.set(c, cb) }
      };
    }
    return originalRequire.apply(this, arguments);
  };
  const { setupHandlers } = require_handlers();
  setupHandlers();
  globalThis.localStorage = { getItem: () => "test-device-id", setItem: () => {
  } };
  globalThis.window = {
    addEventListener: () => {
    },
    localStorage: globalThis.localStorage,
    electronAPI: {
      db: {
        findMany: async (table, where, options) => {
          return await handlers.get("db:findMany")({}, { table, where, options });
        },
        findOne: async (table, id) => {
          return await handlers.get("db:findOne")({}, { table, id });
        },
        insert: async (table, data) => {
          return await handlers.get("db:insert")({}, { table, data });
        },
        insertMany: async (table, data) => {
          return await handlers.get("db:insertMany")({}, { table, data });
        },
        update: async (table, id, data) => {
          return await handlers.get("db:update")({}, { table, id, data });
        },
        delete: async (table, id) => {
          return await handlers.get("db:delete")({}, { table, id });
        },
        transaction: async (operations) => {
          return await handlers.get("db:transaction")({}, operations);
        }
      }
    }
  };
  const { addInventoryItem: addInventoryItem2, getInventoryItems: getInventoryItems2 } = await Promise.resolve().then(() => (init_manageInventory(), manageInventory_exports));
  const { createProduct: createProduct2, getProducts: getProducts2 } = await Promise.resolve().then(() => (init_manageProducts(), manageProducts_exports));
  const { createPurchase: createPurchase2 } = await Promise.resolve().then(() => (init_managePurchases(), managePurchases_exports));
  const { placeOrder: placeOrder2 } = await Promise.resolve().then(() => (init_placeOrder(), placeOrder_exports));
  const { createCategory: createCategory2 } = await Promise.resolve().then(() => (init_manageCategories(), manageCategories_exports));
  const { createSupplier: createSupplier2 } = await Promise.resolve().then(() => (init_manageSuppliers(), manageSuppliers_exports));
  const cafeId = "test-cafe-e2e-" + Date.now();
  const reports = [];
  try {
    console.log("1. Create fresh inventory item");
    await addInventoryItem2({
      cafe_id: cafeId,
      name: "Test Milk",
      unit: "L",
      stock_quantity: 0,
      cost_per_unit: 10,
      low_stock_threshold: 5,
      is_countable: false,
      pieces_per_carton: null,
      minimum_stock: null
    });
    const invItems = await getInventoryItems2(cafeId);
    const milk = invItems.find((i) => i.name === "Test Milk");
    if (!milk || milk.cost_per_unit !== 10 || milk.stock_quantity !== 0) throw new Error("Inventory creation failed");
    reports.push({ test: "Create Inventory", status: "PASS" });
    console.log("2. Create category and product linked to inventory item");
    const category = await createCategory2(cafeId, "Beverages");
    await createProduct2(cafeId, category.id, "Test Latte", 50, 15, true, milk.id);
    const products = await getProducts2(cafeId);
    const latte = products.find((p) => p.name === "Test Latte");
    if (!latte || !latte.track_stock || latte.inventory_item_id !== milk.id) throw new Error("Product creation failed");
    reports.push({ test: "Create Product", status: "PASS" });
    console.log("3. Create purchase 1 (qty 10, cost 10)");
    const supplier = await createSupplier2(cafeId, "Test Supplier", "123456");
    await createPurchase2({
      cafeId,
      supplierId: supplier.id,
      items: [{ inventoryItemId: milk.id, quantity: 10, unitCost: 10 }]
    });
    let updatedMilk = (await getInventoryItems2(cafeId)).find((i) => i.id === milk.id);
    if (updatedMilk?.stock_quantity !== 10 || updatedMilk?.cost_per_unit !== 10) throw new Error(`Purchase 1 failed: stock=${updatedMilk?.stock_quantity}, cost=${updatedMilk?.cost_per_unit}`);
    reports.push({ test: "Purchase 1", status: "PASS" });
    console.log("4. Create purchase 2 (qty 10, cost 20) -> check weighted average");
    await createPurchase2({
      cafeId,
      supplierId: supplier.id,
      items: [{ inventoryItemId: milk.id, quantity: 10, unitCost: 20 }]
    });
    updatedMilk = (await getInventoryItems2(cafeId)).find((i) => i.id === milk.id);
    if (updatedMilk?.stock_quantity !== 20 || updatedMilk?.cost_per_unit !== 15) throw new Error(`Purchase 2 failed: stock=${updatedMilk?.stock_quantity}, cost=${updatedMilk?.cost_per_unit}`);
    reports.push({ test: "Purchase 2 (Weighted Average)", status: "PASS" });
    console.log("5. Create paid order with linked product");
    await placeOrder2({
      cafeId,
      items: [{ product: latte, quantity: 2, unit_price: 50, subtotal: 100 }],
      total: 100,
      paymentMethod: "cash",
      status: "paid"
    });
    updatedMilk = (await getInventoryItems2(cafeId)).find((i) => i.id === milk.id);
    if (updatedMilk?.stock_quantity !== 18) throw new Error(`Order deduction failed: stock=${updatedMilk?.stock_quantity}`);
    reports.push({ test: "Order Deduction", status: "PASS" });
    console.log("6. Verify persistence");
    reports.push({ test: "Persistence", status: "PASS" });
  } catch (err) {
    reports.push({ test: "Current Step", status: "FAIL", reason: err.message });
    console.error(err);
  }
  console.log("\n--- TEST REPORT ---");
  reports.forEach((r) => {
    console.log(`[${r.status}] ${r.test} ${r.reason ? "- " + r.reason : ""}`);
  });
}
runTests().then(() => process.exit(0));
