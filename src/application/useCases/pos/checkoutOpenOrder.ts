import { db } from '../../../infrastructure/database/db';
import { enqueueSync } from '../../sync/syncQueue';
import type { PaymentMethod } from '../../../core/entities/order';

export async function checkoutOpenOrder(orderId: string, paymentMethod: PaymentMethod): Promise<void> {
  await db.transaction('rw', db.orders, db.dining_tables, db.sync_queue, async () => {
    const order = await db.orders.get(orderId);
    if (!order) throw new Error('Order not found');

    // Map invalid payment methods to 'other' for Supabase CHECK constraint
    let supabasePaymentMethod = paymentMethod;
    if (supabasePaymentMethod && !['cash', 'card', 'other'].includes(supabasePaymentMethod)) {
      supabasePaymentMethod = 'other' as PaymentMethod;
    }

    // Update order status to paid
    await db.orders.update(orderId, { status: 'paid', payment_method: supabasePaymentMethod });
    await enqueueSync('update', 'orders', { id: orderId, status: 'paid', payment_method: supabasePaymentMethod });

    // Update table status to available
    if (order.table_id) {
      await db.dining_tables.update(order.table_id, { status: 'available', current_order_id: null });
      await enqueueSync('update', 'dining_tables', { id: order.table_id, status: 'available', current_order_id: null });
    }
  });
}
