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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { PlusCircle, Banknote, ChevronRight, X } from 'lucide-react';
import type { Supplier, Purchase, PurchaseItem, SupplierPayment } from '../../core/entities/supplier';
import type { Product } from '../../core/entities/product';
import { useAuthStore } from '../../application/store/useAuthStore';
import { getSuppliers } from '../../application/useCases/suppliers/manageSuppliers';
import {
  getPurchases,
  getPurchaseDetails,
  createPurchase,
  recordPayment,
  type CreatePurchaseParams,
} from '../../application/useCases/suppliers/managePurchases';
import { db } from '../../infrastructure/database/db';

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Purchase['payment_status'] }) {
  const colors: Record<typeof status, string> = {
    paid: 'bg-green-100 text-green-700',
    partial: 'bg-yellow-100 text-yellow-700',
    unpaid: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ── Create Purchase Modal ─────────────────────────────────────────────────────
interface PurchaseLineItem {
  productId: string;
  quantity: string;
  unitCost: string;
}

function CreatePurchaseModal({
  isOpen,
  onClose,
  suppliers,
  products,
  cafeId,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  products: Product[];
  cafeId: string;
  onCreated: () => void;
}) {
  const [supplierId, setSupplierId] = useState('');
  const [lines, setLines] = useState<PurchaseLineItem[]>([
    { productId: '', quantity: '', unitCost: '' },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) { setSupplierId(''); setLines([{ productId: '', quantity: '', unitCost: '' }]); }
  }, [isOpen]);

  const addLine = () => setLines(l => [...l, { productId: '', quantity: '', unitCost: '' }]);
  const removeLine = (i: number) => setLines(l => l.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: keyof PurchaseLineItem, value: string) =>
    setLines(l => l.map((line, idx) => idx === i ? { ...line, [field]: value } : line));

  const total = lines.reduce((sum, l) => {
    const qty = parseFloat(l.quantity) || 0;
    const cost = parseFloat(l.unitCost) || 0;
    return sum + qty * cost;
  }, 0);

  const canSave = supplierId && lines.every(l => l.productId && l.quantity && l.unitCost);

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const params: CreatePurchaseParams = {
        cafeId,
        supplierId,
        items: lines.map(l => ({
          productId: l.productId,
          quantity: parseFloat(l.quantity),
          unitCost: parseFloat(l.unitCost),
        })),
      };
      await createPurchase(params);
      onCreated();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Purchase Order</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Supplier */}
          <div>
            <label className="text-sm font-medium mb-1 block">Supplier</label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
              <SelectContent>
                {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Line Items */}
          <div>
            <label className="text-sm font-medium mb-2 block">Items</label>
            <div className="space-y-2">
              {lines.map((line, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div className="flex-1">
                    <Select value={line.productId} onValueChange={v => updateLine(i, 'productId', v)}>
                      <SelectTrigger><SelectValue placeholder="Product" /></SelectTrigger>
                      <SelectContent>
                        {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    type="number"
                    className="w-24"
                    placeholder="Qty"
                    value={line.quantity}
                    onChange={e => updateLine(i, 'quantity', e.target.value)}
                  />
                  <Input
                    type="number"
                    className="w-28"
                    placeholder="Unit cost"
                    value={line.unitCost}
                    onChange={e => updateLine(i, 'unitCost', e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLine(i)}
                    disabled={lines.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-2" onClick={addLine}>
              <PlusCircle className="h-3.5 w-3.5 mr-1" /> Add Item
            </Button>
          </div>

          {/* Total */}
          <div className="flex justify-end">
            <span className="text-sm font-semibold">Total: ${total.toFixed(2)}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !canSave}>Create Purchase</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Record Payment Modal ──────────────────────────────────────────────────────
function RecordPaymentModal({
  purchase,
  onClose,
  onPaid,
}: {
  purchase: Purchase | null;
  onClose: () => void;
  onPaid: () => void;
}) {
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
      onPaid();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!purchase} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-md bg-muted/50 px-4 py-3 text-sm space-y-1">
            <div className="flex justify-between"><span>Total Amount</span><span>${purchase?.total_amount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Already Paid</span><span>${purchase?.amount_paid.toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold"><span>Remaining</span><span>${maxAmount.toFixed(2)}</span></div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Payment Amount</label>
            <Input
              type="number"
              step="0.01"
              max={maxAmount}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder={`Max $${maxAmount.toFixed(2)}`}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Notes (Optional)</label>
            <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Paid via bank transfer" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={saving || !amount || parseFloat(amount) <= 0}
          >
            Record Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Purchase Detail Panel ─────────────────────────────────────────────────────
function PurchaseDetailPanel({
  purchaseId,
  products,
  supplierName,
  onClose,
}: {
  purchaseId: string | null;
  products: Record<string, string>;
  supplierName: string;
  onClose: () => void;
}) {
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
          <h2 className="font-semibold">Purchase Details</h2>
          <p className="text-sm text-muted-foreground">{supplierName} · {detail.purchase.created_at.split('T')[0]}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Summary */}
        <div className="rounded-md border p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <StatusBadge status={detail.purchase.payment_status} />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="font-medium">${detail.purchase.total_amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Paid</span>
            <span className="font-medium text-green-600">${detail.purchase.amount_paid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Remaining</span>
            <span className="font-medium text-red-600">${detail.purchase.amount_remaining.toFixed(2)}</span>
          </div>
        </div>

        {/* Items */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Items</h3>
          <div className="divide-y border rounded-md">
            {detail.items.map(item => (
              <div key={item.id} className="flex justify-between px-3 py-2 text-sm">
                <span>{products[item.product_id] || 'Unknown'}</span>
                <span className="text-muted-foreground">
                  {item.quantity} × ${item.unit_cost.toFixed(2)}
                </span>
                <span className="font-medium">${item.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment History */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Payments</h3>
          {detail.payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
          ) : (
            <div className="divide-y border rounded-md">
              {detail.payments.map(p => (
                <div key={p.id} className="flex justify-between px-3 py-2 text-sm">
                  <span className="text-muted-foreground">{p.payment_date}</span>
                  <span>{p.notes || '—'}</span>
                  <span className="font-medium text-green-600">+${p.amount.toFixed(2)}</span>
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
  const cafeId = useAuthStore(s => s.cafeId());
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productMap, setProductMap] = useState<Record<string, string>>({});
  const [supplierMap, setSupplierMap] = useState<Record<string, string>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [payingPurchase, setPayingPurchase] = useState<Purchase | null>(null);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);

  const load = async () => {
    if (!cafeId) return;
    const [allPurchases, allSuppliers, allProducts] = await Promise.all([
      getPurchases(cafeId),
      getSuppliers(cafeId),
      db.products.where('cafe_id').equals(cafeId).filter(p => p.status !== 'inactive').toArray(),
    ]);
    setPurchases(allPurchases);
    setSuppliers(allSuppliers);
    setProducts(allProducts);
    const sm: Record<string, string> = {};
    allSuppliers.forEach(s => sm[s.id] = s.name);
    setSupplierMap(sm);
    const pm: Record<string, string> = {};
    allProducts.forEach(p => pm[p.id] = p.name);
    setProductMap(pm);
  };

  useEffect(() => { load(); }, [cafeId]);

  const selectedSupplierName = selectedPurchaseId
    ? supplierMap[purchases.find(p => p.id === selectedPurchaseId)?.supplier_id ?? ''] ?? 'Supplier'
    : '';

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Purchases</h1>
          <p className="text-muted-foreground mt-1">Track supplier purchases and outstanding payments.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Purchase
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Remaining</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[130px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No purchases yet. Click "New Purchase" to record one.
                </TableCell>
              </TableRow>
            ) : (
              purchases.map(p => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => setSelectedPurchaseId(p.id === selectedPurchaseId ? null : p.id)}
                >
                  <TableCell className="text-sm">{p.created_at.split('T')[0]}</TableCell>
                  <TableCell className="font-medium">{supplierMap[p.supplier_id] || '—'}</TableCell>
                  <TableCell className="text-right">${p.total_amount.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-red-600">${p.amount_remaining.toFixed(2)}</TableCell>
                  <TableCell><StatusBadge status={p.payment_status} /></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {p.payment_status !== 'paid' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={e => { e.stopPropagation(); setPayingPurchase(p); }}
                        >
                          <Banknote className="h-3.5 w-3.5 mr-1" /> Pay
                        </Button>
                      )}
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

      {/* Modals */}
      <CreatePurchaseModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        suppliers={suppliers}
        products={products}
        cafeId={cafeId ?? ''}
        onCreated={load}
      />

      <RecordPaymentModal
        purchase={payingPurchase}
        onClose={() => setPayingPurchase(null)}
        onPaid={load}
      />

      {/* Side Panel */}
      <PurchaseDetailPanel
        purchaseId={selectedPurchaseId}
        products={productMap}
        supplierName={selectedSupplierName}
        onClose={() => setSelectedPurchaseId(null)}
      />
    </div>
  );
}
