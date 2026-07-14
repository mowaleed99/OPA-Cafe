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
import { useNavigate } from 'react-router-dom';
import type { PaymentMethod } from '../../../domain/entities/order';
import { Input } from '../../components/ui/input';
import { useToast } from '../../hooks/useToast';

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

  const cafeId = useAuthStore(s => s.cafeId());
  const appUser = useAuthStore(s => s.appUser);
  const { language } = useSettingsStore();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isPlacing, setIsPlacing] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [success, setSuccess] = useState(false);
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
    const cafe = cafeId;
    const currentUser = appUser;
    if (!cafe) {
      addToast('User profile not loaded. Please restart the app.', 'error');
      return;
    }
    if (items.length === 0) return;
    
    // Check cash guard
    if (!tableId && isCash && cashReceivedNum < total) {
      addToast(t('not_enough_cash'), 'error');
      return;
    }

    if (total < 0) {
      addToast('Discount cannot exceed subtotal', 'error');
      return;
    }

    setIsPlacing(true);
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
        await placeOrder({ cafeId: cafeId as string, items, paymentMethod: null, total, tableId, status: 'open', userId: currentUser?.id, userName: currentUser?.name });
        setSuccess(true);
        setTimeout(() => {
          clearCart();
          navigate('/tables');
        }, 1000);
      } else {
        // Create paid order (Takeaway)
        const result = await placeOrder({ cafeId: cafeId as string, items, paymentMethod, total, userId: currentUser?.id, userName: currentUser?.name });
        
        // Auto-print receipt if enabled
        const settings = useSettingsStore.getState();
        if (settings.autoPrintReceipts) {
          try {
            await printReceipt(result.orderId, cafeId as string);
          } catch (printErr) {
            console.error('Auto-print failed:', printErr);
            addToast('Order completed, but failed to print receipt.', 'error');
          }
        }

        setSuccess(true);
        clearCart();
        setCashReceived('');
        onOrderPlaced?.(result.orderId);
        setTimeout(() => setSuccess(false), 2500);
      }
    } catch (err: any) {
      console.error('[CartPanel] Failed to place order:', err);
      addToast(err.message || t('failed_place_order'), 'error');
    } finally {
      setIsPlacing(false);
    }
  };

  const handleCheckout = async () => {
    if (!activeOrderId) return;
    if (isCash && cashReceivedNum < total) {
      addToast(t('not_enough_cash'), 'error');
      return;
    }
    
    setIsCheckingOut(true);
    const currentUser = useAuthStore.getState().appUser;
    try {
      // First update the order with any new items just in case
      await updateOpenOrder(activeOrderId, items, total);
      // Then checkout (mark as paid)
      await checkoutOpenOrder(activeOrderId, paymentMethod, currentUser?.id, currentUser?.name);
      
      // Auto-print receipt if enabled
      const settings = useSettingsStore.getState();
      if (settings.autoPrintReceipts) {
        try {
          await printReceipt(activeOrderId, useAuthStore.getState().cafeId() || '');
        } catch (printErr) {
          console.error('Auto-print failed:', printErr);
          addToast('Checkout completed, but failed to print receipt.', 'error');
        }
      }

      setSuccess(true);
      setTimeout(() => {
        clearCart();
        navigate('/tables');
      }, 1500);
    } catch (err: any) {
      console.error('[CartPanel] Failed to checkout:', err);
      addToast(err.message || t('failed_checkout'), 'error');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-card border-l border-border">
      {/* Success Overlay */}
      {success && (
        <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="bg-emerald-100 text-emerald-600 p-5 rounded-full mb-4 shadow-sm">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">{t('order_successful', 'Order Successful')}</h2>
          <p className="text-muted-foreground text-sm">{t('preparing_next_order', 'Preparing next order...')}</p>
        </div>
      )}

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
                <div className="flex items-center gap-1 shrink-0 bg-muted/50 rounded-lg p-0.5 border border-border/50">
                  <button
                    onClick={() => decrementItem(item.product.id)}
                    className="w-8 h-8 rounded-md bg-background shadow-sm hover:bg-muted flex items-center justify-center text-foreground transition-colors active:scale-95"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center text-[15px] font-bold tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => incrementItem(item.product.id)}
                    className="w-8 h-8 rounded-md bg-background shadow-sm hover:bg-muted flex items-center justify-center text-foreground transition-colors active:scale-95"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0 ml-1">
                  <p className="text-[15px] font-semibold text-foreground truncate">
                    {item.product.name}
                  </p>
                  <p className="text-[13px] text-muted-foreground">
                    {item.unit_price.toLocaleString('en-EG')} EGP
                  </p>
                </div>

                {/* Subtotal + remove */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[15px] font-bold text-foreground tabular-nums">
                    {item.subtotal.toLocaleString('en-EG')} EGP
                  </span>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 size={16} />
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
          <div className="flex items-center gap-3 bg-muted/30 p-2.5 rounded-lg border border-border/50">
            <label htmlFor="pos-discount" className="text-[13px] font-semibold text-foreground whitespace-nowrap flex-1">
              {t('discount_percentage')} (%)
            </label>
            <Input
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
              className="w-20 h-9 text-right tabular-nums font-bold"
            />
          </div>

          {/* Cash received — only shown for Cash payment */}
          {isCash && (
            <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-3.5 shadow-sm">
              <div className="flex items-center gap-3">
                <label htmlFor="pos-cash-received" className="text-[13px] font-semibold text-foreground whitespace-nowrap flex-1">
                  {t('cash_received')}
                </label>
                <Input
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
                  className="w-32 h-10 text-right tabular-nums font-bold text-base"
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
