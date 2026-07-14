export interface DailyClosing {
  id: string;
  cafe_id: string;
  closing_date: string; // ISO date string: YYYY-MM-DD
  total_sales: number;
  total_orders: number;
  total_expenses?: number;
  created_at: string;
  deleted_at?: string;
}

export interface DailyClosingItem {
  id: string;
  daily_closing_id: string;
  product_id: string;
  quantity_sold: number;
  total_revenue: number;
  deleted_at?: string;
}
