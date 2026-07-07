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
import { useNavigate } from 'react-router-dom';
import type { PaymentMethod } from '../../../core/entities/order';

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { id: 'cash', label: 'Cash', icon: <Banknote size={15} /> },
  { id: 'instapay', label: 'Instapay', icon: <Smartphone size={15} /> },
  { id: 'vodafone_cash', label: 'Vodafone Cash', icon: <CreditCard size={15} /> },
];

interface CartPanelProps {
  onOrderPlaced?: (orderId: string) => void;
}

export default function CartPanel({ onOrderPlaced }: CartPanelProps) {
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

  // Cash change calculation
  const cashReceivedNum = parseFloat(cashReceived) || 0;
  const changeAmount = cashReceivedNum - total;
  const hasEnoughCash = cashReceivedNum >= total;
  const isCash = paymentMethod === 'cash';

  const handlePlaceOrder = async () => {
    const cafe = cafeId();
    if (!cafe || items.length === 0) return;
    // only check cash guard if we are actually checking out now (takeaway)
    if (!tableId && isCash && cashReceivedNum < total) return; 

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
    } catch (err) {
      console.error('[CartPanel] Failed to place order:', err);
      setError('Failed to place/update order. Please try again.');
    } finally {
      setIsPlacing(false);
    }
  };

  const handleCheckout = async () => {
    if (!activeOrderId) return;
    if (isCash && cashReceivedNum < total) return; // guard: not enough cash
    
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
    } catch (err) {
      console.error('[CartPanel] Failed to checkout:', err);
      setError('Failed to checkout. Please try again.');
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
            Current Order
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
            Clear
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
              <p className="text-sm font-medium text-foreground">No items yet</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tap a product to add it to the order
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
                    {item.unit_price.toLocaleString('en-EG')} EGP each
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
              Payment Method
            </p>
            <div className="flex gap-2">
              {PAYMENT_METHODS.map((method) => (
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
                  <span className="text-[10px] leading-tight text-center">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Discount */}
          <div className="flex items-center gap-3">
            <label htmlFor="pos-discount" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              Discount %
            </label>
            <input
              id="pos-discount"
              type="number"
              min={0}
              max={100}
              value={discount === 0 ? '' : discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              placeholder="0"
              className="w-full h-8 rounded-lg border border-input bg-background px-3 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-[var(--brand-latte)]/40 focus:border-[var(--brand-latte)]"
            />
          </div>

          {/* Cash received — only shown for Cash payment */}
          {isCash && (
            <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-3">
              <div className="flex items-center gap-3">
                <label htmlFor="pos-cash-received" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  Cash received
                </label>
                <input
                  id="pos-cash-received"
                  type="number"
                  min={0}
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder={total.toFixed(0)}
                  className="w-full h-8 rounded-lg border border-input bg-background px-3 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-[var(--brand-latte)]/40 focus:border-[var(--brand-latte)]"
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
                    {hasEnoughCash ? 'Change due' : 'Not enough cash'}
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
              <span>Subtotal</span>
              <span className="tabular-nums">{subtotal.toLocaleString('en-EG')} EGP</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                <span>Discount ({discount}%)</span>
                <span className="tabular-nums">−{discountAmount.toLocaleString('en-EG')} EGP</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-foreground pt-1">
              <span>Total</span>
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
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacing || isCheckingOut || success || items.length === 0 || (!tableId && isCash && cashReceived !== '' && !hasEnoughCash)}
              className={cn(
                'flex-1 h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200',
                success && !isCheckingOut
                  ? 'bg-emerald-500 text-white'
                  : 'text-[var(--brand-latte)] bg-[var(--brand-latte)]/10 hover:bg-[var(--brand-latte)]/20 active:scale-95 disabled:opacity-60',
              )}
            >
              {isPlacing ? (
                <><Loader2 size={17} className="animate-spin" /> Saving…</>
              ) : success && !isCheckingOut ? (
                <><CheckCircle2 size={17} /> Done!</>
              ) : tableId ? (
                activeOrderId ? 'Update Order' : 'Send Order'
              ) : (
                'Place Order'
              )}
            </button>

            {tableId && activeOrderId && (
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || isPlacing || success || (isCash && cashReceived !== '' && !hasEnoughCash)}
                className={cn(
                  'flex-1 h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200',
                  success && isCheckingOut
                    ? 'bg-emerald-500 text-white'
                    : 'text-white bg-[var(--brand-latte)] hover:opacity-90 active:scale-95 disabled:opacity-60',
                )}
              >
                {isCheckingOut ? (
                  <><Loader2 size={17} className="animate-spin" /> Checking out…</>
                ) : success && isCheckingOut ? (
                  <><CheckCircle2 size={17} /> Paid!</>
                ) : (
                  'Checkout'
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
