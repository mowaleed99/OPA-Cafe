/**
 * Money Value Object & Financial Calculation Helper
 * Encapsulates rounding, arithmetic, and validation to prevent floating point errors
 * and enforce domain invariants on currency amounts.
 */
export class Money {
  /**
   * Rounds a number to exactly two decimal places using cents conversion.
   */
  static round(amount: number): number {
    if (isNaN(amount) || !isFinite(amount)) return 0;
    return Math.round((amount + Number.EPSILON) * 100) / 100;
  }

  /**
   * Adds multiple monetary amounts together safely.
   */
  static add(...amounts: number[]): number {
    const sum = amounts.reduce((acc, val) => acc + (isNaN(val) ? 0 : val), 0);
    return Money.round(sum);
  }

  /**
   * Subtracts amount b from a safely.
   */
  static subtract(a: number, b: number): number {
    return Money.round((isNaN(a) ? 0 : a) - (isNaN(b) ? 0 : b));
  }

  /**
   * Multiplies an amount by a factor (e.g. quantity or tax rate) safely.
   */
  static multiply(amount: number, factor: number): number {
    return Money.round((isNaN(amount) ? 0 : amount) * (isNaN(factor) ? 0 : factor));
  }

  /**
   * Calculates a percentage of an amount safely.
   * @param amount Base monetary amount
   * @param pct Percentage rate (e.g., 14 for 14%)
   */
  static percentage(amount: number, pct: number): number {
    return Money.round(((isNaN(amount) ? 0 : amount) * (isNaN(pct) ? 0 : pct)) / 100);
  }

  /**
   * Validates whether a number is a non-negative monetary value.
   */
  static isValidNonNegative(amount: number): boolean {
    return typeof amount === 'number' && !isNaN(amount) && isFinite(amount) && amount >= 0;
  }

  /**
   * Formats an amount with standard 2 decimals (without currency symbol, for clean display).
   */
  static formatFixed(amount: number): string {
    return Money.round(amount).toFixed(2);
  }
}
