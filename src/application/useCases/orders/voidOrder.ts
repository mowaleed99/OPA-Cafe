import bcrypt from 'bcryptjs';
import { db } from '../../../infrastructure/database/db';
import { enqueueSync } from '../../sync/syncQueue';
import type { OrderAuditLog, AuditActionType } from '../../../core/entities/order_audit_log';
import type { AppUser } from '../../../core/entities/user';

interface VoidOrderParams {
  orderId: string;
  cafeId: string;
  initiatedByUser: AppUser;
  actionType: AuditActionType;
  reason: string;
  enteredPin: string;
}

interface VoidOrderResult {
  success: boolean;
  error?: string;
}

export async function voidOrder({
  orderId,
  cafeId,
  initiatedByUser,
  actionType,
  reason,
  enteredPin,
}: VoidOrderParams): Promise<VoidOrderResult> {
  // 1. Load settings to get the owner PIN hash
  const settings = await db.settings.where('cafe_id').equals(cafeId).first();

  if (!settings?.owner_pin_hash) {
    return {
      success: false,
      error: 'no_pin_set', // translated in UI
    };
  }

  // 2. Verify the entered PIN against the stored bcrypt hash
  const isPinValid = await bcrypt.compare(enteredPin, settings.owner_pin_hash);
  if (!isPinValid) {
    return {
      success: false,
      error: 'pin_incorrect',
    };
  }

  // 3. Load the order to snapshot its total
  const order = await db.orders.get(orderId);
  if (!order) {
    return {
      success: false,
      error: 'order_not_found',
    };
  }

  const now = new Date().toISOString();

  // 4. Check if we need to restore stock (only if the order was paid)
  const shouldRestoreStock = order.status === 'paid';

  // Mark the order as voided
  const updatedOrder = { ...order, status: 'voided' as const };

  // 5. Create audit log entry
  const auditEntry: OrderAuditLog = {
    id: crypto.randomUUID(),
    cafe_id: cafeId,
    order_id: orderId,
    action_type: actionType,
    initiated_by_user_id: initiatedByUser.id,
    initiated_by_name: initiatedByUser.name ?? initiatedByUser.email ?? initiatedByUser.id,
    approved_by_owner_pin: true,
    reason: reason || null,
    order_total: order.total_amount,
    created_at: now,
  };

  // 6. Persist both atomically in a Dexie transaction
  await db.transaction('rw', [db.orders, db.order_audit_log, db.order_items, db.products, db.inventory_items, db.stock_movements, db.sync_queue], async () => {
    await db.orders.put(updatedOrder);
    await db.order_audit_log.add(auditEntry);
    await enqueueSync('update', 'orders', updatedOrder as unknown as Record<string, unknown>);
    await enqueueSync('insert', 'order_audit_log', auditEntry as unknown as Record<string, unknown>);

    // 7. Restore stock if applicable
    if (shouldRestoreStock) {
      const orderItems = await db.order_items.where('order_id').equals(orderId).toArray();
      for (const item of orderItems) {
        const product = await db.products.get(item.product_id);
        if (!product || !product.track_stock || !product.inventory_item_id) continue;

        const inventoryItem = await db.inventory_items.get(product.inventory_item_id);
        if (!inventoryItem) continue;

        const newQuantity = inventoryItem.stock_quantity + item.quantity; // Restore
        await db.inventory_items.update(inventoryItem.id, { stock_quantity: newQuantity });
        await enqueueSync('update', 'inventory_items', { id: inventoryItem.id, cafe_id: cafeId, stock_quantity: newQuantity });

        const movementId = crypto.randomUUID();
        const movement = {
          id: movementId,
          cafe_id: cafeId,
          inventory_item_id: inventoryItem.id,
          type: 'in' as const,
          quantity: item.quantity,
          reference_type: 'refund',
          reference_id: orderId,
          notes: `Refund - Order ${orderId.split('-')[0]} voided/refunded`,
          created_at: now
        };
        await db.stock_movements.add(movement);
        await enqueueSync('insert', 'stock_movements', movement as unknown as Record<string, unknown>);
      }
    }
  });

  return { success: true };
}
