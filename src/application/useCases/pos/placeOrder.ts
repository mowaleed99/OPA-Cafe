import { buildSyncOperation, createSyncableOperation, triggerBackgroundSync } from '../../sync/syncQueue';
import { orderRepository, productRepository, inventoryRepository } from '../../../infrastructure/repositories/index';
import type { OrderAuditLog } from '../../../domain/entities/order_audit_log';
import { executeTransaction, TransactionOperation } from '../../../infrastructure/database/transaction';
import type { CartItem } from '../../store/useCartStore';
import type { Order, OrderItem, PaymentMethod, OrderStatus, OrderType } from '../../../domain/entities/order';
import type { StockMovement } from '../../../domain/entities/stock_movement';
import { OrderStockService } from '../../../domain/services/OrderStockService';
import { normalizePaymentMethod } from '../../../domain/entities/paymentMethod';

export interface PlaceOrderParams {
  cafeId: string;
  items: CartItem[];
  paymentMethod?: PaymentMethod | null;
  total: number;
  tableId?: string | null;
  status?: OrderStatus;
  orderType?: OrderType;
  userId?: string;
  userName?: string;
}

export interface PlaceOrderResult {
  orderId: string;
}

export async function placeOrder(params: PlaceOrderParams): Promise<PlaceOrderResult> {
  if (!params.items || params.items.length === 0) {
    throw new Error('Cannot place an empty order');
  }

  const subtotal = params.items.reduce((sum, item) => sum + item.subtotal, 0);
  if (params.total < 0) {
    throw new Error('Discount cannot exceed subtotal');
  }
  if (params.total > subtotal) {
    throw new Error('Total cannot exceed subtotal (invalid discount)');
  }

  const orderId = crypto.randomUUID();
  const now = new Date().toISOString();
  
  const status = params.status || 'paid';
  const orderType = params.orderType || (params.tableId ? 'dine_in' : 'takeaway');

  const normalizedPaymentMethod = normalizePaymentMethod(params.paymentMethod);

  const order: Order = {
    id: orderId,
    cafe_id: params.cafeId,
    table_id: params.tableId || null,
    order_type: orderType,
    status: status,
    payment_method: normalizedPaymentMethod,
    total_amount: params.total,
    created_at: now,
  };

  const orderItems: OrderItem[] = params.items.map((item) => ({
    id: crypto.randomUUID(),
    order_id: orderId,
    product_id: item.product.id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: item.subtotal,
  }));

  const ops: TransactionOperation[] = [];

  // Order
  ops.push(...createSyncableOperation('insert', 'orders', order as unknown as Record<string, unknown>));

  // Order Items
  if (orderItems.length > 0) {
    ops.push({ type: 'insertMany', table: 'order_items', data: orderItems });
    for (const item of orderItems) {
      ops.push(buildSyncOperation('insert', 'order_items', item as unknown as Record<string, unknown>));
    }
  }

  // Discount Audit Log
  const discountAmount = subtotal - params.total;
  if (discountAmount > 0) {
    const auditEntry = {
      id: crypto.randomUUID(),
      cafe_id: params.cafeId,
      order_id: orderId,
      action: 'discount',
      performed_by: params.userName || 'Unknown Cashier',
      timestamp: now,
      reason: `Discount applied: ${discountAmount}`,
      details: JSON.stringify({
         initiated_by_user_id: params.userId || 'unknown',
         approved_by_owner_pin: false,
         order_total: params.total
      }),
      created_at: now,
    };
    ops.push(...createSyncableOperation('insert', 'order_audit_log', auditEntry as unknown as Record<string, unknown>));
  }

  // Table
  if (params.tableId && status === 'open') {
    const tableUpdate = { status: 'occupied' as const, current_order_id: orderId };
    ops.push(...createSyncableOperation('update', 'tables', { id: params.tableId, cafe_id: params.cafeId, ...tableUpdate }, params.tableId));
  }

  // Inventory Stock Update & Stock Movements
  if (status === 'paid') {
    const stockOps = await OrderStockService.generateDeductionOperations(
      orderId,
      params.cafeId,
      orderItems,
      productRepository,
      inventoryRepository,
      now
    );
    ops.push(...stockOps);
  }

  await executeTransaction(ops);
  triggerBackgroundSync();

  return { orderId };
}
