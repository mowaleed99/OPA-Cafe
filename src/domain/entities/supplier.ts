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
  date: string;
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
  cafe_id: string;
  purchase_id?: string | null;
  supplier_id: string;
  amount: number;
  payment_method: string;
  date: string;
  reference_number?: string | null;
  notes?: string | null;
  created_at: string;
  deleted_at?: string;
  updated_at?: string;
  version?: number;
  device_id?: string;
  last_modified_by?: string;
}
