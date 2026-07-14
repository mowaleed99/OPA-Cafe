import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Loader2,
  CheckCircle2,
  Banknote,
  Smartphone,
  CreditCard,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useCartStore } from '../../../application/store/useCartStore';
import { placeOrder } from '../../../application/useCases/pos/placeOrder';
import { updateOpenOrder } from '../../../application/useCases/pos/updateOpenOrder';
import { checkoutOpenOrder } from '../../../application/useCases/pos/checkoutOpenOrder';
import { useAuthStore } from '../../../application/store/useAuthStore';
import { useSettingsStore } from '../../../application/store/useSettingsStore';
import { useNavigate } from 'react-router-dom';
import type { PaymentMethod } from '../../../domain/entities/order';

const PAYMENT_METHOD_KEYS: { id: PaymentMethod; labelKey: string; icon: React.ReactNode }[] = [
  { id: 'cash', labelKey: 'cash', icon: <Banknote size={15} /> },
  { id: 'instapay', labelKey: 'instapay', icon: <Smartphone size={15} /> },
  { id: 'vodafone_cash', labelKey: 'vodafone_cash', icon: <CreditCard size={15} /> },
];

interface CartPanelProps {
  onOrderPlaced?: (orderId: string) => void;
}

export default function CartPanel({ onOrderPlaced }: CartPanelProps) {
  const { t } = useTranslation();
  const {
    items,
    paymentMethod,
    discount,
    getSubtotal,
    getDiscountAmount,
    getTotal,
    getItemCount,
    incrementItem,
    decrementItem,
    removeItem,
    setPaymentMethod,
    setDiscount,
    clearCart,
    tableId,
    activeOrderId,
  } = useCartStore();

  const { cafeId } = useAuthStore();
  const { language } = useSettingsStore();
  const navigate = useNavigate();
  const [isPlacing, setIsPlacing] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cashReceived, setCashReceived] = useState<string>('');

  const itemCount = getItemCount();
  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const total = getTotal();

  const parseAmount = (val: string): number => {
    if (!val) return total; // Default to exact amount if empty
    // Convert Arabic numerals to English
    const englishStr = val.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
    return parseFloat(englishStr) || 0;
  };

  // Cash change calculation
  const cashReceivedNum = parseAmount(cashReceived);
  const changeAmount = cashReceivedNum - total;
  const hasEnoughCash = cashReceivedNum >= total;
  const isCash = paymentMethod === 'cash';

  const handlePlaceOrder = async () => {
    const cafe = cafeId();
    if (!cafe) {
      setError('User profile not loaded. Please restart the app.');
      return;
    }
    if (items.length === 0) return;
    
    // Check cash guard
    if (!tableId && isCash && cashReceivedNum < total) {
      setError(t('not_enough_cash'));
      return;
    }

    setIsPlacing(true);
    setError(null);
    try {
      if (tableId && activeOrderId) {
        // Update existing open order (Dine-in)
        await updateOpenOrder(activeOrderId, items, total);
        setSuccess(true);
        setTimeout(() => {
          clearCart();
          navigate('/tables');
        }, 1000);
      } else if (tableId && !activeOrderId) {
        // Create new open order (Dine-in)
        await placeOrder({ cafeId: cafe, items, paymentMethod: null, total, tableId, status: 'open' });
        setSuccess(true);
        setTimeout(() => {
          clearCart();
          navigate('/tables');
        }, 1000);
      } else {
        // Create paid order (Takeaway)
        const result = await placeOrder({ cafeId: cafe, items, paymentMethod, total });
        setSuccess(true);
        clearCart();
        setCashReceived('');
        onOrderPlaced?.(result.orderId);
        setTimeout(() => setSuccess(false), 2500);
      }
    } catch (err: any) {
      console.error('[CartPanel] Failed to place order:', err);
      setError(err.message || t('failed_place_order'));
    } finally {
      setIsPlacing(false);
    }
  };

  const handleCheckout = async () => {
    if (!activeOrderId) return;
    if (isCash && cashReceivedNum < total) {
      setError(t('not_enough_cash'));
      return;
    }
    
    setIsCheckingOut(true);
    setError(null);
    try {
      // First update the order with any new items just in case
      await updateOpenOrder(activeOrderId, items, total);
      // Then checkout (mark as paid)
      await checkoutOpenOrder(activeOrderId, paymentMethod);
      setSuccess(true);
      setTimeout(() => {
        clearCart();
        navigate('/tables');
      }, 1500);
    } catch (err: any) {
      console.error('[CartPanel] Failed to checkout:', err);
      setError(err.message || t('failed_checkout'));
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingCart size={17} className="text-muted-foreground" />
          <span className="font-display font-semibold text-foreground text-base">
            {t('current_order')}
          </span>
          {itemCount > 0 && (
            <span className="text-xs font-bold bg-primary text-primary-foreground rounded-sm min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-sm">
              {itemCount}
            </span>
          )}
        </div>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
          >
            <Trash2 size={13} />
            {t('clear')}
          </button>
        )}
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-10 px-4">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
              <ShoppingCart size={20} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{t('no_items_yet')}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('tap_product_to_add')}
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.product.id} className="flex items-center gap-3 px-4 py-3">
                {/* Quantity controls */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => decrementItem(item.product.id)}
                    className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/70 flex items-center justify-center text-foreground transition-colors active:scale-90"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="w-5 text-center text-sm font-semibold tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => incrementItem(item.product.id)}
                    className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/70 flex items-center justify-center text-foreground transition-colors active:scale-90"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.unit_price.toLocaleString('en-EG')} EGP {t('each')}
                  </p>
                </div>

                {/* Subtotal + remove */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold text-foreground tabular-nums">
                    {item.subtotal.toLocaleString('en-EG')} EGP
                  </span>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bottom section */}
      {items.length > 0 && (
        <div className="shrink-0 border-t border-border px-4 pt-4 pb-4 space-y-4">
          {/* Payment method */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('payment_method')}
            </p>
            <div className="flex gap-2">
              {PAYMENT_METHOD_KEYS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-md border text-xs font-medium transition-all duration-150',
                    paymentMethod === method.id
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border text-muted-foreground hover:border-border/70 hover:bg-muted/50'
                  )}
                >
                  {method.icon}
                  <span className="text-[10px] leading-tight text-center">{t(method.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Discount */}
          <div className="flex items-center gap-3">
            <label htmlFor="pos-discount" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              {t('discount_percentage')}
            </label>
            <input
              id="pos-discount"
              type="text"
              inputMode="decimal"
              value={discount === 0 ? '' : discount}
              onChange={(e) => {
                const val = e.target.value;
                const digitsOnly = val.replace(/[^0-9٠-٩]/g, '');
                if (digitsOnly === '') {
                  setDiscount(0);
                  return;
                }
                const englishStr = digitsOnly.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
                const num = parseInt(englishStr, 10) || 0;
                setDiscount(Math.min(100, Math.max(0, num)));
              }}
              placeholder="0"
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-right tabular-nums focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-sm"
            />
          </div>

          {/* Cash received — only shown for Cash payment */}
          {isCash && (
            <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-3">
              <div className="flex items-center gap-3">
                <label htmlFor="pos-cash-received" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  {t('cash_received')}
                </label>
                <input
                  id="pos-cash-received"
                  type="text"
                  inputMode="decimal"
                  value={cashReceived}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Strip anything that is not a digit or decimal point
                    const digitsOnly = val.replace(/[^0-9٠-٩.,]/g, '');
                    setCashReceived(digitsOnly.replace(',', '.'));
                  }}
                  placeholder={total.toFixed(0)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-right tabular-nums focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-sm"
                />
              </div>

              {/* Change due */}
              {cashReceived !== '' && (
                <div
                  className={cn(
                    'flex items-center justify-between rounded-lg px-3 py-2',
                    hasEnoughCash
                      ? 'bg-emerald-50 dark:bg-emerald-500/10'
                      : 'bg-red-50 dark:bg-red-500/10'
                  )}
                >
                  <span
                    className={cn(
                      'text-xs font-medium',
                      hasEnoughCash
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {hasEnoughCash ? t('change_due') : t('not_enough_cash')}
                  </span>
                  <span
                    className={cn(
                      'text-base font-bold tabular-nums',
                      hasEnoughCash
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {hasEnoughCash
                      ? `${changeAmount.toLocaleString('en-EG')} EGP`
                      : `−${Math.abs(changeAmount).toLocaleString('en-EG')} EGP`}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Totals */}
          <div className="space-y-1.5 py-3 border-y border-border">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{t('subtotal')}</span>
              <span className="tabular-nums">{subtotal.toLocaleString('en-EG')} EGP</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                <span>{t('discount_label')} ({discount}%)</span>
                <span className="tabular-nums">−{discountAmount.toLocaleString('en-EG')} EGP</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-foreground pt-1">
              <span>{t('total')}</span>
              <span className="tabular-nums">
                {total.toLocaleString('en-EG')} EGP
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacing || isCheckingOut || success || items.length === 0 || (!tableId && isCash && cashReceived !== '' && !hasEnoughCash)}
              className={cn(
                'flex-1 h-12 rounded-md text-[15px] font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-sm border border-transparent',
                success && !isCheckingOut
                  ? 'bg-emerald-600 text-white'
                  : 'bg-primary text-primary-foreground hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed',
              )}
            >
              {isPlacing ? (
                <><Loader2 size={17} className="animate-spin" /> {t('saving')}</>
              ) : success && !isCheckingOut ? (
                <><CheckCircle2 size={17} /> {t('done')}</>
              ) : tableId ? (
                activeOrderId ? t('update_order') : t('send_order')
              ) : (
                t('place_order')
              )}
            </button>

            {tableId && activeOrderId && (
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || isPlacing || success || (isCash && cashReceived !== '' && !hasEnoughCash)}
                className={cn(
                  'flex-1 h-12 rounded-md text-[15px] font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-sm border border-transparent',
                  success && isCheckingOut
                    ? 'bg-emerald-600 text-white'
                    : 'bg-card text-foreground border-border hover:bg-muted active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed',
                )}
              >
                {isCheckingOut ? (
                  <><Loader2 size={17} className="animate-spin" /> {t('checking_out')}</>
                ) : success && isCheckingOut ? (
                  <><CheckCircle2 size={17} /> {t('paid')}</>
                ) : (
                  t('checkout')
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
