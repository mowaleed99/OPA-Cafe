import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../application/store/useAuthStore';
import { useCurrency } from '../../../application/utils/useCurrency';
import { getSupplierInvoicesData, type PurchaseWithDetails } from '../../../application/useCases/orders/getInvoices';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Truck,
  Search,
  Eye,
  Printer,
  RefreshCw,
} from 'lucide-react';

export function SupplierInvoicesTable() {
  const { t } = useTranslation();
  const cafeId = useAuthStore(s => s.cafeId());
  const { formatCurrency } = useCurrency();

  const [purchases, setPurchases] = useState<PurchaseWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseWithDetails | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (!cafeId) return;
    (async () => {
      setIsLoading(true);
      try {
        const enriched = await getSupplierInvoicesData(cafeId);
        enriched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setPurchases(enriched);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [cafeId]);

  const handleViewPurchase = (purchase: PurchaseWithDetails) => {
    setSelectedPurchase(purchase);
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
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('search_by_supplier')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="ps-9"
          />
        </div>
      </div>

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
                  <span className="font-medium ms-1">{selectedPurchase.supplierName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('date')}:</span>
                  <span className="font-medium ms-1">{new Date(selectedPurchase.created_at).toLocaleDateString()}</span>
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
                  {selectedPurchase.items.map(item => (
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
