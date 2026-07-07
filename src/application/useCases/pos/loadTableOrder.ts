import { db } from '../../../infrastructure/database/db';
import { useCartStore } from '../../store/useCartStore';

export async function loadTableOrder(orderId: string): Promise<void> {
  const order = await db.orders.get(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  const orderItems = await db.order_items.where('order_id').equals(orderId).toArray();

  const cartItems = [];
  for (const item of orderItems) {
    const product = await db.products.get(item.product_id);
    if (product) {
      cartItems.push({
        product,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
        note: '', // order items don't currently store notes, but we could add it
      });
    }
  }

  useCartStore.getState().setItems(cartItems);
  useCartStore.getState().setTableId(order.table_id || null);
  useCartStore.getState().setActiveOrderId(order.id);
}
