import { db } from '../../../infrastructure/database/db';
import { enqueueSync } from '../../sync/syncQueue';
import type { StockMovement, StockMovementType } from '../../../core/entities/stock_movement';
import { useAuthStore } from '../../store/useAuthStore';

export async function getStockMovements(cafeId: string, itemId: string): Promise<StockMovement[]> {
  const movements = await db.stock_movements
    .where('cafe_id').equals(cafeId)
    .and(sm => sm.inventory_item_id === itemId)
    .reverse()
    .sortBy('created_at');
  return movements;
}

export async function recordStockMovement(
  cafeId: string,
  itemId: string,
  type: StockMovementType,
  quantity: number,
  reason?: string
): Promise<void> {
  const user = useAuthStore.getState().appUser;
  
  const movement: StockMovement = {
    id: crypto.randomUUID(),
    cafe_id: cafeId,
    inventory_item_id: itemId,
    type,
    quantity,
    reason: reason || null,
    created_by: user ? user.name || user.email : 'System',
    created_at: new Date().toISOString(),
  };

  await db.stock_movements.add(movement);
  await enqueueSync('insert', 'stock_movements', movement);
}

export async function adjustStock(
  cafeId: string,
  itemId: string,
  type: StockMovementType,
  quantity: number,
  reason?: string
): Promise<void> {
  await db.transaction('rw', db.inventory_items, db.stock_movements, db.sync_queue, async () => {
    const item = await db.inventory_items.get(itemId);
    if (!item) throw new Error('Item not found');

    if (type === 'out' && item.stock_quantity < quantity) {
      throw new Error('Insufficient stock');
    }

    // Update quantity
    if (type === 'in') {
      item.stock_quantity += quantity;
    } else if (type === 'out') {
      item.stock_quantity -= quantity;
    } else if (type === 'adjustment') {
      // For adjustment, quantity could be the exact new total or a delta. 
      // Let's assume quantity is a delta (can be positive or negative) for simplicity,
      // or we just define 'adjustment' as setting a new total.
      // Let's assume adjustment sets the EXACT new total quantity, so the delta is:
      const delta = quantity - item.stock_quantity;
      item.stock_quantity = quantity; 
      quantity = delta; // Save the delta in movement log
    }

    await db.inventory_items.put(item);
    await enqueueSync('update', 'inventory_items', item);

    // If there is a real movement (delta != 0)
    if (quantity !== 0) {
      const user = useAuthStore.getState().appUser;
      const movement: StockMovement = {
        id: crypto.randomUUID(),
        cafe_id: cafeId,
        inventory_item_id: itemId,
        type: type === 'adjustment' ? (quantity > 0 ? 'in' : 'out') : type,
        quantity: Math.abs(quantity),
        reason: reason || (type === 'adjustment' ? 'Manual Count' : undefined),
        created_by: user ? user.name || user.email : 'System',
        created_at: new Date().toISOString(),
      };
      
      await db.stock_movements.add(movement);
      await enqueueSync('insert', 'stock_movements', movement);
    }
  });
}
