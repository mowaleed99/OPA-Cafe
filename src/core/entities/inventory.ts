export interface InventoryItem {
  id: string;
  cafe_id: string;
  name: string;
  stock_quantity: number;
  low_stock_threshold?: number | null;
  unit: string;
  cost: number;
  created_at: string;
}
