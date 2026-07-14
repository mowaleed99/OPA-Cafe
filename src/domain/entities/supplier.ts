export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export interface Supplier {
  id: string;
  cafe_id: string;
  name: string;
  contact_info?: string | null;
  created_at: string;
  deleted_at?: string;
}

export interface Purchase {
  id: string;
  cafe_id: string;
  supplier_id: string;
  total_amount: number;
  amount_paid: number;
  amount_remaining: number;
  payment_status: PaymentStatus;
  created_at: string;
  deleted_at?: string;
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  inventory_item_id: string;
  item_name?: string;
  quantity: number;
  unit_cost: number;
  subtotal: number;
  deleted_at?: string;
}

export interface SupplierPayment {
  id: string;
  purchase_id: string;
  supplier_id: string;
  amount: number;
  payment_date: string;
  notes?: string | null;
  deleted_at?: string;
}
