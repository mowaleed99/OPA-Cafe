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
  await db.transaction('rw', [db.orders, db.order_items, db.dining_tables, db.products, db.inventory_items, db.stock_movements, db.sync_queue], async () => {
    await db.orders.add(order);
    await db.order_items.bulkAdd(orderItems);

    // If there's a table and it's an open order, mark it as occupied
    if (params.tableId && status === 'open') {
      await db.dining_tables.update(params.tableId, { status: 'occupied', current_order_id: orderId });
      await enqueueSync('update', 'dining_tables', { id: params.tableId, cafe_id: params.cafeId, status: 'occupied', current_order_id: orderId });
    }
    
    // 2. Enqueue sync to Supabase (runs immediately if online, queued if offline)
    await enqueueSync('insert', 'orders', order as unknown as Record<string, unknown>);
    for (const item of orderItems) {
      await enqueueSync('insert', 'order_items', item as unknown as Record<string, unknown>);
    }

    // 3. Deduct stock if order is paid immediately
    if (status === 'paid') {
      for (const item of orderItems) {
        const product = await db.products.get(item.product_id);
        if (!product || !product.track_stock || !product.inventory_item_id) continue;

        const inventoryItem = await db.inventory_items.get(product.inventory_item_id);
        if (!inventoryItem) continue;

        const newQuantity = inventoryItem.stock_quantity - item.quantity;
        await db.inventory_items.update(inventoryItem.id, { stock_quantity: newQuantity });
        await enqueueSync('update', 'inventory_items', { id: inventoryItem.id, cafe_id: params.cafeId, stock_quantity: newQuantity });

        const movementId = crypto.randomUUID();
        const movement = {
          id: movementId,
          cafe_id: params.cafeId,
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
    }
  });

  return { orderId };
}
