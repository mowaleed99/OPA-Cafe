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
import { printReceipt } from '../../../application/useCases/printing/printReceipt';
import { useSettingsStore } from '../../../application/store/useSettingsStore';
import { useAuthStore } from '../../../application/store/useAuthStore';
import type { PaymentMethod } from '../../../domain/entities/order';

const PAYMENT_METHOD_KEYS: { id: PaymentMethod; labelKey: string; icon: React.ReactNode }[] = [
  { id: 'cash', labelKey: 'cash', icon: <Banknote size={15} /> },
  { id: 'instapay', labelKey: 'instapay', icon: <Smartphone size={15} /> },
  { id: 'vodafone_cash', labelKey: 'vodafone_cash', icon: <CreditCard size={15} /> },
];

interface TableCartPanelProps {
  onOrderPlaced?: (orderId?: string) => void;
  /** Called after a successful send/checkout — closes the drawer */
  onDone: () => void;
}

export default function TableCartPanel({ onOrderPlaced, onDone }: TableCartPanelProps) {
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
  const [isPlacing, setIsPlacing] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cashReceived, setCashReceived] = useState<string>('');

  const itemCount = getItemCount();
  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const total = getTotal();

  const cashReceivedNum = parseFloat(cashReceived) || 0;
  const changeAmount = cashReceivedNum - total;
  const hasEnoughCash = cashReceivedNum >= total;
  const isCash = paymentMethod === 'cash';

  const handlePlaceOrder = async () => {
    const cafe = cafeId();
    if (!cafe || items.length === 0) return;

    setIsPlacing(true);
    setError(null);
    try {
      if (tableId && activeOrderId) {
        await updateOpenOrder(activeOrderId, items, total);
        setSuccess(true);
        onOrderPlaced?.();
        setTimeout(() => {
          clearCart();
          onDone();
        }, 1000);
      } else if (tableId && !activeOrderId) {
        await placeOrder({ cafeId: cafe, items, paymentMethod: null, total, tableId, status: 'open' });
        setSuccess(true);
        onOrderPlaced?.();
        setTimeout(() => {
          clearCart();
          onDone();
        }, 1000);
      } else {
        // Takeaway
        if (isCash && cashReceivedNum < total) return;
        const result = await placeOrder({ cafeId: cafe, items, paymentMethod, total });
        setSuccess(true);
        clearCart();
        setCashReceived('');
        onOrderPlaced?.(result.orderId);
        setTimeout(() => setSuccess(false), 2500);
      }
    } catch (err) {
      console.error('[TableCartPanel] Failed to place order:', err);
      setError(t('failed_place_order'));
    } finally {
      setIsPlacing(false);
    }
  };

  const handleCheckout = async () => {
    if (!activeOrderId) return;
    if (isCash && cashReceivedNum < total) return;

    setIsCheckingOut(true);
    setError(null);
    try {
      await updateOpenOrder(activeOrderId, items, total);
      await checkoutOpenOrder(activeOrderId, paymentMethod);

      // Auto-print receipt if enabled
      const settings = useSettingsStore.getState();
      if (settings.autoPrintReceipts) {
        try {
          await printReceipt(activeOrderId, useAuthStore.getState().cafeId() || '');
        } catch (printErr) {
          console.error('Auto-print failed:', printErr);
          // could show toast but setError overrides success message, so just log it.
        }
      }

      setCheckoutSuccess(true);
      onOrderPlaced?.();
      setTimeout(() => {
        clearCart();
        onDone();
      }, 1500);
    } catch (err) {
      console.error('[TableCartPanel] Failed to checkout:', err);
      setError(t('failed_checkout'));
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingCart size={17} className="text-muted-foreground" />
          <span className="font-display font-semibold text-foreground text-base">
            {t('current_order')}
          </span>
          {itemCount > 0 && (
            <span className="text-xs font-bold bg-[var(--brand-latte)] text-white rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
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
                    'flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-xs font-medium transition-all duration-150',
                    paymentMethod === method.id
                      ? 'border-[var(--brand-latte)] bg-[var(--brand-latte)]/10 text-[var(--brand-latte)]'
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
            <label htmlFor="table-discount" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              {t('discount_percentage')}
            </label>
            <input
              id="table-discount"
              type="number"
              min={0}
              max={100}
              value={discount === 0 ? '' : discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              placeholder="0"
              className="w-full h-8 rounded-lg border border-input bg-background px-3 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-[var(--brand-latte)]/40 focus:border-[var(--brand-latte)]"
            />
          </div>

          {/* Cash received — only for checkout of existing orders */}
          {isCash && activeOrderId && (
            <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-3">
              <div className="flex items-center gap-3">
                <label htmlFor="table-cash-received" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  {t('cash_received')}
                </label>
                <input
                  id="table-cash-received"
                  type="number"
                  min={0}
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder={total.toFixed(0)}
                  className="w-full h-8 rounded-lg border border-input bg-background px-3 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-[var(--brand-latte)]/40 focus:border-[var(--brand-latte)]"
                />
              </div>
              {cashReceived !== '' && (
                <div
                  className={cn(
                    'flex items-center justify-between rounded-lg px-3 py-2',
                    hasEnoughCash ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-red-50 dark:bg-red-500/10'
                  )}
                >
                  <span
                    className={cn(
                      'text-xs font-medium',
                      hasEnoughCash ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {hasEnoughCash ? t('change_due') : t('not_enough_cash')}
                  </span>
                  <span
                    className={cn(
                      'text-base font-bold tabular-nums',
                      hasEnoughCash ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
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
            <div className="flex justify-between text-base font-bold text-foreground pt-1">
              <span>{t('total')}</span>
              <span className="tabular-nums" style={{ color: 'var(--brand-latte)' }}>
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
            {/* Send Order / Update Order */}
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacing || isCheckingOut || success || items.length === 0}
              className={cn(
                'flex-1 h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200',
                success && !checkoutSuccess
                  ? 'bg-emerald-500 text-white'
                  : 'text-[var(--brand-latte)] bg-[var(--brand-latte)]/10 hover:bg-[var(--brand-latte)]/20 active:scale-95 disabled:opacity-60',
              )}
            >
              {isPlacing ? (
                <><Loader2 size={17} className="animate-spin" /> {t('saving')}</>
              ) : success && !checkoutSuccess ? (
                <><CheckCircle2 size={17} /> {t('done')}</>
              ) : activeOrderId ? (
                t('update_order')
              ) : (
                t('send_order')
              )}
            </button>

            {/* Checkout button — only for existing open orders */}
            {activeOrderId && (
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || isPlacing || checkoutSuccess || (isCash && cashReceived !== '' && !hasEnoughCash)}
                className={cn(
                  'flex-1 h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200',
                  checkoutSuccess
                    ? 'bg-emerald-500 text-white'
                    : 'text-white bg-[var(--brand-latte)] hover:opacity-90 active:scale-95 disabled:opacity-60',
                )}
              >
                {isCheckingOut ? (
                  <><Loader2 size={17} className="animate-spin" /> {t('checking_out')}</>
                ) : checkoutSuccess ? (
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
