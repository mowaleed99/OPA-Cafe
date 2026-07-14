import { buildSyncOperation } from '../../sync/syncQueue';
import { orderRepository, productRepository, inventoryRepository } from '../../../infrastructure/repositories/index';
import { executeTransaction, TransactionOperation } from '../../../infrastructure/database/transaction';
import type { PaymentMethod } from '../../../domain/entities/order';
import type { StockMovement } from '../../../domain/entities/stock_movement';
import type { OrderAuditLog } from '../../../domain/entities/order_audit_log';

export async function checkoutOpenOrder(orderId: string, paymentMethod: PaymentMethod, userId?: string, userName?: string): Promise<void> {
  const order = await orderRepository.getOrderById(orderId);
  if (!order) throw new Error('Order not found');

  const orderItems = await orderRepository.getOrderItems(orderId);
  if (orderItems.length === 0) {
    throw new Error('Cannot checkout an empty order');
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  if (order.total_amount < 0) {
    throw new Error('Discount cannot exceed subtotal');
  }
  if (order.total_amount > subtotal) {
    throw new Error('Total cannot exceed subtotal (invalid discount)');
  }

  // Map invalid payment methods to 'other' for Supabase CHECK constraint
  let supabasePaymentMethod = paymentMethod;
  if (supabasePaymentMethod && !['cash', 'card', 'other'].includes(supabasePaymentMethod)) {
    supabasePaymentMethod = 'other' as PaymentMethod;
  }

  const ops: TransactionOperation[] = [];

  // Update order status to paid
  const orderUpdate = { status: 'paid' as const, payment_method: supabasePaymentMethod };
  ops.push({ type: 'update', table: 'orders', id: orderId, data: orderUpdate });
  ops.push(buildSyncOperation('update', 'orders', { id: orderId, cafe_id: order.cafe_id, ...orderUpdate }));

  // Update table status to available
  if (order.table_id) {
    const tableUpdate = { status: 'available' as const, current_order_id: null };
    ops.push({ type: 'update', table: 'tables', id: order.table_id, data: tableUpdate });
    ops.push(buildSyncOperation('update', 'tables', { id: order.table_id, cafe_id: order.cafe_id, ...tableUpdate }));
  }

  // Discount Audit Log
  const discountAmount = subtotal - order.total_amount;
  if (discountAmount > 0) {
    const auditEntry: OrderAuditLog = {
      id: crypto.randomUUID(),
      cafe_id: order.cafe_id,
      order_id: orderId,
      action_type: 'discount' as any,
      initiated_by_user_id: userId || 'unknown',
      initiated_by_name: userName || 'Unknown Cashier',
      approved_by_owner_pin: false,
      reason: `Discount applied during checkout: ${discountAmount}`,
      order_total: order.total_amount,
      created_at: new Date().toISOString(),
    };
    ops.push({ type: 'insert', table: 'order_audit_log', data: auditEntry });
    ops.push(buildSyncOperation('insert', 'order_audit_log', auditEntry as unknown as Record<string, unknown>));
  }

  // Deduct stock
  const now = new Date().toISOString();
  
  for (const item of orderItems) {
    const product = await productRepository.getProductById(item.product_id);
    if (!product || !product.track_stock || !product.inventory_item_id) continue;

    const inventoryItem = await inventoryRepository.findOne(product.inventory_item_id);
    if (!inventoryItem) continue;

    const newQuantity = inventoryItem.stock_quantity - item.quantity;
    const updatedItem = { ...inventoryItem, stock_quantity: newQuantity };
    
    ops.push({ type: 'update', table: 'inventory_items', id: inventoryItem.id, data: updatedItem });
    ops.push(buildSyncOperation('update', 'inventory_items', updatedItem as unknown as Record<string, unknown>));

    const movementId = crypto.randomUUID();
    const movement: StockMovement = {
      id: movementId,
      cafe_id: order.cafe_id,
      inventory_item_id: inventoryItem.id,
      type: 'out',
      quantity: item.quantity,
      reason: `Sale - Order ${orderId.split('-')[0]}`,
      created_at: now
    };
    
    ops.push({ type: 'insert', table: 'stock_movements', data: movement });
    ops.push(buildSyncOperation('insert', 'stock_movements', movement as unknown as Record<string, unknown>));
  }

  await executeTransaction(ops);

  if (navigator.onLine && window.electronAPI) {
    window.electronAPI.triggerSync();
  }
}
