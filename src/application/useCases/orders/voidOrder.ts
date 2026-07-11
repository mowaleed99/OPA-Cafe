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

  // 4. Mark the order as voided
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
  await db.transaction('rw', db.orders, db.order_audit_log, db.sync_queue, async () => {
    await db.orders.put(updatedOrder);
    await db.order_audit_log.add(auditEntry);
    await enqueueSync('update', 'orders', updatedOrder as unknown as Record<string, unknown>);
    await enqueueSync('insert', 'order_audit_log', auditEntry as unknown as Record<string, unknown>);
  });

  return { success: true };
}
