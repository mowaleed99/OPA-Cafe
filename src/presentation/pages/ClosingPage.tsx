import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { CalendarDays, TrendingUp, ShoppingBag, Loader2, CheckCircle2, Download, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../application/store/useSettingsStore';
import { useAuthStore } from '../../application/store/useAuthStore';
import {
  closingDay,
  getDailyClosings,
  getDailyClosingItems,
  getTodayClosing,
  type ClosingReport,
} from '../../application/useCases/closing/dailyClosing';
import type { DailyClosing } from '../../core/entities/daily_closing';
import type { Product } from '../../core/entities/product';
import { db } from '../../infrastructure/database/db';
import html2pdf from 'html2pdf.js';

export default function ClosingPage() {
  const cafeId = useAuthStore(s => s.cafeId());
  const { t } = useTranslation();
  const [closings, setClosings] = useState<DailyClosing[]>([]);
  const [alreadyClosed, setAlreadyClosed] = useState(false);
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [report, setReport] = useState<ClosingReport | null>(null);
  const [products, setProducts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!cafeId) return;
    const today = new Date().toISOString().split('T')[0];
    const [allClosings, todayClosing, prods, todayOrdersCount] = await Promise.all([
      getDailyClosings(cafeId),
      getTodayClosing(cafeId),
      db.products.where('cafe_id').equals(cafeId).toArray(),
      db.orders.where('cafe_id').equals(cafeId).filter(o => o.status === 'paid' && o.created_at.startsWith(today)).count(),
    ]);
    setClosings(allClosings);
    setAlreadyClosed(!!todayClosing);
    setNeedsUpdate(!!todayClosing && todayClosing.total_orders !== todayOrdersCount);
    
    const prodMap: Record<string, string> = {};
    prods.forEach(p => prodMap[p.id] = p.name);
    setProducts(prodMap);
  };

  useEffect(() => { load(); }, [cafeId]);

  const handleCloseDay = async () => {
    if (!cafeId) return;
    setIsClosing(true);
    setError(null);
    try {
      const result = await closingDay(cafeId);
      setReport(result);
      setAlreadyClosed(true);
      setNeedsUpdate(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close day.');
    } finally {
      setIsClosing(false);
    }
  };

  const viewReport = async (closing: DailyClosing) => {
    const items = await getDailyClosingItems(closing.id);
    setReport({ closing, items });
  };

  const exportToCSV = () => {
    if (!report) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Daily Closing Report - " + report.closing.closing_date + "\n\n";
    csvContent += `${t('total_orders')},${report.closing.total_orders}\n`;
    csvContent += `${t('total_sales')},${report.closing.total_sales.toFixed(2)} EGP\n`;
    const avgOrder = report.closing.total_orders > 0 ? (report.closing.total_sales / report.closing.total_orders).toFixed(2) : '0.00';
    csvContent += `${t('avg_order')},${avgOrder} EGP\n\n`;
    
    csvContent += `${t('product')},${t('qty_sold')},${t('revenue')}\n`;
    
    report.items.forEach(item => {
      const productName = products[item.product_id] || item.product_id;
      const safeName = `"${productName.replace(/"/g, '""')}"`;
      csvContent += `${safeName},${item.quantity_sold},"${item.total_revenue.toFixed(2)} EGP"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `closing-report-${report.closing.closing_date}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const exportToPDF = () => {
    if (!report) return;
    
    const element = document.getElementById('closing-report-content');
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `closing-report-${report.closing.closing_date}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t('closing')}</h1>
        </div>
        <div className="flex items-center gap-3">
          {alreadyClosed && !needsUpdate ? (
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <CheckCircle2 className="h-5 w-5" />
              <span>{t('today_is_closed')}</span>
            </div>
          ) : (
            <Button onClick={handleCloseDay} disabled={isClosing} size="lg" className="gap-2">
              {isClosing && <Loader2 className="h-4 w-4 animate-spin" />}
              <CalendarDays className="h-4 w-4" />
              {needsUpdate ? t('update_closing') || 'Update Closing' : t('close_today')} ({today})
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Closing Report Card */}
      {report && (
        <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t('report')} — {report.closing.closing_date}</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2">
                <Download className="h-4 w-4" /> {t('export_csv')}
              </Button>
              <Button variant="outline" size="sm" onClick={exportToPDF} className="gap-2">
                <FileText className="h-4 w-4" /> {t('export_pdf')}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setReport(null)}>{t('close')}</Button>
            </div>
          </div>

          <div id="closing-report-content" className="p-4 bg-background">
            {/* Added for PDF clarity */}
            <h3 className="text-xl font-bold mb-4 hidden print:block">{t('report')} — {report.closing.closing_date}</h3>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <ShoppingBag className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-2xl font-bold">{report.closing.total_orders}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('total_orders')}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-2xl font-bold">{report.closing.total_sales.toFixed(2)} <span className="text-sm font-normal">EGP</span></p>
                <p className="text-xs text-muted-foreground mt-1">{t('total_sales')}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-2xl font-bold">
                  {report.closing.total_orders > 0
                    ? (report.closing.total_sales / report.closing.total_orders).toFixed(2)
                    : '0.00'} <span className="text-sm font-normal">EGP</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">{t('avg_order')}</p>
              </div>
          </div>

            {report.items.length > 0 && (
              <div className="border rounded-md mt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('product')}</TableHead>
                      <TableHead className="text-right">{t('qty_sold')}</TableHead>
                      <TableHead className="text-right">{t('revenue')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{products[item.product_id] || item.product_id}</TableCell>
                        <TableCell className="text-right">{item.quantity_sold}</TableCell>
                        <TableCell className="text-right">{item.total_revenue.toFixed(2)} EGP</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Table */}
      <div>
        <h2 className="text-lg font-semibold mb-3">{t('history')}</h2>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('date')}</TableHead>
                <TableHead className="text-right">{t('total_orders')}</TableHead>
                <TableHead className="text-right">{t('total_sales')}</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {closings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No closing records yet.
                  </TableCell>
                </TableRow>
              ) : (
                closings.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.closing_date}</TableCell>
                    <TableCell className="text-right">{c.total_orders}</TableCell>
                    <TableCell className="text-right">{c.total_sales.toFixed(2)} EGP</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => viewReport(c)}>{t('view')}</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
