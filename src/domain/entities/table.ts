export type TableStatus = 'available' | 'occupied';

export interface DiningTable {
  id: string;
  cafe_id: string;
  name_or_number: string;
  status: TableStatus;
  current_order_id?: string | null;
  deleted_at?: string;
  updated_at?: string;
  version?: number;
  device_id?: string;
  last_modified_by?: string;
}
