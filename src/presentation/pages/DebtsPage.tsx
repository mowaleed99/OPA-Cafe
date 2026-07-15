import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Banknote, ChevronRight, X, Search } from 'lucide-react';
import type { Supplier, Purchase, PurchaseItem, SupplierPayment } from '../../domain/entities/supplier';
import type { InventoryItem } from '../../domain/entities/inventory';
import { useAuthStore } from '../../application/store/useAuthStore';
import { getSuppliers } from '../../application/useCases/suppliers/manageSuppliers';
import {
  getPurchases,
  getPurchaseDetails,
  recordPayment,
} from '../../application/useCases/suppliers/managePurchases';
import { getInventoryItems } from '../../application/useCases/inventory/manageInventory';
import { useCurrency } from '../../application/utils/useCurrency';

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Purchase['payment_status'] }) {
  const colors: Record<typeof status, string> = {
    paid: 'bg-green-100 text-green-700',
    partial: 'bg-yellow-100 text-yellow-700',
    unpaid: 'bg-red-100 text-red-700',
  };
  const { t } = useTranslation();
  const labels: Record<typeof status, string> = {
    paid: t('status_paid'),
    partial: t('status_partial'),
    unpaid: t('status_unpaid'),
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
      {labels[status]}
    </span>
  );
}

