import { buildSyncOperation, enqueueSync } from '../../sync/syncQueue';
import { inventoryRepository } from '../../../infrastructure/repositories/index';
import type { StockMovement, StockMovementType } from '../../../domain/entities/stock_movement';
import type { InventoryItem } from '../../../domain/entities/inventory';
import { useAuthStore } from '../../store/useAuthStore';
import { executeTransaction, TransactionOperation } from '../../../infrastructure/database/transaction';

export async function getStockMovements(cafeId: string, itemId: string): Promise<StockMovement[]> {
  return await inventoryRepository.getStockMovements(cafeId, itemId);
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

  const ops: TransactionOperation[] = [
    { type: 'insert', table: 'stock_movements', data: movement },
    buildSyncOperation('insert', 'stock_movements', movement as unknown as Record<string, unknown>)
  ];

  await executeTransaction(ops);
}

export async function adjustStock(
  cafeId: string,
  itemId: string,
  type: StockMovementType,
  quantity: number,
  reason?: string
): Promise<void> {
  const item = await inventoryRepository.findOne(itemId);
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
    const delta = quantity - item.stock_quantity;
    item.stock_quantity = quantity; 
    quantity = delta; // Save the delta in movement log
  }

  const ops: TransactionOperation[] = [
    { type: 'update', table: 'inventory_items', id: item.id, data: item },
    buildSyncOperation('update', 'inventory_items', item as unknown as Record<string, unknown>)
  ];

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
    
    ops.push({ type: 'insert', table: 'stock_movements', data: movement });
    ops.push(buildSyncOperation('insert', 'stock_movements', movement as unknown as Record<string, unknown>));
  }

  await executeTransaction(ops);
  
  // Trigger background sync processing if online
  if (navigator.onLine && window.electronAPI) {
    window.electronAPI.triggerSync();
  }
}
