export interface Category {
  id: string;
  cafe_id: string;
  name: string;
  status?: 'active' | 'inactive';
  created_at: string;
}
