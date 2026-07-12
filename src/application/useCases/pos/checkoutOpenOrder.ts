import { db } from '../../../infrastructure/database/db';
import { enqueueSync } from '../../sync/syncQueue';
import type { PaymentMethod } from '../../../core/entities/order';

export async function checkoutOpenOrder(orderId: string, paymentMethod: PaymentMethod): Promise<void> {
  await db.transaction('rw', [db.orders, db.dining_tables, db.order_items, db.products, db.inventory_items, db.stock_movements, db.sync_queue], async () => {
    const order = await db.orders.get(orderId);
    if (!order) throw new Error('Order not found');

    // Map invalid payment methods to 'other' for Supabase CHECK constraint
    let supabasePaymentMethod = paymentMethod;
    if (supabasePaymentMethod && !['cash', 'card', 'other'].includes(supabasePaymentMethod)) {
      supabasePaymentMethod = 'other' as PaymentMethod;
    }

    // Update order status to paid
    await db.orders.update(orderId, { status: 'paid', payment_method: supabasePaymentMethod });
    await enqueueSync('update', 'orders', { id: orderId, cafe_id: order.cafe_id, status: 'paid', payment_method: supabasePaymentMethod });

    // Update table status to available
    if (order.table_id) {
      await db.dining_tables.update(order.table_id, { status: 'available', current_order_id: null });
      await enqueueSync('update', 'dining_tables', { id: order.table_id, cafe_id: order.cafe_id, status: 'available', current_order_id: null });
    }

    // Deduct stock
    const orderItems = await db.order_items.where('order_id').equals(orderId).toArray();
    const now = new Date().toISOString();
    
    for (const item of orderItems) {
      const product = await db.products.get(item.product_id);
      if (!product || !product.track_stock || !product.inventory_item_id) continue;

      const inventoryItem = await db.inventory_items.get(product.inventory_item_id);
      if (!inventoryItem) continue;

      const newQuantity = inventoryItem.stock_quantity - item.quantity;
      await db.inventory_items.update(inventoryItem.id, { stock_quantity: newQuantity });
      await enqueueSync('update', 'inventory_items', { id: inventoryItem.id, cafe_id: order.cafe_id, stock_quantity: newQuantity });

      const movementId = crypto.randomUUID();
      const movement = {
        id: movementId,
        cafe_id: order.cafe_id,
        inventory_item_id: inventoryItem.id,
        type: 'out' as const,
        quantity: item.quantity,
        reference_type: 'sale',
        reference_id: orderId,
        notes: `Sale - Order ${orderId.split('-')[0]}`,
        created_at: now
      };
      await db.stock_movements.add(movement);
      await enqueueSync('insert', 'stock_movements', movement as unknown as Record<string, unknown>);
    }
  });
}
