import { buildSyncOperation, createSyncableOperation, triggerBackgroundSync } from '../../sync/syncQueue';
import { orderRepository, productRepository, inventoryRepository } from '../../../infrastructure/repositories/index';
import { executeTransaction, TransactionOperation } from '../../../infrastructure/database/transaction';
import type { PaymentMethod } from '../../../domain/entities/order';
import type { StockMovement } from '../../../domain/entities/stock_movement';
import type { OrderAuditLog } from '../../../domain/entities/order_audit_log';
import { OrderStockService } from '../../../domain/services/OrderStockService';
import { normalizePaymentMethodForSupabase } from '../../../domain/entities/paymentMethod';

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
  const supabasePaymentMethod = normalizePaymentMethodForSupabase(paymentMethod);

  const ops: TransactionOperation[] = [];

  // Update order status to paid
  const orderUpdate = { status: 'paid' as const, payment_method: supabasePaymentMethod };
  ops.push(...createSyncableOperation('update', 'orders', { id: orderId, cafe_id: order.cafe_id, ...orderUpdate }, orderId));

  // Update table status to available
  if (order.table_id) {
    const tableUpdate = { status: 'available' as const, current_order_id: null };
    ops.push(...createSyncableOperation('update', 'tables', { id: order.table_id, cafe_id: order.cafe_id, ...tableUpdate }, order.table_id));
  }

  // Discount Audit Log
  const now = new Date().toISOString();
  const discountAmount = subtotal - order.total_amount;
  if (discountAmount > 0) {
    const auditEntry = {
      id: crypto.randomUUID(),
      cafe_id: order.cafe_id,
      order_id: order.id,
      action: 'discount',
      performed_by: userName || 'Unknown Cashier',
      timestamp: now,
      reason: `Discount applied: ${discountAmount}`,
      details: JSON.stringify({
         initiated_by_user_id: userId || 'unknown',
         approved_by_owner_pin: false,
         order_total: order.total_amount
      }),
      created_at: now,
    };
    ops.push(...createSyncableOperation('insert', 'order_audit_log', auditEntry as unknown as Record<string, unknown>));
  }

  // Deduct stock
  const stockOps = await OrderStockService.generateDeductionOperations(
    orderId,
    order.cafe_id,
    orderItems,
    productRepository,
    inventoryRepository,
    now
  );
  ops.push(...stockOps);

  await executeTransaction(ops);
  triggerBackgroundSync();
}
