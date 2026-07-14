import bcrypt from 'bcryptjs';
import { buildSyncOperation } from '../../sync/syncQueue';
import { orderRepository, productRepository, inventoryRepository, settingsRepository } from '../../../infrastructure/repositories/index';
import { executeTransaction, TransactionOperation } from '../../../infrastructure/database/transaction';
import type { OrderAuditLog, AuditActionType } from '../../../domain/entities/order_audit_log';
import type { AppUser } from '../../../domain/entities/user';
import type { StockMovement } from '../../../domain/entities/stock_movement';

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
  const settings = await settingsRepository.getSettings(cafeId);

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
  const order = await orderRepository.getOrderById(orderId);
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

  const ops: TransactionOperation[] = [];

  // Order
  ops.push({ type: 'update', table: 'orders', id: orderId, data: updatedOrder });
  ops.push(buildSyncOperation('update', 'orders', updatedOrder as unknown as Record<string, unknown>));

  // Audit
  ops.push({ type: 'insert', table: 'order_audit_log', data: auditEntry });
  ops.push(buildSyncOperation('insert', 'order_audit_log', auditEntry as unknown as Record<string, unknown>));

  // 7. Restore stock if applicable
  if (shouldRestoreStock) {
    const orderItems = await orderRepository.getOrderItems(orderId);
    for (const item of orderItems) {
      const product = await productRepository.getProductById(item.product_id);
      if (!product || !product.track_stock || !product.inventory_item_id) continue;

      const inventoryItem = await inventoryRepository.findOne(product.inventory_item_id);
      if (!inventoryItem) continue;

      const newQuantity = inventoryItem.stock_quantity + item.quantity; // Restore
      const updatedItem = { ...inventoryItem, stock_quantity: newQuantity };
      
      ops.push({ type: 'update', table: 'inventory_items', id: inventoryItem.id, data: updatedItem });
      ops.push(buildSyncOperation('update', 'inventory_items', updatedItem as unknown as Record<string, unknown>));

      const movementId = crypto.randomUUID();
      const movement: StockMovement = {
        id: movementId,
        cafe_id: cafeId,
        inventory_item_id: inventoryItem.id,
        type: 'in' as const,
        quantity: item.quantity,
        reason: `Refund - Order ${orderId.split('-')[0]} voided/refunded`,
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

  return { success: true };
}
