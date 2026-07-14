import { InventoryItem } from '../entities/inventory';
import { StockMovement } from '../entities/stock_movement';

export interface IInventoryRepository {
  getInventoryItems(cafeId: string): Promise<InventoryItem[]>;
  findOne(id: string): Promise<InventoryItem | null>;
  addInventoryItem(item: InventoryItem): Promise<void>;
  updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<void>;
  deleteInventoryItem(id: string): Promise<void>;
  getStockMovements(cafeId: string, itemId: string): Promise<StockMovement[]>;
  recordStockMovement(movement: StockMovement): Promise<void>;
}
