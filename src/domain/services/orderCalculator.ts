import { Money } from '../entities/money';
import type { OrderItem } from '../entities/order';

export interface OrderCalculationInput {
  items: { price: number; quantity: number }[];
  discountAmount?: number;
  taxRate?: number; // e.g. 14 for 14%
}

export interface OrderSummary {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

export interface ProductAggregation {
  quantity: number;
  revenue: number;
}

export class OrderCalculator {
  /**
   * Calculates subtotal, discount, tax, and final total for an order or cart safely using Money.
   */
  static calculateSummary({ items, discountAmount = 0, taxRate = 0 }: OrderCalculationInput): OrderSummary {
    const subtotal = items.reduce((sum, item) => {
      const itemSubtotal = Money.multiply(item.price, item.quantity);
      return Money.add(sum, itemSubtotal);
    }, 0);

    const validDiscount = Math.min(Math.max(0, Money.round(discountAmount)), subtotal);
    const taxableAmount = Money.subtract(subtotal, validDiscount);
    const tax = Money.percentage(taxableAmount, taxRate);
    const total = Money.add(taxableAmount, tax);

    return {
      subtotal,
      discount: validDiscount,
      tax,
      total,
    };
  }

  /**
   * Aggregates a list of OrderItems by product_id into total quantities and revenues.
   */
  static aggregateByProduct(items: OrderItem[]): Record<string, ProductAggregation> {
    const result: Record<string, ProductAggregation> = {};
    for (const item of items) {
      if (!result[item.product_id]) {
        result[item.product_id] = { quantity: 0, revenue: 0 };
      }
      result[item.product_id].quantity += item.quantity;
      result[item.product_id].revenue = Money.add(result[item.product_id].revenue, item.subtotal);
    }
    return result;
  }
}
