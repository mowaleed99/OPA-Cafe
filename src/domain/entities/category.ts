export interface Category {
  id: string;
  cafe_id: string;
  name: string;
  status?: 'active' | 'inactive';
  created_at: string;
  deleted_at?: string;
  updated_at?: string;
  version?: number;
  device_id?: string;
  last_modified_by?: string;
}
