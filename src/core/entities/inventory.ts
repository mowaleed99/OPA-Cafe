export interface InventoryItem {
  id: string;
  cafe_id: string;
  name: string;
  stock_quantity: number;
  low_stock_threshold?: number | null;
  unit: string;
  cost: number;
  is_countable: boolean;
  pieces_per_carton?: number | null;
  minimum_stock?: number | null;
  created_at: string;
}
