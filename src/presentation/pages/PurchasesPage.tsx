import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { PlusCircle, ChevronRight, X, Search, ChevronLeft, ShoppingBag, Loader2, Package, Trash2 } from 'lucide-react';
import type { Supplier, Purchase, PurchaseItem, SupplierPayment } from '../../domain/entities/supplier';
import type { InventoryItem } from '../../domain/entities/inventory';
import { useAuthStore } from '../../application/store/useAuthStore';
import { getSuppliers } from '../../application/useCases/suppliers/manageSuppliers';
import {
  getPurchases,
  getPurchaseDetails,
  createPurchase,
  type CreatePurchaseParams,
} from '../../application/useCases/suppliers/managePurchases';
import { getInventoryItems } from '../../application/useCases/inventory/manageInventory';
import { useCurrency } from '../../application/utils/useCurrency';
import { useToast } from '../hooks/useToast';

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Purchase['payment_status'] }) {
  const { t } = useTranslation();
  const configs: Record<typeof status, { bg: string; text: string; label: string }> = {
    paid:    { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', label: t('status_paid') },
    partial: { bg: 'bg-amber-100 dark:bg-amber-500/20',   text: 'text-amber-700 dark:text-amber-400',   label: t('status_partial') },
    unpaid:  { bg: 'bg-red-100 dark:bg-red-500/20',       text: 'text-red-700 dark:text-red-400',       label: t('status_unpaid') },
  };
  const c = configs[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

// ── Create Purchase Modal ─────────────────────────────────────────────────────
interface PurchaseLineItem {
  inventoryItemId: string;
  quantity: string;
  unitCost: string;
  isCountable: boolean;
  cartons: string;
  piecesPerCarton: string;
  loosePieces: string;
}

function CreatePurchaseModal({
  isOpen,
  onClose,
  suppliers,
  inventoryItems,
  cafeId,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  inventoryItems: InventoryItem[];
  cafeId: string;
  onCreated: () => void;
}) {
  const { t } = useTranslation();
  const { currency, formatCurrency } = useCurrency();
  const [supplierId, setSupplierId] = useState('');
  const [lines, setLines] = useState<PurchaseLineItem[]>([
    { inventoryItemId: '', quantity: '', unitCost: '', isCountable: false, cartons: '0', piecesPerCarton: '1', loosePieces: '0' },
  ]);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setSupplierId('');
      setLines([{ inventoryItemId: '', quantity: '', unitCost: '', isCountable: false, cartons: '0', piecesPerCarton: '1', loosePieces: '0' }]);
    }
  }, [isOpen]);

  const addLine = () => setLines(l => [...l, { inventoryItemId: '', quantity: '', unitCost: '', isCountable: false, cartons: '0', piecesPerCarton: '1', loosePieces: '0' }]);
  const removeLine = (i: number) => setLines(l => l.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: keyof PurchaseLineItem, value: string | boolean) => {
    setLines(l => l.map((line, idx) => {
      if (idx !== i) return line;
      const newLine = { ...line, [field]: value };
      
      if (field === 'inventoryItemId') {
        const item = inventoryItems.find(it => it.id === value);
        if (item) {
          newLine.isCountable = item.is_countable;
          if (item.is_countable) {
            newLine.piecesPerCarton = (item.pieces_per_carton || 1).toString();
            newLine.cartons = '0';
            newLine.loosePieces = '0';
          } else {
             newLine.quantity = '';
          }
        }
      }
      return newLine;
    }));
  };

  const getFinalQuantity = (l: PurchaseLineItem) => {
    if (l.isCountable) {
      const c = parseInt(l.cartons) || 0;
      const ppc = parseInt(l.piecesPerCarton) || 0;
      const lp = parseInt(l.loosePieces) || 0;
      return (c * ppc) + lp;
    }
    return parseFloat(l.quantity) || 0;
  };

  const total = lines.reduce((sum, l) => {
    return sum + getFinalQuantity(l) * (parseFloat(l.unitCost) || 0);
  }, 0);

  const canSave = supplierId && lines.every(l => l.inventoryItemId && getFinalQuantity(l) > 0 && l.unitCost);

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const params: CreatePurchaseParams = {
        cafeId,
        supplierId,
        items: lines.map(l => ({
          inventoryItemId: l.inventoryItemId,
          itemName: inventoryItems.find(p => p.id === l.inventoryItemId)?.name || '',
          quantity: getFinalQuantity(l),
          unitCost: parseFloat(l.unitCost) || 0,
        })),
      };
      await createPurchase(params);
      onCreated();
      onClose();
    } catch (err: any) {
      addToast(err.message || 'Failed to create purchase', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 overflow-hidden gap-0">
        {/* Modal Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--brand-latte)]/15 flex items-center justify-center shrink-0">
              <ShoppingBag size={20} className="text-[var(--brand-latte)]" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">{t('new_purchase')}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">{t('track_purchases_desc')}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[65vh]">
          {/* Supplier */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">{t('supplier')}</label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder={t('select_supplier')}>
                  {suppliers.find(s => s.id === supplierId)?.name || t('select_supplier')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {suppliers.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground">{t('items')}</label>
              <span className="text-xs text-muted-foreground">{lines.length} {lines.length === 1 ? 'item' : 'items'}</span>
            </div>

            <div className="space-y-4">
              {lines.map((line, i) => (
                <div key={i} className="flex flex-col gap-3 p-3 rounded-xl border bg-muted/20 hover:bg-muted/30 transition-colors">
                  <div className="flex gap-2 items-start">
                    <div className="flex-1 min-w-0">
                      <Select value={line.inventoryItemId} onValueChange={v => updateLine(i, 'inventoryItemId', v)}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder={t('item_name')}>
                            {inventoryItems.find(p => p.id === line.inventoryItemId)?.name || t('item_name')}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryItems.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      type="number"
                      className="w-24 h-9 text-sm text-center"
                      placeholder={t('unit_cost')}
                      value={line.unitCost}
                      onChange={e => updateLine(i, 'unitCost', e.target.value)}
                      min="0"
                    />
                    <button
                      onClick={() => removeLine(i)}
                      disabled={lines.length === 1}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  {line.inventoryItemId && line.isCountable ? (
                    <div className="flex gap-2 items-center pl-2 flex-wrap">
                       <Input type="number" className="w-24 h-9" placeholder={t('cartons')} value={line.cartons} onChange={e => updateLine(i, 'cartons', e.target.value)} min="0" title={t('cartons')} />
                       <span className="text-muted-foreground text-sm">×</span>
                       <Input type="number" className="w-28 h-9" placeholder={t('pcs_per_carton')} value={line.piecesPerCarton} onChange={e => updateLine(i, 'piecesPerCarton', e.target.value)} min="1" title={t('pcs_per_carton')} />
                       <span className="text-muted-foreground text-sm">+</span>
                       <Input type="number" className="w-24 h-9" placeholder={t('loose_pcs')} value={line.loosePieces} onChange={e => updateLine(i, 'loosePieces', e.target.value)} min="0" title={t('loose_pcs')} />
                       <span className="text-sm font-medium ml-2">= {getFinalQuantity(line)} {t('pcs')}</span>
                    </div>
                  ) : line.inventoryItemId ? (
                    <div className="flex gap-2 items-center pl-2">
                      <Input
                        type="number"
                        className="w-32 h-9 text-sm"
                        placeholder={t('qty')}
                        value={line.quantity}
                        onChange={e => updateLine(i, 'quantity', e.target.value)}
                        min="0"
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <button
              onClick={addLine}
              className="flex items-center gap-2 text-sm font-medium text-[var(--brand-latte)] hover:text-[var(--brand-latte)]/80 transition-colors py-1"
            >
              <PlusCircle size={16} />
              {t('add_item')}
            </button>
          </div>

          {/* Total */}
          {total > 0 && (
            <div className="rounded-xl bg-[var(--brand-latte)]/8 border border-[var(--brand-latte)]/20 px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{t('total')}</span>
              <span className="text-lg font-bold" style={{ color: 'var(--brand-latte)' }}>
                {formatCurrency(total)}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-3 border-t bg-muted/20 flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={saving} className="min-w-[90px]">
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !canSave}
            className="min-w-[140px] bg-[var(--brand-latte)] hover:bg-[var(--brand-latte)]/90 text-white"
          >
            {saving ? (
              <><Loader2 size={15} className="animate-spin me-2" />{t('saving')}</>
            ) : (
              <><ShoppingBag size={15} className="me-2" />{t('create_purchase')}</>
            )}
          </Button>
        </div>
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
    <div className="fixed inset-y-0 end-0 w-[420px] bg-background border-s shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div>
          <h2 className="font-semibold text-foreground">{t('purchase_details')}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{supplierName} · {detail.purchase.created_at.split('T')[0]}</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border bg-card p-3 space-y-1">
            <p className="text-xs text-muted-foreground">{t('total')}</p>
            <p className="text-lg font-bold text-foreground">{detail.purchase.total_amount.toFixed(2)} <span className="text-xs font-normal">{currency}</span></p>
          </div>
          <div className="rounded-xl border bg-card p-3 space-y-1">
            <p className="text-xs text-muted-foreground">{t('status')}</p>
            <StatusBadge status={detail.purchase.payment_status} />
          </div>
          <div className="rounded-xl border bg-emerald-50 dark:bg-emerald-500/10 p-3 space-y-1">
            <p className="text-xs text-emerald-600 dark:text-emerald-400">{t('paid')}</p>
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{detail.purchase.amount_paid.toFixed(2)} <span className="text-xs font-normal">{currency}</span></p>
          </div>
          <div className="rounded-xl border bg-red-50 dark:bg-red-500/10 p-3 space-y-1">
            <p className="text-xs text-red-600 dark:text-red-400">{t('remaining')}</p>
            <p className="text-lg font-bold text-red-700 dark:text-red-400">{detail.purchase.amount_remaining.toFixed(2)} <span className="text-xs font-normal">{currency}</span></p>
          </div>
        </div>

        {/* Items */}
        <div>
          <h3 className="text-sm font-semibold mb-2 text-foreground">{t('items')}</h3>
          <div className="divide-y border rounded-xl overflow-hidden bg-card">
            {detail.items.map(item => (
              <div key={item.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <div className="flex items-center gap-2">
                  <Package size={14} className="text-muted-foreground shrink-0" />
                  <span className="font-medium">{item.item_name || inventoryItems[item.inventory_item_id] || 'Unknown'}</span>
                </div>
                <div className="text-end">
                  <p className="text-muted-foreground text-xs">{item.quantity} × {formatCurrency(item.unit_cost)}</p>
                  <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment History */}
        <div>
          <h3 className="text-sm font-semibold mb-2 text-foreground">{t('payments')}</h3>
          {detail.payments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-3 text-center border rounded-xl bg-muted/30">{t('no_payments_yet')}</p>
          ) : (
            <div className="divide-y border rounded-xl overflow-hidden bg-card">
              {detail.payments.map(p => (
                <div key={p.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">{p.date}</p>
                    <p className="text-foreground">{p.notes || '—'}</p>
                  </div>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">+{formatCurrency(p.amount)}</span>
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
export default function PurchasesPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const cafeId = useAuthStore(s => s.cafeId());
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryItemMap, setInventoryItemMap] = useState<Record<string, string>>({});
  const [supplierMap, setSupplierMap] = useState<Record<string, string>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const load = async () => {
    if (!cafeId) return;
    const [allPurchases, allSuppliers, allInventory] = await Promise.all([
      getPurchases(cafeId),
      getSuppliers(cafeId),
      getInventoryItems(cafeId),
    ]);
    setPurchases(allPurchases);
    setSuppliers(allSuppliers);
    setInventoryItems(allInventory);
    const sm: Record<string, string> = {};
    allSuppliers.forEach(s => sm[s.id] = s.name);
    setSupplierMap(sm);
    const im: Record<string, string> = {};
    allInventory.forEach(p => im[p.id] = p.name);
    setInventoryItemMap(im);
  };

  useEffect(() => { load(); }, [cafeId]);

  const selectedSupplierName = selectedPurchaseId
    ? supplierMap[purchases.find(p => p.id === selectedPurchaseId)?.supplier_id ?? ''] ?? ''
    : '';

  const filtered = purchases.filter(p =>
    (supplierMap[p.supplier_id] || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t('purchases')}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t('track_purchases_desc')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('search_by_supplier')}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 ps-9 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-[var(--brand-latte)] hover:bg-[var(--brand-latte)]/90 text-white"
          >
            <PlusCircle className="me-2 h-4 w-4" /> {t('new_purchase')}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-semibold">{t('date')}</TableHead>
              <TableHead className="font-semibold">{t('supplier')}</TableHead>
              <TableHead className="text-end font-semibold">{t('total_amount')}</TableHead>
              <TableHead className="text-end font-semibold">{t('remaining')}</TableHead>
              <TableHead className="font-semibold">{t('status')}</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <ShoppingBag size={36} className="opacity-30" />
                    <p className="text-sm">{searchQuery ? t('no_purchases_search') : t('no_purchases_yet')}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map(p => (
                <TableRow
                  key={p.id}
                  className={`cursor-pointer transition-colors ${selectedPurchaseId === p.id ? 'bg-[var(--brand-latte)]/5' : 'hover:bg-muted/30'}`}
                  onClick={() => setSelectedPurchaseId(p.id === selectedPurchaseId ? null : p.id)}
                >
                  <TableCell className="text-sm text-muted-foreground">{p.created_at.split('T')[0]}</TableCell>
                  <TableCell className="font-medium">{supplierMap[p.supplier_id] || '—'}</TableCell>
                  <TableCell className="text-end font-medium">{formatCurrency(p.total_amount)}</TableCell>
                  <TableCell className="text-end font-semibold text-red-600 dark:text-red-400">{formatCurrency(p.amount_remaining)}</TableCell>
                  <TableCell><StatusBadge status={p.payment_status} /></TableCell>
                  <TableCell>
                    <button
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      onClick={e => { e.stopPropagation(); setSelectedPurchaseId(p.id); }}
                    >
                      <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-sm text-muted-foreground">
            {t('page')} {currentPage} / {totalPages} ({filtered.length} {t('results')})
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <CreatePurchaseModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        suppliers={suppliers}
        inventoryItems={inventoryItems}
        cafeId={cafeId ?? ''}
        onCreated={load}
      />

      {/* Side Panel */}
      <PurchaseDetailPanel
        purchaseId={selectedPurchaseId}
        inventoryItems={inventoryItemMap}
        supplierName={selectedSupplierName}
        onClose={() => setSelectedPurchaseId(null)}
      />
    </div>
  );
}
