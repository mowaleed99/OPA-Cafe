const { ipcMain } = require('electron');
const { getDb } = require('./db.cjs');
const schema = require('./schema.cjs');
const { eq, isNull, and } = require('drizzle-orm');

function setupHandlers() {
  const db = getDb();

  // Helper to dynamically get table schema
  const getTable = (tableName) => {
    const tableMap = {
      'app_users': schema.appUsers,
      'categories': schema.categories,
      'products': schema.products,
      'inventory_items': schema.inventoryItems,
      'stock_movements': schema.stockMovements,
      'dining_tables': schema.diningTables,
      'orders': schema.orders,
      'order_items': schema.orderItems,
      'suppliers': schema.suppliers,
      'purchases': schema.purchases,
      'purchase_items': schema.purchaseItems,
      'supplier_payments': schema.supplierPayments,
      'expenses': schema.expenses,
      'daily_closings': schema.dailyClosings,
      'daily_closing_items': schema.dailyClosingItems,
      'settings': schema.settings,
      'order_audit_log': schema.orderAuditLog,
      'sync_queue': schema.syncQueue
    };
    return tableMap[tableName];
  };

  ipcMain.handle('db:findMany', async (event, { table, where }) => {
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
          if (t[key]) conditions.push(eq(t[key], value));
        }
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      return await query.execute();
    } catch (e) {
      console.error(`db:findMany error (${table}):`, e);
      throw e;
    }
  });

  ipcMain.handle('db:findOne', async (event, { table, id }) => {
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

  ipcMain.handle('db:insert', async (event, { table, data }) => {
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

  ipcMain.handle('db:insertMany', async (event, { table, data }) => {
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

  ipcMain.handle('db:update', async (event, { table, id, data }) => {
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

  ipcMain.handle('db:delete', async (event, { table, id }) => {
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
  
  // Custom transaction endpoint since Drizzle transactions can't be easily serialized over IPC
  ipcMain.handle('db:transaction', async (event, operations) => {
    try {
      return await db.transaction(async (tx) => {
        for (const op of operations) {
          const t = getTable(op.table);
          if (!t) throw new Error(`Table ${op.table} not found`);
          
          if (op.type === 'insert') {
            await tx.insert(t).values(op.data).execute();
          } else if (op.type === 'update') {
            await tx.update(t).set(op.data).where(eq(t.id, op.id)).execute();
          } else if (op.type === 'delete') {
            await tx.delete(t).where(eq(t.id, op.id)).execute();
          } else if (op.type === 'insertMany') {
            if (op.data && op.data.length > 0) {
              await tx.insert(t).values(op.data).execute();
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

module.exports = { setupHandlers };
