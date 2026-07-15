export interface Expense {
  id: string;
  cafe_id: string;
  category: 'rent' | 'utilities' | 'wages' | 'petty_cash' | 'other' | string;
  amount: number;
  date: string; // ISO format YYYY-MM-DD
  description?: string;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  version?: number;
  device_id?: string;
  last_modified_by?: string;
}
