import { buildSyncOperation } from '../../sync/syncQueue';
import { orderRepository, productRepository, inventoryRepository } from '../../../infrastructure/repositories/index';
import type { OrderAuditLog } from '../../../domain/entities/order_audit_log';
import { executeTransaction, TransactionOperation } from '../../../infrastructure/database/transaction';
import type { CartItem } from '../../store/useCartStore';
import type { Order, OrderItem, PaymentMethod, OrderStatus, OrderType } from '../../../domain/entities/order';
import type { StockMovement } from '../../../domain/entities/stock_movement';

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

  let supabasePaymentMethod = params.paymentMethod || null;
  if (supabasePaymentMethod && !['cash', 'card', 'other'].includes(supabasePaymentMethod)) {
    supabasePaymentMethod = 'other' as PaymentMethod;
  }

  const order: Order = {
    id: orderId,
    cafe_id: params.cafeId,
    table_id: params.tableId || null,
    order_type: orderType,
    status: status,
    payment_method: supabasePaymentMethod,
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
  ops.push({ type: 'insert', table: 'orders', data: order });
  ops.push(buildSyncOperation('insert', 'orders', order as unknown as Record<string, unknown>));

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
    const auditEntry: OrderAuditLog = {
      id: crypto.randomUUID(),
      cafe_id: params.cafeId,
      order_id: orderId,
      action_type: 'discount' as any, // SQLite allows any string
      initiated_by_user_id: params.userId || 'unknown',
      initiated_by_name: params.userName || 'Unknown Cashier',
      approved_by_owner_pin: false, // Discount might not require PIN based on current requirements
      reason: `Discount applied: ${discountAmount}`,
      order_total: params.total,
      created_at: now,
    };
    ops.push({ type: 'insert', table: 'order_audit_log', data: auditEntry });
    ops.push(buildSyncOperation('insert', 'order_audit_log', auditEntry as unknown as Record<string, unknown>));
  }

  // Table
  if (params.tableId && status === 'open') {
    const tableUpdate = { status: 'occupied' as const, current_order_id: orderId };
    ops.push({ type: 'update', table: 'tables', id: params.tableId, data: tableUpdate });
    ops.push(buildSyncOperation('update', 'tables', { id: params.tableId, cafe_id: params.cafeId, ...tableUpdate }));
  }

  // Inventory Stock Update & Stock Movements
  if (status === 'paid') {
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
        cafe_id: params.cafeId,
        inventory_item_id: inventoryItem.id,
        type: 'out',
        quantity: item.quantity,
        reason: `Sale - Order ${orderId.split('-')[0]}`,
        created_at: now
      };
      
      ops.push({ type: 'insert', table: 'stock_movements', data: movement });
      ops.push(buildSyncOperation('insert', 'stock_movements', movement as unknown as Record<string, unknown>));
    }
  }

  await executeTransaction(ops);

  if (navigator.onLine && window.electronAPI) {
    window.electronAPI.triggerSync();
  }

  return { orderId };
}
