import { db } from '../../infrastructure/database/db';
import { supabase } from '../../infrastructure/api/supabase';

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/**
 * Performs a FULL sync from Supabase into the local Dexie DB using bulkPut.
 * Safe to run on every login — existing records are upserted, new ones inserted.
 * This ensures the local device always reflects the latest server state.
 */
export async function pullInitialData(cafeId: string): Promise<void> {
  if (!navigator.onLine) {
    console.log('[Sync] Offline — skipping pull from Supabase.');
    return;
  }

  console.log('[Sync] Pulling latest data from Supabase...');

  try {
    // 1. Fetch all parent tables in parallel
    const [
      { data: categories },
      { data: products, error: prodErr },
      { data: inventoryItems, error: invErr },
      { data: stockMovements },
      { data: tables },
      { data: orders },
      { data: suppliers },
      { data: purchases },
      { data: dailyClosings },
      { data: settings },
      { data: appUsers },
      { data: expenses },
      { data: auditLog }
    ] = await Promise.all([
      supabase.from('categories').select('*').eq('cafe_id', cafeId),
      supabase.from('products').select('*').eq('cafe_id', cafeId),
      supabase.from('inventory_items').select('*').eq('cafe_id', cafeId),
      supabase.from('stock_movements').select('*').eq('cafe_id', cafeId),
      supabase.from('tables').select('*').eq('cafe_id', cafeId),
      supabase.from('orders').select('*').eq('cafe_id', cafeId),
      supabase.from('suppliers').select('*').eq('cafe_id', cafeId),
      supabase.from('purchases').select('*').eq('cafe_id', cafeId),
      supabase.from('daily_closings').select('*').eq('cafe_id', cafeId),
      supabase.from('settings').select('*').eq('cafe_id', cafeId),
      supabase.from('app_users').select('*').eq('cafe_id', cafeId),
      supabase.from('expenses').select('*').eq('cafe_id', cafeId),
      supabase.from('order_audit_log').select('*').eq('cafe_id', cafeId),
    ]);

    if (prodErr) alert('Sync Error (Products): ' + prodErr.message);
    if (invErr) alert('Sync Error (Inventory): ' + invErr.message);

    // 2. Deduplicate by name before upserting (prevents server-side duplicates from
    //    polluting local Dexie — keep the first occurrence for each unique name).
    if (categories && categories.length > 0) {
      const seenCatNames = new Set<string>();
      const uniqueCategories = (categories as any[]).filter(c => {
        const key = c.name.trim().toLowerCase();
        if (seenCatNames.has(key)) return false;
        seenCatNames.add(key);
        return true;
      });
      // Wipe local categories for this cafe first, then put clean server data
      // This prevents old duplicates from surviving across syncs
      await db.categories.where('cafe_id').equals(cafeId).delete();
      await db.categories.bulkPut(uniqueCategories);
    }
    if (products && products.length > 0) {
      // Build a category id → name map from already-filtered categories
      const catIdToName = new Map<string, string>();
      if (categories) {
        for (const c of categories as any[]) catIdToName.set(c.id, c.name);
      }
      const seenProdKeys = new Set<string>();
      const uniqueProducts = (products as any[]).filter(p => {
        const catName = catIdToName.get(p.category_id) ?? p.category_id;
        const key = `${catName}::${p.name}`;
        if (seenProdKeys.has(key)) return false;
        seenProdKeys.add(key);
        return true;
      });
      await db.products.bulkPut(uniqueProducts);
    }
    if (inventoryItems && inventoryItems.length > 0) await db.inventory_items.bulkPut(inventoryItems as any[]);
    if (stockMovements && stockMovements.length > 0) await db.stock_movements.bulkPut(stockMovements as any[]);
    if (tables && tables.length > 0) await db.dining_tables.bulkPut(tables as any[]);
    if (orders && orders.length > 0) await db.orders.bulkPut(orders as any[]);
    if (suppliers && suppliers.length > 0) await db.suppliers.bulkPut(suppliers as any[]);
    if (purchases && purchases.length > 0) await db.purchases.bulkPut(purchases as any[]);
    if (dailyClosings && dailyClosings.length > 0) await db.daily_closings.bulkPut(dailyClosings as any[]);
    if (settings && settings.length > 0) await db.settings.bulkPut(settings as any[]);
    if (appUsers && appUsers.length > 0) await db.app_users.bulkPut(appUsers as any[]);
    if (expenses && expenses.length > 0) await db.expenses.bulkPut(expenses as any[]);
    if (auditLog && auditLog.length > 0) await db.order_audit_log.bulkPut(auditLog as any[]);

    // 3. Fetch child tables in chunks to avoid HTTP 414 URI Too Long
    // Order Items
    if (orders && orders.length > 0) {
      const orderIds = orders.map(o => o.id);
      for (const chunk of chunkArray(orderIds, 100)) {
        const { data: orderItems } = await supabase.from('order_items').select('*').in('order_id', chunk);
        if (orderItems && orderItems.length > 0) await db.order_items.bulkPut(orderItems as any[]);
      }
    }

    // Purchase Items & Supplier Payments
    if (purchases && purchases.length > 0) {
      const purchaseIds = purchases.map(p => p.id);
      for (const chunk of chunkArray(purchaseIds, 100)) {
        const [{ data: purchaseItems }, { data: supplierPayments }] = await Promise.all([
          supabase.from('purchase_items').select('*').in('purchase_id', chunk),
          supabase.from('supplier_payments').select('*').in('purchase_id', chunk),
        ]);
        if (purchaseItems && purchaseItems.length > 0) await db.purchase_items.bulkPut(purchaseItems as any[]);
        if (supplierPayments && supplierPayments.length > 0) await db.supplier_payments.bulkPut(supplierPayments as any[]);
      }
    }

    // Daily Closing Items
    if (dailyClosings && dailyClosings.length > 0) {
      const closingIds = dailyClosings.map(c => c.id);
      for (const chunk of chunkArray(closingIds, 100)) {
        const { data: closingItems } = await supabase.from('daily_closing_items').select('*').in('daily_closing_id', chunk);
        if (closingItems && closingItems.length > 0) await db.daily_closing_items.bulkPut(closingItems as any[]);
      }
    }

    console.log('[Sync] Pull from Supabase complete!');

  } catch (err) {
    console.error('[Sync] Failed to pull data from Supabase:', err);
  }
}
