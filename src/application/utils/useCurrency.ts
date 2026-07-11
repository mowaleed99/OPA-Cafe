import { useSettingsStore } from '../store/useSettingsStore';

/**
 * Returns a formatter function that suffixes the given amount with the user's selected currency.
 * Automatically handles null/undefined values.
 */
export function useCurrency() {
  const currency = useSettingsStore((state) => state.currency);

  const formatCurrency = (amount: number | null | undefined): string => {
    if (amount == null) return `0.00 ${currency}`;
    return `${amount.toFixed(2)} ${currency}`;
  };

  return { currency, formatCurrency };
}
