export type StockMovementType = 'in' | 'out' | 'adjustment';

export interface StockMovement {
  id: string;
  cafe_id: string;
  inventory_item_id: string;
  type: StockMovementType;
  quantity: number;
  reason?: string | null;
  created_by?: string | null;
  created_at: string;
}
