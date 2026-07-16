import { createSyncableOperation } from '../../application/sync/syncQueue';
import type { TransactionOperation } from '../../infrastructure/database/transaction';
import type { StockMovement } from '../entities/stock_movement';
import type { IProductRepository } from '../repositories/IProductRepository';
import type { IInventoryRepository } from '../repositories/IInventoryRepository';

export interface StockDeductibleItem {
  product_id: string;
  quantity: number;
}

export class OrderStockService {
  static async generateDeductionOperations(
    orderId: string,
    cafeId: string,
    items: StockDeductibleItem[],
    productRepo: IProductRepository,
    inventoryRepo: IInventoryRepository,
    timestamp: string
  ): Promise<TransactionOperation[]> {
    const ops: TransactionOperation[] = [];

    for (const item of items) {
      const product = await productRepo.getProductById(item.product_id);
      if (!product || !product.track_stock || !product.inventory_item_id) continue;

      const inventoryItem = await inventoryRepo.findOne(product.inventory_item_id);
      if (!inventoryItem) continue;

      const newQuantity = inventoryItem.stock_quantity - item.quantity;
      const updatedItem = { ...inventoryItem, stock_quantity: newQuantity };

      ops.push(...createSyncableOperation('update', 'inventory_items', updatedItem as unknown as Record<string, unknown>, inventoryItem.id));

      const movementId = crypto.randomUUID();
      const movement: StockMovement = {
        id: movementId,
        cafe_id: cafeId,
        inventory_item_id: inventoryItem.id,
        type: 'out',
        quantity: item.quantity,
        reason: `Sale - Order ${orderId.split('-')[0]}`,
        created_at: timestamp
      };

      ops.push(...createSyncableOperation('insert', 'stock_movements', movement as unknown as Record<string, unknown>));
    }

    return ops;
  }
}
