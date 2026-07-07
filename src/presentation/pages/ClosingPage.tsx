import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { CalendarDays, TrendingUp, ShoppingBag, Loader2, CheckCircle2 } from 'lucide-react';
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

export default function ClosingPage() {
  const cafeId = useAuthStore(s => s.cafeId());
  const [closings, setClosings] = useState<DailyClosing[]>([]);
  const [alreadyClosed, setAlreadyClosed] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [report, setReport] = useState<ClosingReport | null>(null);
  const [products, setProducts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!cafeId) return;
    const [allClosings, todayClosing, prods] = await Promise.all([
      getDailyClosings(cafeId),
      getTodayClosing(cafeId),
      db.products.where('cafe_id').equals(cafeId).toArray(),
    ]);
    setClosings(allClosings);
    setAlreadyClosed(!!todayClosing);
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

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Daily Closing</h1>
          <p className="text-muted-foreground mt-1">Close today's shift and review historical reports.</p>
        </div>
        <div className="flex items-center gap-3">
          {alreadyClosed ? (
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <CheckCircle2 className="h-5 w-5" />
              <span>Today is closed</span>
            </div>
          ) : (
            <Button onClick={handleCloseDay} disabled={isClosing} size="lg" className="gap-2">
              {isClosing && <Loader2 className="h-4 w-4 animate-spin" />}
              <CalendarDays className="h-4 w-4" />
              Close Today ({today})
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
            <h2 className="text-lg font-semibold">Report — {report.closing.closing_date}</h2>
            <Button variant="ghost" size="sm" onClick={() => setReport(null)}>Close</Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <ShoppingBag className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
              <p className="text-2xl font-bold">{report.closing.total_orders}</p>
              <p className="text-xs text-muted-foreground mt-1">Orders</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
              <p className="text-2xl font-bold">${report.closing.total_sales.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Sales</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
              <p className="text-2xl font-bold">
                ${report.closing.total_orders > 0
                  ? (report.closing.total_sales / report.closing.total_orders).toFixed(2)
                  : '0.00'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Avg. Order</p>
            </div>
          </div>

          {report.items.length > 0 && (
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
                  {report.items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{products[item.product_id] || item.product_id}</TableCell>
                      <TableCell className="text-right">{item.quantity_sold}</TableCell>
                      <TableCell className="text-right">${item.total_revenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* History Table */}
      <div>
        <h2 className="text-lg font-semibold mb-3">History</h2>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Total Sales</TableHead>
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
                    <TableCell className="text-right">${c.total_sales.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => viewReport(c)}>View</Button>
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
