export interface InventoryItem {
  id: string;
  cafe_id: string;
  name: string;
  stock_quantity: number;
  low_stock_threshold?: number | null;
  unit: string;
  cost_per_unit: number;
  is_countable: boolean;
  pieces_per_carton?: number | null;
  minimum_stock?: number | null;
  created_at: string;
  deleted_at?: string;
  updated_at?: string;
  version?: number;
  device_id?: string;
  last_modified_by?: string;
}
