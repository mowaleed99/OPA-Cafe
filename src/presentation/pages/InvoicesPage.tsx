import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../application/store/useAuthStore';
import { useSettingsStore } from '../../application/store/useSettingsStore';
import { useCurrency } from '../../application/utils/useCurrency';
import { db } from '../../infrastructure/database/db';
import { voidOrder } from '../../application/useCases/orders/voidOrder';
import type { Order, OrderItem } from '../../core/entities/order';
import type { Purchase, PurchaseItem, Supplier } from '../../core/entities/supplier';
import { PinEntryDialog } from '../components/PinEntryDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import {
  FileText,
  Truck,
  Search,
  Eye,
  Printer,
  Ban,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Receipt,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
type InvoicesTab = 'sales' | 'supplier';

interface EnrichedOrder extends Order {
  items?: OrderItem[];
}

interface EnrichedPurchase extends Purchase {
  supplierName: string;
  items?: PurchaseItem[];
}

// ── Sales Invoice Detail Modal ────────────────────────────────────────────────
function SalesInvoiceModal({
  order,
  isOpen,
  onClose,
  onVoidRefund,
}: {
  order: EnrichedOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onVoidRefund: (order: EnrichedOrder, actionType: 'void' | 'refund') => void;
}) {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const { cafeName } = useSettingsStore();
  const isOwner = useAuthStore(s => s.isOwner());
  const [items, setItems] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!order) return;
    (async () => {
      const orderItems = await db.order_items.where('order_id').equals(order.id).toArray();
      setItems(orderItems);
      const prods = await db.products.where('cafe_id').equals(order.cafe_id).toArray();
      const map: Record<string, string> = {};
      prods.forEach(p => { map[p.id] = p.name; });
      setProducts(map);
    })();
  }, [order]);

  if (!order) return null;

  const isVoided = order.status === 'voided';

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt size={18} />
            {t('sales_invoice')} #{order.id.slice(0, 8).toUpperCase()}
          </DialogTitle>
        </DialogHeader>

        {/* Print area */}
        <div className="space-y-4 print:text-black print:bg-white">
          {/* Cafe Header */}
          <div className="text-center border-b pb-3">
            <p className="font-bold text-base">{cafeName}</p>
            <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
          </div>

          {/* Status badge */}
          {isVoided && (
            <div className="flex items-center justify-center gap-2 p-2 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <Ban size={14} className="text-orange-600" />
              <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">{t('order_voided')}</span>
            </div>
          )}

          {/* Order Meta */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">{t('order_type')}:</span>
              <span className="font-medium ml-1">{order.order_type === 'dine_in' ? t('dine_in') : t('takeaway')}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{t('payment_method')}:</span>
              <span className="font-medium ml-1 capitalize">{order.payment_method?.replace('_', ' ') ?? '—'}</span>
            </div>
          </div>

          {/* Items Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('product')}</TableHead>
                <TableHead className="text-center">{t('qty')}</TableHead>
                <TableHead className="text-right">{t('subtotal')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{products[item.product_id] ?? item.product_id}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center border-t pt-3 font-bold">
            <span>{t('total')}</span>
            <span className="text-lg">{formatCurrency(order.total_amount)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t flex-wrap">
          <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
            <Printer size={14} />
            {t('print')}
          </Button>
          {isOwner && !isVoided && (
            <>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950/30"
                onClick={() => onVoidRefund(order, 'void')}
              >
                <Ban size={14} />
                {t('void_order')}
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/30"
                onClick={() => onVoidRefund(order, 'refund')}
              >
                <RotateCcw size={14} />
                {t('refund_order')}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Void/Refund Flow ──────────────────────────────────────────────────────────
function VoidRefundFlow({
  order,
  actionType,
  isOpen,
  onClose,
  onSuccess,
}: {
  order: EnrichedOrder | null;
  actionType: 'void' | 'refund';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const cafeId = useAuthStore(s => s.cafeId());
  const appUser = useAuthStore(s => s.appUser);
  const ownerPinHash = useSettingsStore(s => s.ownerPinHash);

  const [step, setStep] = useState<'reason' | 'pin' | 'done'>('reason');
  const [reason, setReason] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('reason');
      setReason('');
      setPinError(null);
      setResultMsg(null);
    }
  }, [isOpen]);

  const handleProceedToPin = () => {
    if (!ownerPinHash) {
      setResultMsg({ type: 'error', text: t('no_pin_set_error') });
      setStep('done');
      return;
    }
    setStep('pin');
  };

  const handlePinSubmit = async (enteredPin: string) => {
    if (!order || !cafeId || !appUser) return;
    setIsLoading(true);
    setPinError(null);

    const result = await voidOrder({
      orderId: order.id,
      cafeId,
      initiatedByUser: appUser,
      actionType,
      reason,
      enteredPin,
    });

    setIsLoading(false);

    if (result.success) {
      setStep('done');
      setResultMsg({ type: 'success', text: t(actionType === 'void' ? 'order_voided_success' : 'order_refunded_success') });
    } else {
      if (result.error === 'pin_incorrect') {
        setPinError(t('pin_incorrect'));
      } else if (result.error === 'no_pin_set') {
        setStep('done');
        setResultMsg({ type: 'error', text: t('no_pin_set_error') });
      } else {
        setPinError(t('void_error'));
      }
    }
  };

  const handleDone = () => {
    if (resultMsg?.type === 'success') onSuccess();
    onClose();
  };

  return (
    <>
      {/* Reason step — shown as a simple inline dialog */}
      <Dialog open={isOpen && step === 'reason'} onOpenChange={open => { if (!open) onClose(); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'void' ? <Ban size={16} className="text-orange-500" /> : <RotateCcw size={16} className="text-blue-500" />}
              {t(actionType === 'void' ? 'void_order' : 'refund_order')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('void_refund_reason_prompt')}</p>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t('reason')} ({t('optional')})</label>
              <Textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder={t('void_reason_placeholder')}
                rows={3}
                className="resize-none"
              />
            </div>
            <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg border">
              {t('owner_pin_required_notice')}
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">{t('cancel')}</Button>
            <Button onClick={handleProceedToPin} className="flex-1">{t('continue')}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PIN step */}
      <PinEntryDialog
        isOpen={isOpen && step === 'pin'}
        onClose={onClose}
        onSubmit={handlePinSubmit}
        isLoading={isLoading}
        error={pinError}
        description={t('enter_owner_pin_desc')}
      />

      {/* Done step */}
      <Dialog open={isOpen && step === 'done'} onOpenChange={open => { if (!open) handleDone(); }}>
        <DialogContent className="sm:max-w-xs">
          <div className="flex flex-col items-center gap-4 py-4">
            {resultMsg?.type === 'success' ? (
              <CheckCircle2 size={48} className="text-emerald-500" />
            ) : (
              <AlertCircle size={48} className="text-destructive" />
            )}
            <p className="text-sm text-center font-medium">{resultMsg?.text}</p>
            <Button onClick={handleDone} className="w-full">{t('close')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Sales Invoices Tab ────────────────────────────────────────────────────────
function SalesInvoicesTab() {
  const { t } = useTranslation();
  const cafeId = useAuthStore(s => s.cafeId());
  const { formatCurrency } = useCurrency();

  const [orders, setOrders] = useState<EnrichedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'paid' | 'voided' | 'all'>('all');

  const [selectedOrder, setSelectedOrder] = useState<EnrichedOrder | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [voidAction, setVoidAction] = useState<'void' | 'refund'>('void');
  const [showVoidFlow, setShowVoidFlow] = useState(false);

  const loadOrders = useCallback(async () => {
    if (!cafeId) return;
    setIsLoading(true);
    try {
      const allOrders = await db.orders
        .where('cafe_id')
        .equals(cafeId)
        .filter(o => o.status === 'paid' || o.status === 'voided')
        .reverse()
        .sortBy('created_at');
      setOrders(allOrders);
    } finally {
      setIsLoading(false);
    }
  }, [cafeId]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const filtered = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (dateFilter && !o.created_at.startsWith(dateFilter)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!o.id.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleViewOrder = (order: EnrichedOrder) => {
    setSelectedOrder(order);
    setShowDetail(true);
  };

  const handleVoidRefund = (order: EnrichedOrder, type: 'void' | 'refund') => {
    setSelectedOrder(order);
    setVoidAction(type);
    setShowDetail(false);
    setShowVoidFlow(true);
  };

  const handleVoidSuccess = () => {
    loadOrders();
  };

  const paidTotal = orders.filter(o => o.status === 'paid').reduce((s, o) => s + o.total_amount, 0);
  const voidedCount = orders.filter(o => o.status === 'voided').length;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card shadow-sm p-4">
          <p className="text-xs text-muted-foreground mb-1">{t('total_invoices')}</p>
          <p className="text-2xl font-bold">{orders.filter(o => o.status === 'paid').length}</p>
        </div>
        <div className="rounded-xl border bg-card shadow-sm p-4">
          <p className="text-xs text-muted-foreground mb-1">{t('total_revenue')}</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(paidTotal)}</p>
        </div>
        <div className="rounded-xl border bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800 shadow-sm p-4">
          <p className="text-xs text-orange-600 dark:text-orange-400 mb-1">{t('voided_orders')}</p>
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{voidedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('search_by_order_id')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="w-44"
        />
        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all_statuses')}</SelectItem>
            <SelectItem value="paid">{t('paid')}</SelectItem>
            <SelectItem value="voided">{t('voided')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
            <RefreshCw size={18} className="animate-spin" />
            <span className="text-sm">{t('loading')}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <FileText size={40} className="text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t('no_invoices')}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('invoice_number')}</TableHead>
                <TableHead>{t('date')}</TableHead>
                <TableHead>{t('order_type')}</TableHead>
                <TableHead>{t('payment_method')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead className="text-right">{t('total')}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(order => (
                <TableRow key={order.id} className={order.status === 'voided' ? 'opacity-60' : ''}>
                  <TableCell className="font-mono text-xs">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString()}
                    <span className="ml-1 text-xs">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </TableCell>
                  <TableCell className="text-sm capitalize">
                    {order.order_type === 'dine_in' ? t('dine_in') : t('takeaway')}
                  </TableCell>
                  <TableCell className="text-sm capitalize">
                    {order.payment_method?.replace(/_/g, ' ') ?? '—'}
                  </TableCell>
                  <TableCell>
                    {order.status === 'voided' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                        <Ban size={10} /> {t('voided')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        <CheckCircle2 size={10} /> {t('paid')}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${order.status === 'voided' ? 'line-through text-muted-foreground' : ''}`}>
                    {formatCurrency(order.total_amount)}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewOrder(order)}
                      className="flex items-center gap-1.5"
                    >
                      <Eye size={13} />
                      {t('view')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modals */}
      <SalesInvoiceModal
        order={selectedOrder}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        onVoidRefund={handleVoidRefund}
      />
      <VoidRefundFlow
        order={selectedOrder}
        actionType={voidAction}
        isOpen={showVoidFlow}
        onClose={() => setShowVoidFlow(false)}
        onSuccess={handleVoidSuccess}
      />
    </div>
  );
}

// ── Supplier Invoices Tab ─────────────────────────────────────────────────────
function SupplierInvoicesTab() {
  const { t } = useTranslation();
  const cafeId = useAuthStore(s => s.cafeId());
  const { formatCurrency } = useCurrency();

  const [purchases, setPurchases] = useState<EnrichedPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState<EnrichedPurchase | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);

  useEffect(() => {
    if (!cafeId) return;
    (async () => {
      setIsLoading(true);
      try {
        const suppliers = await db.suppliers.where('cafe_id').equals(cafeId).toArray();
        const supplierMap: Record<string, Supplier> = {};
        suppliers.forEach(s => { supplierMap[s.id] = s; });

        const allPurchases = await db.purchases
          .where('cafe_id')
          .equals(cafeId)
          .reverse()
          .sortBy('created_at');

        const enriched: EnrichedPurchase[] = allPurchases.map(p => ({
          ...p,
          supplierName: supplierMap[p.supplier_id]?.name ?? t('unknown_supplier'),
        }));
        setPurchases(enriched);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [cafeId, t]);

  const handleViewPurchase = async (purchase: EnrichedPurchase) => {
    setSelectedPurchase(purchase);
    const items = await db.purchase_items.where('purchase_id').equals(purchase.id).toArray();
    setPurchaseItems(items);
    setShowDetail(true);
  };

  const filtered = purchases.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.supplierName.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
  });

  const paymentStatusColor = (status: string) => {
    if (status === 'paid') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    if (status === 'partial') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
  };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('search_by_supplier')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
            <RefreshCw size={18} className="animate-spin" />
            <span className="text-sm">{t('loading')}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Truck size={40} className="text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t('no_supplier_invoices')}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('invoice_number')}</TableHead>
                <TableHead>{t('date')}</TableHead>
                <TableHead>{t('supplier')}</TableHead>
                <TableHead>{t('payment_status')}</TableHead>
                <TableHead className="text-right">{t('total')}</TableHead>
                <TableHead className="text-right">{t('remaining')}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(purchase => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-mono text-xs">
                    #PO-{purchase.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(purchase.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm font-medium">{purchase.supplierName}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${paymentStatusColor(purchase.payment_status)}`}>
                      {t(purchase.payment_status)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(purchase.total_amount)}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${purchase.amount_remaining > 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
                    {purchase.amount_remaining > 0 ? formatCurrency(purchase.amount_remaining) : '—'}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => handleViewPurchase(purchase)} className="flex items-center gap-1.5">
                      <Eye size={13} />
                      {t('view')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Supplier Invoice Detail Modal */}
      <Dialog open={showDetail} onOpenChange={open => { if (!open) setShowDetail(false); }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck size={16} />
              {t('supplier_invoice')} #PO-{selectedPurchase?.id.slice(0, 8).toUpperCase()}
            </DialogTitle>
          </DialogHeader>
          {selectedPurchase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">{t('supplier')}:</span>
                  <span className="font-medium ml-1">{selectedPurchase.supplierName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('date')}:</span>
                  <span className="font-medium ml-1">{new Date(selectedPurchase.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('item')}</TableHead>
                    <TableHead className="text-center">{t('qty')}</TableHead>
                    <TableHead className="text-right">{t('unit_cost')}</TableHead>
                    <TableHead className="text-right">{t('subtotal')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.item_name ?? '—'}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unit_cost)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="border-t pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('total')}</span>
                  <span className="font-bold">{formatCurrency(selectedPurchase.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('amount_paid')}</span>
                  <span className="text-emerald-600">{formatCurrency(selectedPurchase.amount_paid)}</span>
                </div>
                {selectedPurchase.amount_remaining > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('remaining')}</span>
                    <span className="text-red-600 font-semibold">{formatCurrency(selectedPurchase.amount_remaining)}</span>
                  </div>
                )}
              </div>

              <Button variant="outline" onClick={() => window.print()} className="flex items-center gap-2 w-full">
                <Printer size={14} />
                {t('print')}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Main InvoicesPage ─────────────────────────────────────────────────────────
export default function InvoicesPage() {
  const { t } = useTranslation();
  const { cashierPermissions } = useSettingsStore();
  const isOwner = useAuthStore(s => s.isOwner());
  const [activeTab, setActiveTab] = useState<InvoicesTab>('sales');

  const canSeeSales = isOwner || cashierPermissions.includes('invoices_sales');
  const canSeeSupplier = isOwner || cashierPermissions.includes('invoices_supplier');

  // Default to supplier tab if cashier only has supplier access
  useEffect(() => {
    if (!canSeeSales && canSeeSupplier) setActiveTab('supplier');
  }, [canSeeSales, canSeeSupplier]);

  const tabs = [
    { id: 'sales' as const, labelKey: 'sales_invoices', icon: FileText, show: canSeeSales },
    { id: 'supplier' as const, labelKey: 'supplier_invoices', icon: Truck, show: canSeeSupplier },
  ].filter(t => t.show);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Receipt size={22} className="text-primary" />
          {t('invoices')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t('invoices_desc')}</p>
      </div>

      {/* Tab switcher */}
      {tabs.length > 1 && (
        <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon size={15} />
                {t(tab.labelKey)}
              </button>
            );
          })}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'sales' && canSeeSales && <SalesInvoicesTab />}
      {activeTab === 'supplier' && canSeeSupplier && <SupplierInvoicesTab />}
    </div>
  );
}
