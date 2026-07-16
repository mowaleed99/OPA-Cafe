import React, { useState, useEffect } from 'react';
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
  getClosingByDate,
  getClosingPayments,
  getClosingProducts,
  getClosingCategories,
  type ClosingReport,
} from '../../application/useCases/closing/dailyClosing';
import type { DailyClosing } from '../../domain/entities/daily_closing';
import type { Product } from '../../domain/entities/product';
import { useCurrency } from '../../application/utils/useCurrency';
import { exportPdfReport } from '../../application/useCases/printing/exportPdf';
import { printReport as thermalPrintReport } from '../../application/useCases/printing/printReport';
import { useToast } from '../hooks/useToast';
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

export default function ClosingPage() {
  const cafeId = useAuthStore(s => s.cafeId());
  const { t } = useTranslation();
  const { currency, formatCurrency } = useCurrency();
  const { addToast } = useToast();
  const todayIso = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [closings, setClosings] = useState<DailyClosing[]>([]);
  const [alreadyClosed, setAlreadyClosed] = useState(false);
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [report, setReport] = useState<ClosingReport | null>(null);
  const [products, setProducts] = useState<Record<string, {name: string, category: string}>>({});
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!cafeId) return;
    const [allClosings, targetClosing, prods, cats] = await Promise.all([
      getDailyClosings(cafeId),
      getClosingByDate(cafeId, selectedDate),
      getClosingProducts(cafeId || ''),
      getClosingCategories(cafeId || ''),
    ]);
    
    // We can't reliably count today's unclosed orders easily for "needsUpdate" without running the full logic,
    // so we'll just check if it's already closed. The user can just hit Update.
    setClosings(allClosings);
    setAlreadyClosed(!!targetClosing);
    setNeedsUpdate(!!targetClosing); // just show update button if it exists
    
    const catMap: Record<string, string> = {};
    cats.forEach(c => catMap[c.id] = c.name);
    setCategories(catMap);

    const prodMap: Record<string, {name: string, category: string}> = {};
    prods.forEach(p => prodMap[p.id] = { name: p.name, category: catMap[p.category_id] || 'Unknown' });
    setProducts(prodMap);
  };

  useEffect(() => { load(); }, [cafeId, selectedDate]);

  useEffect(() => { load(); }, [cafeId]);

  const handleCloseDay = async () => {
    if (!cafeId) return;
    setIsClosing(true);
    setError(null);
    try {
      const result = await closingDay(cafeId, selectedDate);
      setReport(result);
      setAlreadyClosed(true);
      setNeedsUpdate(true);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close day.');
    } finally {
      setIsClosing(false);
    }
  };

  const viewReport = async (closing: DailyClosing) => {
    if (!cafeId) return;
    const items = await getDailyClosingItems(closing.id);
    const payments = await getClosingPayments(cafeId, closing.closing_date);
    setReport({ closing, items, expenses: closing.total_expenses || 0, payments });
  };

  const exportToCSV = () => {
    if (!report) return;
    
    let csvContent = "";
    csvContent += "Daily Closing Report - " + report.closing.closing_date + "\n\n";
    csvContent += `${t('total_orders')},${report.closing.total_orders}\n`;
    csvContent += `${t('total_sales')},${formatCurrency(report.closing.total_sales)}\n`;
    const avgOrder = report.closing.total_orders > 0 ? (report.closing.total_sales / report.closing.total_orders).toFixed(2) : '0.00';
    csvContent += `${t('avg_order')},${avgOrder} ${currency}\n\n`;
    
    csvContent += `${t('product')},Category,${t('qty_sold')},${t('revenue')}\n`;
    
    report.items.forEach(item => {
      const p = products[item.product_id];
      const productName = p ? p.name : item.product_id;
      const categoryName = p ? p.category : 'Unknown';
      const safeName = `"${productName.replace(/"/g, '""')}"`;
      csvContent += `${safeName},"${categoryName}",${item.quantity_sold},"${formatCurrency(item.total_sales)}"\n`;
    });
    
    csvContent += `\nTotal Expenses,${formatCurrency(report.expenses || 0)}\n`;
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `closing-report-${report.closing.closing_date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = async () => {
    if (!report) return;
    const settings = useSettingsStore.getState();
    try {
      if (settings.reportDefaultOutput === 'pdf') {
        const filePath = await exportPdfReport('daily', report, `DailyClosing_${report.closing.closing_date}.pdf`);
        addToast(`PDF saved to: ${filePath}`, 'success');
      } else {
        await thermalPrintReport('daily', report);
      }
    } catch (e) {
      console.error('Failed to print', e);
      window.print(); // fallback
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 print:p-0 print:m-0 print:max-w-none">
      {/* Hidden block just for printing the professional report */}
      {report && (
        <div className="hidden print:block w-full bg-white text-black p-8 font-sans">
          <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold uppercase tracking-widest">{useSettingsStore.getState().cafeName}</h1>
              <h2 className="text-2xl font-semibold text-gray-700 mt-1">{t('daily_report')}</h2>
            </div>
            <div className="text-right">
              <p className="text-lg font-medium text-gray-600">{formatDate(report.closing.closing_date)}</p>
            </div>
          </div>

          <table className="w-full mb-8 border-collapse border border-black">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-center text-sm font-bold">{t('total_orders')}</th>
                <th className="border border-black p-2 text-center text-sm font-bold">{t('total_sales')}</th>
                <th className="border border-black p-2 text-center text-sm font-bold">{t('avg_order')}</th>
                <th className="border border-black p-2 text-center text-sm font-bold">{t('expenses')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2 text-center font-bold text-lg">{report.closing.total_orders}</td>
                <td className="border border-black p-2 text-center font-bold text-lg">{formatCurrency(report.closing.total_sales)}</td>
                <td className="border border-black p-2 text-center font-bold text-lg">
                  {report.closing.total_orders > 0 ? formatCurrency(report.closing.total_sales / report.closing.total_orders) : formatCurrency(0)}
                </td>
                <td className="border border-black p-2 text-center font-bold text-lg text-red-600">{formatCurrency(report.expenses || 0)}</td>
              </tr>
            </tbody>
          </table>

          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2">{t('sales_breakdown')}</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="p-3 font-bold">{t('product')}</th>
                  <th className="p-3 font-bold">{t('category')}</th>
                  <th className="p-3 font-bold text-right">{t('qty_sold')}</th>
                  <th className="p-3 font-bold text-right">{t('revenue')}</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const byCategory: Record<string, { qty: number, rev: number, items: any[] }> = {};
                  report.items.forEach(item => {
                    const p = products[item.product_id];
                    const cat = p ? p.category : 'Unknown';
                    if (!byCategory[cat]) byCategory[cat] = { qty: 0, rev: 0, items: [] };
                    byCategory[cat].qty += item.quantity_sold;
                    byCategory[cat].rev += item.total_sales;
                    byCategory[cat].items.push(item);
                  });

                  return Object.entries(byCategory).map(([catName, data]) => (
                    <React.Fragment key={`print-cat-${catName}`}>
                      <tr className="bg-gray-50 border-b border-gray-200 font-bold">
                        <td colSpan={2} className="p-3">{catName} (Total)</td>
                        <td className="p-3 text-right">{data.qty}</td>
                        <td className="p-3 text-right">{formatCurrency(data.rev)}</td>
                      </tr>
                      {data.items.map(item => {
                        const p = products[item.product_id];
                        return (
                          <tr key={`print-${item.id}`} className="border-b border-gray-100">
                            <td className="p-3 pl-8">{p ? p.name : item.product_id}</td>
                            <td className="p-3 text-gray-500">{catName}</td>
                            <td className="p-3 text-right">{item.quantity_sold}</td>
                            <td className="p-3 text-right">{formatCurrency(item.total_sales)}</td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ));
                })()}
              </tbody>
            </table>
          </div>

          {report.payments && report.payments.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2">{t('purchase_details_title')}</h3>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="p-3 font-bold">{t('supplier')}</th>
                    <th className="p-3 font-bold">{t('notes_optional')}</th>
                    <th className="p-3 font-bold text-right">{t('total_amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {report.payments.map((payment, i) => (
                    <tr key={`print-pay-${payment.id || i}`} className="border-b border-gray-100">
                      <td className="p-3 font-semibold">{payment.supplierName}</td>
                      <td className="p-3 text-gray-500">{payment.notes || '-'}</td>
                      <td className="p-3 text-right text-red-600 font-bold">{formatCurrency(payment.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-16 text-center text-sm text-gray-400">
            <p>{t('end_of_daily_report')}</p>
          </div>
        </div>
      )}

      {/* Normal UI (Hidden on Print) */}
      <div className="print:hidden space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">{t('closing')}</h1>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            />
            <Button onClick={handleCloseDay} disabled={isClosing} size="lg" className="gap-2">
              {isClosing && <Loader2 className="h-4 w-4 animate-spin" />}
              <CalendarDays className="h-4 w-4" />
              {alreadyClosed ? t('update_closing') : t('close_today')} ({formatDate(selectedDate)})
            </Button>
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
              <h2 className="text-lg font-semibold">{t('report')} — {formatDate(report.closing.closing_date)}</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2">
                  <Download className="h-4 w-4" /> {t('export_csv')}
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                  <FileText className="h-4 w-4" /> {t('print_btn')}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setReport(null)}>{t('close')}</Button>
              </div>
            </div>

            <div className="p-4 bg-background">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <ShoppingBag className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold">{report.closing.total_orders}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('total_orders')}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <TrendingUp className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold">{report.closing.total_sales.toFixed(2)} <span className="text-sm font-normal">{currency}</span></p>
                  <p className="text-xs text-muted-foreground mt-1">{t('total_sales')}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <TrendingUp className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold">
                    {report.closing.total_orders > 0
                      ? (report.closing.total_sales / report.closing.total_orders).toFixed(2)
                      : '0.00'} <span className="text-sm font-normal">{currency}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{t('avg_order')}</p>
                </div>
                <div className="rounded-lg bg-red-500/10 p-4 text-center">
                  <TrendingUp className="h-6 w-6 mx-auto mb-1 text-red-500" />
                  <p className="text-2xl font-bold text-red-600">{(report.expenses || 0).toFixed(2)} <span className="text-sm font-normal">{currency}</span></p>
                  <p className="text-xs text-red-500 mt-1">{t('expenses_purchases')}</p>
                </div>
              </div>

              {report.items.length > 0 && (() => {
                // Group by category
                const byCategory: Record<string, { qty: number, rev: number, items: any[] }> = {};
                report.items.forEach(item => {
                  const p = products[item.product_id];
                  const cat = p ? p.category : 'Unknown';
                  if (!byCategory[cat]) byCategory[cat] = { qty: 0, rev: 0, items: [] };
                  byCategory[cat].qty += item.quantity_sold;
                  byCategory[cat].rev += item.total_sales;
                  byCategory[cat].items.push(item);
                });

                return (
                  <div className="border rounded-md mt-2">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('product')}</TableHead>
                          <TableHead>{t('category')}</TableHead>
                          <TableHead className="text-right">{t('qty_sold')}</TableHead>
                          <TableHead className="text-right">{t('revenue')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(byCategory).map(([catName, data]) => (
                          <React.Fragment key={`cat-${catName}`}>
                            <TableRow className="bg-muted/30 font-semibold">
                              <TableCell colSpan={2}>{catName} (Total)</TableCell>
                              <TableCell className="text-right">{data.qty}</TableCell>
                              <TableCell className="text-right">{formatCurrency(data.rev)}</TableCell>
                            </TableRow>
                            {data.items.map(item => {
                              const p = products[item.product_id];
                              return (
                                <TableRow key={item.id}>
                                  <TableCell className="pl-6">{p ? p.name : item.product_id}</TableCell>
                                  <TableCell className="text-muted-foreground text-sm">{catName}</TableCell>
                                  <TableCell className="text-right">{item.quantity_sold}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(item.total_sales)}</TableCell>
                                </TableRow>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                );
              })()}

              {report.payments && report.payments.length > 0 && (
                <div className="border rounded-md mt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('purchase_supplier')}</TableHead>
                        <TableHead>{t('notes_optional')}</TableHead>
                        <TableHead className="text-right">{t('amount_paid_header')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.payments.map((payment, i) => (
                        <TableRow key={`pay-${payment.id || i}`}>
                          <TableCell className="font-semibold">{payment.supplierName}</TableCell>
                          <TableCell className="text-muted-foreground">{payment.notes || '-'}</TableCell>
                          <TableCell className="text-right text-red-500 font-medium">
                            {formatCurrency(payment.amount)}
                          </TableCell>
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
                  <TableHead className="text-right text-red-500">{t('expenses')}</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {closings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {t('no_closing_records')}
                    </TableCell>
                  </TableRow>
                ) : (
                  closings.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{formatDate(c.closing_date)}</TableCell>
                      <TableCell className="text-right">{c.total_orders}</TableCell>
                      <TableCell className="text-right">{formatCurrency(c.total_sales)}</TableCell>
                      <TableCell className="text-right text-red-500">{formatCurrency(c.total_expenses || 0)}</TableCell>
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
    </div>
  );
}
