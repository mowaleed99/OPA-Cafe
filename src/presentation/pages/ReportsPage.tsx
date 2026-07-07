import { useState, useEffect } from 'react';
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
  const { currency, cafeName } = useSettingsStore();
  const { t } = useTranslation();
  
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [report, setReport] = useState<MonthlyClosingReport | null>(null);
  const [products, setProducts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!cafeId) return;
    db.products.where('cafe_id').equals(cafeId).toArray().then(prods => {
      const prodMap: Record<string, string> = {};
      prods.forEach(p => prodMap[p.id] = p.name);
      setProducts(prodMap);
    });
  }, [cafeId]);

  useEffect(() => {
    if (!cafeId) return;
    getMonthlyClosing(cafeId, selectedMonth).then(setReport);
  }, [cafeId, selectedMonth]);

  const exportToCSV = () => {
    if (!report) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Monthly Closing Report - ${report.month}\n\n`;
    csvContent += `Total Orders,${report.total_orders}\n`;
    csvContent += `Total Sales,${report.total_sales.toFixed(2)} ${currency}\n`;
    const avgOrder = report.total_orders > 0 ? (report.total_sales / report.total_orders).toFixed(2) : '0.00';
    csvContent += `Avg Order,${avgOrder} ${currency}\n\n`;
    
    csvContent += `Product,Qty Sold,Revenue\n`;
    
    Object.entries(report.aggregatedItems).forEach(([productId, data]) => {
      const productName = products[productId] || productId;
      const safeName = `"${productName.replace(/"/g, '""')}"`;
      csvContent += `${safeName},${data.quantity},"${data.revenue.toFixed(2)} ${currency}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `monthly-report-${report.month}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-display font-bold text-foreground">Monthly Reports</h1>
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
        <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4 print:border-none print:shadow-none print:p-0">
          <div className="flex items-center justify-between print:hidden">
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

          <div className="print:block hidden mb-6">
            <h2 className="text-2xl font-bold">{cafeName}</h2>
            <h3 className="text-xl">Monthly Report — {report.month}</h3>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="rounded-lg bg-muted/50 p-4 text-center print:border print:bg-transparent">
              <ShoppingBag className="h-6 w-6 mx-auto mb-1 text-muted-foreground print:hidden" />
              <p className="text-2xl font-bold">{report.total_orders}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Orders</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center print:border print:bg-transparent">
              <TrendingUp className="h-6 w-6 mx-auto mb-1 text-muted-foreground print:hidden" />
              <p className="text-2xl font-bold">{report.total_sales.toFixed(2)} <span className="text-sm font-normal">{currency}</span></p>
              <p className="text-xs text-muted-foreground mt-1">Total Sales</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center print:border print:bg-transparent">
              <TrendingUp className="h-6 w-6 mx-auto mb-1 text-muted-foreground print:hidden" />
              <p className="text-2xl font-bold">
                {report.total_orders > 0
                  ? (report.total_sales / report.total_orders).toFixed(2)
                  : '0.00'} <span className="text-sm font-normal">{currency}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">Avg Order</p>
            </div>
          </div>

          {Object.keys(report.aggregatedItems).length > 0 ? (
            <div className="border rounded-md mt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Qty Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(report.aggregatedItems).map(([productId, data]) => (
                    <TableRow key={productId}>
                      <TableCell>{products[productId] || productId}</TableCell>
                      <TableCell className="text-right">{data.quantity}</TableCell>
                      <TableCell className="text-right">{data.revenue.toFixed(2)} {currency}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No sales data for {report.month}.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
