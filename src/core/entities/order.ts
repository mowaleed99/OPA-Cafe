export type OrderType = 'dine_in' | 'takeaway';
export type OrderStatus = 'open' | 'closed' | 'paid' | 'voided';
export type PaymentMethod = 'cash' | 'instapay' | 'vodafone_cash';

export interface Order {
  id: string;
  cafe_id: string;
  table_id?: string | null;
  order_type: OrderType;
  status: OrderStatus;
  payment_method?: PaymentMethod | null;
  total_amount: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}