// ── Record Payment Modal ──────────────────────────────────────────────────────
function RecordPaymentModal({
  isOpen,
  onClose,
  purchase,
  onPaymentRecorded,
}: {
  isOpen: boolean;
  onClose: () => void;
  purchase: Purchase | null;
  onPaymentRecorded: () => void;
}) {
  const { t } = useTranslation();
  const { currency, formatCurrency } = useCurrency();
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { setAmount(''); setNotes(''); }, [purchase]);

  const maxAmount = purchase?.amount_remaining ?? 0;

  const handleSave = async () => {
    if (!purchase || !amount) return;
    setSaving(true);
    try {
      await recordPayment(purchase, parseFloat(amount), notes);
      onPaymentRecorded();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('record_payment')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-md bg-muted/50 px-4 py-3 text-sm space-y-1">
            <div className="flex justify-between"><span>{t('total_amount')}</span><span>{formatCurrency(purchase?.total_amount)}</span></div>
            <div className="flex justify-between"><span>{t('already_paid')}</span><span>{formatCurrency(purchase?.amount_paid)}</span></div>
            <div className="flex justify-between font-semibold"><span>{t('remaining')}</span><span>{formatCurrency(maxAmount)}</span></div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('payment_amount')}</label>
            <Input
              type="number"
              step="0.01"
              max={maxAmount}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder={`Max ${formatCurrency(maxAmount)}`}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('notes_optional')}</label>
            <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder={t('notes_placeholder')} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>{t('cancel')}</Button>
          <Button onClick={handleSave} disabled={saving || !amount || parseFloat(amount) <= 0}>
            {t('record_payment')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Purchase Detail Panel ─────────────────────────────────────────────────────
function PurchaseDetailPanel({
  purchaseId,
  inventoryItems,
  supplierName,
  onClose,
}: {
  purchaseId: string | null;
  inventoryItems: Record<string, string>;
  supplierName: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { currency, formatCurrency } = useCurrency();
  const [detail, setDetail] = useState<{
    purchase: Purchase;
    items: PurchaseItem[];
    payments: SupplierPayment[];
  } | null>(null);

  useEffect(() => {
    if (!purchaseId) { setDetail(null); return; }
    getPurchaseDetails(purchaseId).then(d => setDetail(d));
  }, [purchaseId]);

  if (!purchaseId || !detail) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-background border-l shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="font-semibold">{t('purchase_details')}</h2>
          <p className="text-sm text-muted-foreground">{supplierName} · {detail.purchase.created_at.split('T')[0]}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Summary */}
        <div className="rounded-md border p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('status')}</span>
            <StatusBadge status={detail.purchase.payment_status} />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('total')}</span>
            <span className="font-medium">{formatCurrency(detail.purchase.total_amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('paid')}</span>
            <span className="font-medium text-green-600">{formatCurrency(detail.purchase.amount_paid)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('remaining')}</span>
            <span className="font-medium text-red-600">{formatCurrency(detail.purchase.amount_remaining)}</span>
          </div>
        </div>

        {/* Items */}
        <div>
          <h3 className="text-sm font-semibold mb-2">{t('items')}</h3>
          <div className="divide-y border rounded-md">
            {detail.items.map(item => (
              <div key={item.id} className="flex justify-between px-3 py-2 text-sm">
                <span>{inventoryItems[item.inventory_item_id] || 'Unknown'}</span>
                <span className="text-muted-foreground">
                  {item.quantity} × {formatCurrency(item.unit_cost)}
                </span>
                <span className="font-medium">{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment History */}
        <div>
          <h3 className="text-sm font-semibold mb-2">{t('payments')}</h3>
          {detail.payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('no_payments_yet')}</p>
          ) : (
            <div className="divide-y border rounded-md">
              {detail.payments.map(p => (
                <div key={p.id} className="flex justify-between px-3 py-2 text-sm">
                  <span className="text-muted-foreground">{p.date}</span>
                  <span>{p.notes || '—'}</span>
                  <span className="font-medium text-green-600">+{formatCurrency(p.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DebtsPage() {
  const { t } = useTranslation();
  const { currency, formatCurrency } = useCurrency();
  const cafeId = useAuthStore(s => s.cafeId());
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [supplierMap, setSupplierMap] = useState<Record<string, string>>({});
  const [inventoryItemMap, setInventoryItemMap] = useState<Record<string, string>>({});
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [payingPurchase, setPayingPurchase] = useState<Purchase | null>(null);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const load = async () => {
    if (!cafeId) return;
    const [allPurchases, allSuppliers, allInventory] = await Promise.all([
      getPurchases(cafeId),
      getSuppliers(cafeId),
      getInventoryItems(cafeId),
    ]);
    // Only show unpaid / partial
    setPurchases(allPurchases.filter(p => p.payment_status !== 'paid'));
    const sm: Record<string, string> = {};
    allSuppliers.forEach(s => sm[s.id] = s.name);
    setSupplierMap(sm);
    const im: Record<string, string> = {};
    allInventory.forEach(i => im[i.id] = i.name);
    setInventoryItemMap(im);
  };

  useEffect(() => { load(); }, [cafeId]);

  const selectedSupplierName = selectedPurchaseId
    ? supplierMap[purchases.find(p => p.id === selectedPurchaseId)?.supplier_id ?? ''] ?? ''
    : '';

  const filtered = purchases.filter(p =>
    (supplierMap[p.supplier_id] || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Totals summary
  const totalOutstanding = filtered.reduce((sum, p) => sum + p.amount_remaining, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t('debts')}</h1>
          <p className="text-muted-foreground mt-1">{t('debts_desc')}</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('search_by_supplier')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Summary Card */}
      {filtered.length > 0 && (
        <div className="rounded-xl border bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-400">{t('total_outstanding')}</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-400">{formatCurrency(totalOutstanding)}</p>
          </div>
          <Banknote className="h-10 w-10 text-red-300" />
        </div>
      )}

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('date')}</TableHead>
              <TableHead>{t('supplier')}</TableHead>
              <TableHead className="text-right">{t('total_amount')}</TableHead>
              <TableHead className="text-right">{t('already_paid')}</TableHead>
              <TableHead className="text-right">{t('remaining')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead className="w-[130px]">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  {searchQuery ? t('no_debts_search') : t('no_debts')}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(p => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => setSelectedPurchaseId(p.id === selectedPurchaseId ? null : p.id)}
                >
                  <TableCell className="text-sm">{p.created_at.split('T')[0]}</TableCell>
                  <TableCell className="font-medium">{supplierMap[p.supplier_id] || '—'}</TableCell>
                  <TableCell className="text-right">{formatCurrency(p.total_amount)}</TableCell>
                  <TableCell className="text-right text-green-600">{formatCurrency(p.amount_paid)}</TableCell>
                  <TableCell className="text-right text-red-600 font-semibold">{formatCurrency(p.amount_remaining)}</TableCell>
                  <TableCell><StatusBadge status={p.payment_status} /></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={e => { e.stopPropagation(); setPayingPurchase(p); setPaymentOpen(true); }}
                      >
                        <Banknote className="h-3.5 w-3.5 mr-1" /> {t('pay')}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); setSelectedPurchaseId(p.id); }}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={paymentOpen}
        purchase={payingPurchase}
        onClose={() => { setPaymentOpen(false); setPayingPurchase(null); }}
        onPaymentRecorded={load}
      />

      {/* Side Detail Panel */}
      <PurchaseDetailPanel
        purchaseId={selectedPurchaseId}
        inventoryItems={inventoryItemMap}
        supplierName={selectedSupplierName}
        onClose={() => setSelectedPurchaseId(null)}
      />
    </div>
  );
}
