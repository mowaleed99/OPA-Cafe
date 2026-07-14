import { buildSyncOperation } from '../../sync/syncQueue';
import { orderRepository } from '../../../infrastructure/repositories/index';
import { executeTransaction, TransactionOperation } from '../../../infrastructure/database/transaction';
import type { CartItem } from '../../store/useCartStore';
import type { OrderItem } from '../../../domain/entities/order';

export async function updateOpenOrder(orderId: string, items: CartItem[], total: number): Promise<void> {
  if (!items || items.length === 0) {
    throw new Error('Cannot update order to be empty');
  }

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  if (total < 0) {
    throw new Error('Discount cannot exceed subtotal');
  }
  if (total > subtotal) {
    throw new Error('Total cannot exceed subtotal (invalid discount)');
  }
  const orderItems: OrderItem[] = items.map((item) => ({
    id: crypto.randomUUID(),
    order_id: orderId,
    product_id: item.product.id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: item.subtotal,
  }));

  const order = await orderRepository.getOrderById(orderId);
  if (!order) throw new Error('Order not found');
  
  const ops: TransactionOperation[] = [];

  // Update order total
  ops.push({ type: 'update', table: 'orders', id: orderId, data: { total_amount: total } });
  ops.push(buildSyncOperation('update', 'orders', { id: orderId, cafe_id: order.cafe_id, total_amount: total }));

  // Delete existing items
  const existingItems = await orderRepository.getOrderItems(orderId);
  for (const existingItem of existingItems) {
    ops.push({ type: 'delete', table: 'order_items', id: existingItem.id });
    ops.push(buildSyncOperation('delete', 'order_items', { id: existingItem.id }));
  }

  // Insert new items
  if (orderItems.length > 0) {
    ops.push({ type: 'insertMany', table: 'order_items', data: orderItems });
    for (const item of orderItems) {
      ops.push(buildSyncOperation('insert', 'order_items', item as unknown as Record<string, unknown>));
    }
  }

  await executeTransaction(ops);

  if (navigator.onLine && window.electronAPI) {
    window.electronAPI.triggerSync();
  }
}
