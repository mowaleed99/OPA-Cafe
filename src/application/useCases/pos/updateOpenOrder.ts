import { db } from '../../../infrastructure/database/db';
import { enqueueSync } from '../../sync/syncQueue';
import type { CartItem } from '../../store/useCartStore';
import type { OrderItem } from '../../../core/entities/order';

export async function updateOpenOrder(orderId: string, items: CartItem[], total: number): Promise<void> {
  const orderItems: OrderItem[] = items.map((item) => ({
    id: crypto.randomUUID(),
    order_id: orderId,
    product_id: item.product.id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: item.subtotal,
  }));

  const order = await db.orders.get(orderId);
  
  await db.transaction('rw', db.orders, db.order_items, db.sync_queue, async () => {
    // Update order total
    await db.orders.update(orderId, { total_amount: total });
    await enqueueSync('update', 'orders', { id: orderId, cafe_id: order?.cafe_id, total_amount: total });

    // Delete existing items
    const existingItems = await db.order_items.where('order_id').equals(orderId).toArray();
    const existingIds = existingItems.map(i => i.id);
    await db.order_items.bulkDelete(existingIds);
    for (const id of existingIds) {
      await enqueueSync('delete', 'order_items', { id });
    }

    // Insert new items
    await db.order_items.bulkAdd(orderItems);
    for (const item of orderItems) {
      await enqueueSync('insert', 'order_items', item as unknown as Record<string, unknown>);
    }
  });
}
