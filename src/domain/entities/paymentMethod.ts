import type { PaymentMethod } from './order';

export const SUPABASE_ALLOWED_PAYMENT_METHODS: readonly string[] = ['cash', 'card', 'other'] as const;

export function normalizePaymentMethodForSupabase(method: PaymentMethod | string | null | undefined): PaymentMethod | null {
  if (!method) return null;
  if (SUPABASE_ALLOWED_PAYMENT_METHODS.includes(method)) {
    return method as PaymentMethod;
  }
  return 'other' as PaymentMethod;
}
