export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number; // For low stock alerts
  image?: string; // Optional image URL
  status: 'active' | 'draft' | 'archived';
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
  discountPercent?: number;
}

export type PaymentMethod = 'Cash' | 'Visa' | 'Instapay' | 'Credit';

export interface CustomerDebt {
  id: string;
  customerName: string;
  phone: string;
  totalDebt: number;
  paidDebt: number;
  remainingDebt: number;
  dueDate: string;
  paymentHistory: {
    id: string;
    date: string;
    amount: number;
    notes?: string;
  }[];
}

export interface Order {
  id: string;
  date: string; // ISO string
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    discountPercent?: number;
    notes?: string;
  }[];
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number; // Flat discount
  tax: number;
  total: number;
  cashierId: string;
  cashierName: string;
  status: 'completed' | 'on-hold' | 'void';
}

export interface Table {
  id: string;
  number: number;
  name: string;
  status: 'available' | 'occupied';
  cartItems: CartItem[];
  discountPercent: number;
  notes?: string;
  openedAt?: string; // ISO timestamp
}

export interface DailyClosing {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // Full ISO
  totalSales: number;
  totalOrders: number;
  productBreakdown: {
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }[];
  closedBy: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address?: string;
}

export interface PurchasePayment {
  id: string;
  date: string;
  amount: number;
  notes?: string;
}

export interface Purchase {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  totalAmount: number;
  amountPaid: number;
  amountRemaining: number;
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
  payments: PurchasePayment[];
}

export interface UserRole {
  id: string;
  name: string;
  role: 'Owner' | 'Cashier';
  permissions: string[];
  status: 'active' | 'inactive';
}

export interface CafeSettings {
  cafeName: string;
  logoUrl?: string;
  currency: string;
  taxPercent: number;
  paymentMethods: string[];
  receiptHeader: string;
  receiptFooter: string;
}

export interface ActivityLog {
  id: string;
  time: string;
  user: string;
  action: string;
  details: string;
  type: 'sale' | 'purchase' | 'debt' | 'product' | 'system';
}
