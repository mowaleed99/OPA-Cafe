import { db } from '../../infrastructure/database/db';
import { supabase } from '../../infrastructure/api/supabase';

/**
 * Performs a one-time sync to pull all existing data from Supabase
 * into the local Dexie DB, if the Dexie DB is currently empty.
 * This acts as a safety net for new installations or cleared local storage.
 */
export async function pullInitialData(cafeId: string): Promise<void> {
  // Check if we already have categories. If so, assume DB is populated.
  const existingCategoriesCount = await db.categories.where('cafe_id').equals(cafeId).count();
  if (existingCategoriesCount > 0) {
    console.log('[InitialSync] Local DB already populated, skipping initial pull.');
    return;
  }

  console.log('[InitialSync] Local DB is empty. Pulling data from Supabase...');
  
  try {
    // 1. Fetch parent tables
    const [
      { data: categories },
      { data: products },
      { data: inventoryItems },
      { data: tables },
      { data: orders },
      { data: suppliers },
      { data: purchases },
      { data: dailyClosings },
      { data: settings }
    ] = await Promise.all([
      supabase.from('categories').select('*').eq('cafe_id', cafeId),
      supabase.from('products').select('*').eq('cafe_id', cafeId),
      supabase.from('inventory_items').select('*').eq('cafe_id', cafeId),
      supabase.from('tables').select('*').eq('cafe_id', cafeId),
      supabase.from('orders').select('*').eq('cafe_id', cafeId),
      supabase.from('suppliers').select('*').eq('cafe_id', cafeId),
      supabase.from('purchases').select('*').eq('cafe_id', cafeId),
      supabase.from('daily_closings').select('*').eq('cafe_id', cafeId),
      supabase.from('settings').select('*').eq('cafe_id', cafeId)
    ]);

    // Save parent tables
    if (categories && categories.length > 0) await db.categories.bulkPut(categories as any[]);
    if (products && products.length > 0) await db.products.bulkPut(products as any[]);
    if (inventoryItems && inventoryItems.length > 0) await db.inventory_items.bulkPut(inventoryItems as any[]);
    if (tables && tables.length > 0) await db.dining_tables.bulkPut(tables as any[]);
    if (orders && orders.length > 0) await db.orders.bulkPut(orders as any[]);
    if (suppliers && suppliers.length > 0) await db.suppliers.bulkPut(suppliers as any[]);
    if (purchases && purchases.length > 0) await db.purchases.bulkPut(purchases as any[]);
    if (dailyClosings && dailyClosings.length > 0) await db.daily_closings.bulkPut(dailyClosings as any[]);
    if (settings && settings.length > 0) await db.settings.bulkPut(settings as any[]);

    // 2. Fetch child tables
    // To be safe and since we don't know if the child tables have cafe_id, 
    // we use the parent IDs to fetch children.
    
    // Order Items
    if (orders && orders.length > 0) {
      const orderIds = orders.map(o => o.id);
      const { data: orderItems } = await supabase.from('order_items').select('*').in('order_id', orderIds);
      if (orderItems && orderItems.length > 0) await db.order_items.bulkPut(orderItems as any[]);
    }

    // Purchase Items & Supplier Payments
    if (purchases && purchases.length > 0) {
      const purchaseIds = purchases.map(p => p.id);
      const [
        { data: purchaseItems },
        { data: supplierPayments }
      ] = await Promise.all([
        supabase.from('purchase_items').select('*').in('purchase_id', purchaseIds),
        supabase.from('supplier_payments').select('*').in('purchase_id', purchaseIds)
      ]);
      if (purchaseItems && purchaseItems.length > 0) await db.purchase_items.bulkPut(purchaseItems as any[]);
      if (supplierPayments && supplierPayments.length > 0) await db.supplier_payments.bulkPut(supplierPayments as any[]);
    }

    // Daily Closing Items
    if (dailyClosings && dailyClosings.length > 0) {
      const closingIds = dailyClosings.map(c => c.id);
      const { data: closingItems } = await supabase.from('daily_closing_items').select('*').in('daily_closing_id', closingIds);
      if (closingItems && closingItems.length > 0) await db.daily_closing_items.bulkPut(closingItems as any[]);
    }

    console.log('[InitialSync] Initial pull complete!');

  } catch (err) {
    console.error('[InitialSync] Failed to pull initial data from Supabase:', err);
  }
}
