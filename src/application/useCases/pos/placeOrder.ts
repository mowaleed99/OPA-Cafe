import { db } from '../../../infrastructure/database/db';
import { enqueueSync } from '../../sync/syncQueue';
import type { CartItem } from '../../store/useCartStore';
import type { Order, OrderItem, PaymentMethod, OrderStatus, OrderType } from '../../../core/entities/order';

export interface PlaceOrderParams {
  cafeId: string;
  items: CartItem[];
  paymentMethod?: PaymentMethod | null;
  total: number;
  tableId?: string | null;
  status?: OrderStatus;
  orderType?: OrderType;
}

export interface PlaceOrderResult {
  orderId: string;
}

/**
 * Creates an Order + OrderItems in Dexie (offline-first), then enqueues
 * a sync to Supabase.
 */
export async function placeOrder(params: PlaceOrderParams): Promise<PlaceOrderResult> {
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

  // 1. Write to local Dexie first (works fully offline)
  await db.transaction('rw', db.orders, db.order_items, db.dining_tables, db.sync_queue, async () => {
    await db.orders.add(order);
    await db.order_items.bulkAdd(orderItems);

    // If there's a table and it's an open order, mark it as occupied
    if (params.tableId && status === 'open') {
      await db.dining_tables.update(params.tableId, { status: 'occupied', current_order_id: orderId });
      await enqueueSync('update', 'dining_tables', { id: params.tableId, status: 'occupied', current_order_id: orderId });
    }
    
    // 2. Enqueue sync to Supabase (runs immediately if online, queued if offline)
    await enqueueSync('insert', 'orders', order as unknown as Record<string, unknown>);
    for (const item of orderItems) {
      await enqueueSync('insert', 'order_items', item as unknown as Record<string, unknown>);
    }
  });

  return { orderId };
}
