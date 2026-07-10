import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { TrendingUp, ShoppingBag, Download, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../application/store/useSettingsStore';
import { useAuthStore } from '../../application/store/useAuthStore';
import { getMonthlyClosing, type MonthlyClosingReport } from '../../application/useCases/closing/monthlyClosing';
import { db } from '../../infrastructure/database/db';

export default function ReportsPage() {
  const cafeId = useAuthStore(s => s.cafeId());
  const { cafeName } = useSettingsStore();
  const { t } = useTranslation();
  
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [report, setReport] = useState<MonthlyClosingReport | null>(null);
  const [products, setProducts] = useState<Record<string, {name: string, category: string}>>({});
  const [categories, setCategories] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!cafeId) return;
    Promise.all([
      db.products.where('cafe_id').equals(cafeId).toArray(),
      db.categories.where('cafe_id').equals(cafeId).toArray()
    ]).then(([prods, cats]) => {
      const catMap: Record<string, string> = {};
      cats.forEach(c => catMap[c.id] = c.name);
      setCategories(catMap);
      
      const prodMap: Record<string, {name: string, category: string}> = {};
      prods.forEach(p => prodMap[p.id] = { name: p.name, category: catMap[p.category_id] || 'Unknown' });
      setProducts(prodMap);
    });
  }, [cafeId]);

  useEffect(() => {
    if (!cafeId) return;
    getMonthlyClosing(cafeId, selectedMonth).then(setReport);
  }, [cafeId, selectedMonth]);

  const exportToCSV = () => {
    if (!report) return;
    
    let csvContent = "";
    csvContent += `Monthly Closing Report - ${report.month}\n\n`;
    csvContent += `Total Orders,${report.total_orders}\n`;
    csvContent += `Total Sales,${report.total_sales.toFixed(2)} EGP\n`;
    const avgOrder = report.total_orders > 0 ? (report.total_sales / report.total_orders).toFixed(2) : '0.00';
    csvContent += `Avg Order,${avgOrder} EGP\n\n`;
    
    csvContent += `Product,Category,Qty Sold,Revenue\n`;
    
    Object.entries(report.aggregatedItems).forEach(([productId, data]) => {
      const p = products[productId];
      const productName = p ? p.name : productId;
      const categoryName = p ? p.category : 'Unknown';
      const safeName = `"${productName.replace(/"/g, '""')}"`;
      csvContent += `${safeName},"${categoryName}",${data.quantity},"${data.revenue.toFixed(2)} EGP"\n`;
    });
    
    csvContent += `\nTotal Expenses,${(report.total_expenses || 0).toFixed(2)} EGP\n`;
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `monthly-report-${report.month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 print:p-0 print:m-0 print:max-w-none">
      {/* Hidden block just for printing the professional report */}
      {report && (
        <div className="hidden print:block w-full bg-white text-black p-8 font-sans">
          <div className="text-center mb-8 border-b-2 border-black pb-4">
            <h1 className="text-4xl font-bold mb-2 uppercase tracking-widest">{cafeName}</h1>
            <h2 className="text-2xl font-semibold text-gray-700">MONTHLY REPORT</h2>
            <p className="text-lg text-gray-500 mt-2">Month: {report.month}</p>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8 text-center">
            <div className="border border-gray-300 p-4 rounded-lg bg-gray-50">
              <p className="text-sm font-bold text-gray-500 uppercase">Total Orders</p>
              <p className="text-3xl font-bold">{report.total_orders}</p>
            </div>
            <div className="border border-gray-300 p-4 rounded-lg bg-gray-50">
              <p className="text-sm font-bold text-gray-500 uppercase">Total Sales</p>
              <p className="text-3xl font-bold">{report.total_sales.toFixed(2)} EGP</p>
            </div>
            <div className="border border-gray-300 p-4 rounded-lg bg-gray-50">
              <p className="text-sm font-bold text-gray-500 uppercase">Avg Order</p>
              <p className="text-3xl font-bold">
                {report.total_orders > 0 ? (report.total_sales / report.total_orders).toFixed(2) : '0.00'} EGP
              </p>
            </div>
            <div className="border border-gray-300 p-4 rounded-lg bg-red-50">
              <p className="text-sm font-bold text-red-500 uppercase">Total Expenses</p>
              <p className="text-3xl font-bold text-red-600">{(report.total_expenses || 0).toFixed(2)} EGP</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2">Sales Breakdown by Category</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="p-3 font-bold">Product</th>
                  <th className="p-3 font-bold">Category</th>
                  <th className="p-3 font-bold text-right">Qty</th>
                  <th className="p-3 font-bold text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const byCategory: Record<string, { qty: number, rev: number, items: any[] }> = {};
                  Object.entries(report.aggregatedItems).forEach(([productId, data]) => {
                    const p = products[productId];
                    const cat = p ? p.category : 'Unknown';
                    if (!byCategory[cat]) byCategory[cat] = { qty: 0, rev: 0, items: [] };
                    byCategory[cat].qty += data.quantity;
                    byCategory[cat].rev += data.revenue;
                    byCategory[cat].items.push({ productId, ...data });
                  });

                  return Object.entries(byCategory).map(([catName, data]) => (
                    <React.Fragment key={`print-cat-${catName}`}>
                      <tr className="bg-gray-50 border-b border-gray-200 font-bold">
                        <td colSpan={2} className="p-3">{catName} (Total)</td>
                        <td className="p-3 text-right">{data.qty}</td>
                        <td className="p-3 text-right">{data.rev.toFixed(2)} EGP</td>
                      </tr>
                      {data.items.map(item => {
                        const p = products[item.productId];
                        return (
                          <tr key={`print-${item.productId}`} className="border-b border-gray-100">
                            <td className="p-3 pl-8">{p ? p.name : item.productId}</td>
                            <td className="p-3 text-gray-500">{catName}</td>
                            <td className="p-3 text-right">{item.quantity}</td>
                            <td className="p-3 text-right">{item.revenue.toFixed(2)} EGP</td>
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
              <h3 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2">Purchase Details</h3>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="p-3 font-bold">Date</th>
                    <th className="p-3 font-bold">Supplier</th>
                    <th className="p-3 font-bold">Notes</th>
                    <th className="p-3 font-bold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {report.payments.map((payment, i) => (
                    <tr key={`print-pay-${payment.id || i}`} className="border-b border-gray-100">
                      <td className="p-3 text-gray-500">{payment.payment_date}</td>
                      <td className="p-3 font-semibold">{payment.supplierName}</td>
                      <td className="p-3 text-gray-500">{payment.notes || '-'}</td>
                      <td className="p-3 text-right text-red-600 font-bold">{payment.amount.toFixed(2)} EGP</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-16 text-center text-sm text-gray-400">
            <p>End of Monthly Report</p>
            <p>Generated automatically from database records</p>
          </div>
        </div>
      )}

      {/* Normal UI (Hidden on Print) */}
      <div className="print:hidden space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-foreground">{t('monthly_reports')}</h1>
          <div className="flex items-center gap-3">
            <input 
              type="month" 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            />
          </div>
        </div>

        {report && (
          <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Report — {report.month}</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2">
                  <Download className="h-4 w-4" /> Export CSV
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                  <FileText className="h-4 w-4" /> Print
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <ShoppingBag className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-2xl font-bold">{report.total_orders}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Orders</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-2xl font-bold">{report.total_sales.toFixed(2)} EGP</p>
                <p className="text-xs text-muted-foreground mt-1">Total Sales</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-2xl font-bold">
                  {report.total_orders > 0
                    ? (report.total_sales / report.total_orders).toFixed(2)
                    : '0.00'} EGP
                </p>
                <p className="text-xs text-muted-foreground mt-1">Avg Order</p>
              </div>
              <div className="rounded-lg bg-red-500/10 p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-1 text-red-500" />
                <p className="text-2xl font-bold text-red-600">{(report.total_expenses || 0).toFixed(2)} EGP</p>
                <p className="text-xs text-red-500 mt-1">Expenses (Purchases)</p>
              </div>
            </div>

            {Object.keys(report.aggregatedItems).length > 0 ? (() => {
              const byCategory: Record<string, { qty: number, rev: number, items: any[] }> = {};
              Object.entries(report.aggregatedItems).forEach(([productId, data]) => {
                const p = products[productId];
                const cat = p ? p.category : 'Unknown';
                if (!byCategory[cat]) byCategory[cat] = { qty: 0, rev: 0, items: [] };
                byCategory[cat].qty += data.quantity;
                byCategory[cat].rev += data.revenue;
                byCategory[cat].items.push({ productId, ...data });
              });

              return (
                <div className="border rounded-md mt-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Qty Sold</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(byCategory).map(([catName, data]) => (
                        <React.Fragment key={`cat-${catName}`}>
                          <TableRow className="bg-muted/30 font-semibold">
                            <TableCell colSpan={2}>{catName} (Total)</TableCell>
                            <TableCell className="text-right">{data.qty}</TableCell>
                            <TableCell className="text-right">{data.rev.toFixed(2)} EGP</TableCell>
                          </TableRow>
                          {data.items.map(item => {
                            const p = products[item.productId];
                            return (
                              <TableRow key={item.productId}>
                                <TableCell className="pl-6">{p ? p.name : item.productId}</TableCell>
                                <TableCell className="text-muted-foreground text-sm">{catName}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right font-medium">{item.revenue.toFixed(2)} EGP</TableCell>
                              </TableRow>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              );
            })() : (
              <div className="text-center py-8 text-muted-foreground">
                No sales data for {report.month}.
              </div>
            )}

            {report.payments && report.payments.length > 0 && (
              <div className="border rounded-md mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Purchase Supplier</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Amount Paid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.payments.map((payment, i) => (
                      <TableRow key={`pay-${payment.id || i}`}>
                        <TableCell className="font-medium">{payment.payment_date}</TableCell>
                        <TableCell className="font-semibold">{payment.supplierName}</TableCell>
                        <TableCell className="text-muted-foreground">{payment.notes || '-'}</TableCell>
                        <TableCell className="text-right text-red-500 font-medium">
                          {payment.amount.toFixed(2)} EGP
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
