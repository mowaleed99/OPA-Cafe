export interface DailyClosing {
  id: string;
  cafe_id: string;
  closing_date: string;
  closed_at: string;
  closed_by: string;
  total_orders: number;
  total_sales: number;
  cash_sales: number;
  instapay_sales: number;
  vodafone_cash_sales: number;
  total_expenses: number;
  cash_in_drawer: number;
  expected_cash: number;
  difference: number;
  notes?: string | null;
  created_at?: string;
  deleted_at?: string;
}

export interface DailyClosingItem {
  id: string;
  daily_closing_id: string;
  product_id: string;
  quantity_sold: number;
  total_sales: number;
  category_name: string;
  product_name: string;
  deleted_at?: string;
  updated_at?: string;
  version?: number;
  device_id?: string;
  last_modified_by?: string;
}
