import { IInventoryRepository } from '../../domain/repositories/IInventoryRepository';
import { InventoryItem } from '../../domain/entities/inventory';
import { StockMovement } from '../../domain/entities/stock_movement';

export class SQLiteInventoryRepository implements IInventoryRepository {
  async getInventoryItems(cafeId: string): Promise<InventoryItem[]> {
    const list = await window.electronAPI.db.findMany('inventory_items', { cafe_id: cafeId });
    return list.filter((i: any) => !i.deleted_at) as InventoryItem[];
  }

  async findOne(id: string): Promise<InventoryItem | null> {
    const item = await window.electronAPI.db.findOne('inventory_items', id);
    if (!item || item.deleted_at) return null;
    return item as InventoryItem;
  }

  async addInventoryItem(item: InventoryItem): Promise<void> {
    await window.electronAPI.db.insert('inventory_items', item as any);
  }

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<void> {
    await window.electronAPI.db.update('inventory_items', id, updates as any);
  }

  async deleteInventoryItem(id: string): Promise<void> {
    await window.electronAPI.db.delete('inventory_items', id);
  }

  async getStockMovements(cafeId: string, itemId: string): Promise<StockMovement[]> {
    const list = await window.electronAPI.db.findMany('stock_movements', { cafe_id: cafeId, inventory_item_id: itemId });
    return list.filter((m: any) => !m.deleted_at).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) as StockMovement[];
  }

  async recordStockMovement(movement: StockMovement): Promise<void> {
    await window.electronAPI.db.insert('stock_movements', movement as any);
  }
}
