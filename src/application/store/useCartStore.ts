import { create } from 'zustand';
import type { Product } from '../../domain/entities/product';
import type { PaymentMethod } from '../../domain/entities/order';

export interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  subtotal: number;
  note: string;
}

interface CartState {
  items: CartItem[];
  paymentMethod: PaymentMethod;
  discount: number; // percentage 0–100
  tableId: string | null;
  activeOrderId: string | null;

  // Computed (functions so they always read latest state)
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
  getItemCount: () => number;

  // Actions
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  incrementItem: (productId: string) => void;
  decrementItem: (productId: string) => void;
  setItemNote: (productId: string, note: string) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setDiscount: (pct: number) => void;
  setItems: (items: CartItem[]) => void;
  setTableId: (id: string | null) => void;
  setActiveOrderId: (id: string | null) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  paymentMethod: 'cash',
  discount: 0,
  tableId: null,
  activeOrderId: null,

  getSubtotal: () =>
    get().items.reduce((sum, item) => sum + item.subtotal, 0),

  getDiscountAmount: () => {
    const subtotal = get().getSubtotal();
    return Math.round(subtotal * (get().discount / 100) * 100) / 100;
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discountAmount = get().getDiscountAmount();
    return Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);
  },

  getItemCount: () =>
    get().items.reduce((sum, item) => sum + item.quantity, 0),

  addItem: (product) =>
    set((state) => {
      const existing = state.items.find((i) => i.product.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === product.id
              ? {
                  ...i,
                  quantity: i.quantity + 1,
                  subtotal: (i.quantity + 1) * i.unit_price,
                }
              : i
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            product,
            quantity: 1,
            unit_price: product.price,
            subtotal: product.price,
            note: '',
          },
        ],
      };
    }),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.product.id !== productId),
    })),

  incrementItem: (productId) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.product.id === productId
          ? {
              ...i,
              quantity: i.quantity + 1,
              subtotal: (i.quantity + 1) * i.unit_price,
            }
          : i
      ),
    })),

  decrementItem: (productId) =>
    set((state) => {
      const item = state.items.find((i) => i.product.id === productId);
      if (!item) return state;
      if (item.quantity <= 1) {
        return { items: state.items.filter((i) => i.product.id !== productId) };
      }
      return {
        items: state.items.map((i) =>
          i.product.id === productId
            ? {
                ...i,
                quantity: i.quantity - 1,
                subtotal: (i.quantity - 1) * i.unit_price,
              }
            : i
        ),
      };
    }),

  setItemNote: (productId, note) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.product.id === productId ? { ...i, note } : i
      ),
    })),

  setPaymentMethod: (method) => set({ paymentMethod: method }),

  setDiscount: (pct) => set({ discount: Math.max(0, Math.min(100, pct)) }),

  setItems: (items) => set({ items }),
  
  setTableId: (id) => set({ tableId: id }),

  setActiveOrderId: (id) => set({ activeOrderId: id }),

  clearCart: () => set({ items: [], discount: 0, paymentMethod: 'cash', tableId: null, activeOrderId: null }),
}));
