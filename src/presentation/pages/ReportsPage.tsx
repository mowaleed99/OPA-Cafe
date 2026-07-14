import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { TrendingUp, ShoppingBag, Download, FileText, Calendar, Filter, PieChart as PieChartIcon, BarChart3, Receipt } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../application/store/useSettingsStore';
import { useAuthStore } from '../../application/store/useAuthStore';
import { getMonthlyClosing, type MonthlyClosingReport } from '../../application/useCases/closing/monthlyClosing';
import { getAnalyticsData, type AnalyticsRawData } from '../../application/useCases/reports/getAnalytics';
import { useCurrency } from '../../application/utils/useCurrency';
import { printReport as thermalPrintReport } from '../../application/useCases/printing/printReport';
import { exportPdfReport } from '../../application/useCases/printing/exportPdf';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ReportsPage() {
  const cafeId = useAuthStore(s => s.cafeId());
  const { cafeName } = useSettingsStore();
  const { t } = useTranslation();
  const { currency, formatCurrency } = useCurrency();
  
  const [activeTab, setActiveTab] = useState('sales');
  const [analytics, setAnalytics] = useState<AnalyticsRawData | null>(null);
  
  // Filters
  const [dateRange, setDateRange] = useState('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  
  // Legacy
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [legacyReport, setLegacyReport] = useState<MonthlyClosingReport | null>(null);

  useEffect(() => {
    if (!cafeId) return;
    getAnalyticsData(cafeId).then(setAnalytics);
  }, [cafeId]);

  useEffect(() => {
    if (!cafeId) return;
    getMonthlyClosing(cafeId, selectedMonth).then(setLegacyReport);
  }, [cafeId, selectedMonth]);

  const filteredData = useMemo(() => {
    if (!analytics) return null;
    
    const now = new Date();
    let startStr = '1970-01-01';
    let endStr = '2999-12-31';
    
    if (dateRange === 'today') {
      startStr = now.toISOString().split('T')[0];
      endStr = startStr;
    } else if (dateRange === 'this_week') {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      startStr = start.toISOString().split('T')[0];
      endStr = now.toISOString().split('T')[0];
    } else if (dateRange === 'this_month') {
      startStr = now.toISOString().slice(0, 7) + '-01';
      endStr = now.toISOString().split('T')[0];
    } else if (dateRange === 'custom') {
      startStr = customStart || '1970-01-01';
      endStr = customEnd || '2999-12-31';
    }

    const filteredOrders = analytics.orders.filter(o => 
      o.status === 'paid' && 
      o.created_at.split('T')[0] >= startStr && 
      o.created_at.split('T')[0] <= endStr &&
      (paymentFilter === 'all' || o.payment_method === paymentFilter)
    );

    const orderIds = new Set(filteredOrders.map(o => o.id));
    let filteredItems = analytics.orderItems.filter(i => orderIds.has(i.order_id));

    if (categoryFilter !== 'all') {
       filteredItems = filteredItems.filter(i => {
         const p = analytics.products.find(p => p.id === i.product_id);
         return p && p.category_id === categoryFilter;
       });
    }

    const filteredExpenses = analytics.expenses.filter(e => 
      e.expense_date >= startStr && e.expense_date <= endStr
    );

    return { orders: filteredOrders, items: filteredItems, expenses: filteredExpenses };
  }, [analytics, dateRange, customStart, customEnd, categoryFilter, paymentFilter]);

  const metrics = useMemo(() => {
    if (!filteredData || !analytics) return null;

    const totalRevenue = filteredData.orders.reduce((sum, o) => sum + o.total_amount, 0);
    const totalOrders = filteredData.orders.length;
    
    const salesByDate: Record<string, number> = {};
    filteredData.orders.forEach(o => {
      const d = o.created_at.split('T')[0];
      salesByDate[d] = (salesByDate[d] || 0) + o.total_amount;
    });
    const salesChartData = Object.entries(salesByDate)
      .sort((a,b) => a[0].localeCompare(b[0]))
      .map(([date, total]) => ({ date, total }));

    const productStats: Record<string, { qty: number, rev: number }> = {};
    filteredData.items.forEach(i => {
      if (!productStats[i.product_id]) productStats[i.product_id] = { qty: 0, rev: 0 };
      productStats[i.product_id].qty += i.quantity;
      productStats[i.product_id].rev += i.subtotal;
    });

    const productArray = Object.entries(productStats).map(([id, stats]) => {
      const product = analytics.products.find(p => p.id === id);
      const category = product ? analytics.categories.find(c => c.id === product.category_id) : null;
      return {
        id,
        name: product?.name || 'Unknown',
        category: category?.name || 'Unknown',
        quantity: stats.qty,
        revenue: stats.rev
      };
    });

    const topProductsByRev = [...productArray].sort((a,b) => b.revenue - a.revenue).slice(0, 5);
    const sortedProducts = [...productArray].sort((a,b) => b.quantity - a.quantity);

    const totalExpenses = filteredData.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const expensesByCategory: Record<string, number> = {};
    filteredData.expenses.forEach(e => {
      const cat = e.category.replace('_', ' ');
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + Number(e.amount);
    });
    const expenseChartData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));

    return { totalRevenue, totalOrders, salesChartData, productArray: sortedProducts, topProductsByRev, totalExpenses, expenseChartData };
  }, [filteredData, analytics]);

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

  const handlePrint = async () => { 
    if (activeTab === 'monthly' && legacyReport) {
      const settings = useSettingsStore.getState();
      try {
        if (settings.reportDefaultOutput === 'pdf') {
          await exportPdfReport('monthly', legacyReport, `MonthlyClosing_${legacyReport.month}.pdf`);
        } else {
          await thermalPrintReport('monthly', legacyReport);
        }
      } catch (e) {
        console.error('Failed to print', e);
        window.print();
      }
    } else {
      window.print(); 
    }
  };

  const exportCurrentTabToCSV = () => {
    if (!metrics) return;
    let csvContent = "";
    let filename = "";

    if (activeTab === 'sales') {
      filename = `sales-report-${dateRange}.csv`;
      csvContent += `Date,Revenue\n`;
      metrics.salesChartData.forEach(d => {
        csvContent += `${d.date},${d.total}\n`;
      });
      csvContent += `\nTotal Orders,${metrics.totalOrders}\nTotal Revenue,${metrics.totalRevenue}\n`;
    } else if (activeTab === 'products') {
      filename = `product-performance-${dateRange}.csv`;
      csvContent += `Product,Category,Quantity Sold,Revenue\n`;
      metrics.productArray.forEach(p => {
        const safeName = `"${p.name.replace(/"/g, '""')}"`;
        const safeCat = `"${p.category.replace(/"/g, '""')}"`;
        csvContent += `${safeName},${safeCat},${p.quantity},${p.revenue}\n`;
      });
    } else if (activeTab === 'expenses') {
      filename = `expense-report-${dateRange}.csv`;
      csvContent += `Category,Total Amount\n`;
      metrics.expenseChartData.forEach(e => {
        csvContent += `"${e.name}",${e.value}\n`;
      });
      csvContent += `\nTotal Expenses,${metrics.totalExpenses}\n`;
    } else if (activeTab === 'monthly') {
      if (!legacyReport) return;
      filename = `monthly-closing-${legacyReport.month}.csv`;
      csvContent += `Monthly Closing Report - ${legacyReport.month}\n\n`;
      csvContent += `Total Orders,${legacyReport.total_orders}\n`;
      csvContent += `Total Sales,${legacyReport.total_sales}\n`;
      csvContent += `Total COGS,${legacyReport.total_cost_of_goods}\n`;
      csvContent += `Total Explicit Expenses,${legacyReport.total_explicit_expenses}\n`;
      csvContent += `Total Expenses (Combined),${legacyReport.total_expenses}\n`;
    }

    if (!csvContent) return;
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!analytics || !metrics) {
    return <div className="p-8 text-center text-muted-foreground">{t('loading', 'Loading analytics...')}</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 print:p-0 print:m-0 print:max-w-none">
      
      {/* Hidden block for Legacy Print */}
      {legacyReport && (
        <div className="hidden print:block w-full bg-white text-black p-8 font-sans">
          <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold uppercase tracking-widest">{cafeName}</h1>
              <h2 className="text-2xl font-semibold text-gray-700 mt-1">{t('monthly_report')}</h2>
            </div>
            <div className="text-right">
              <p className="text-lg font-medium text-gray-600">{t('month_label')}: {legacyReport.month}</p>
            </div>
          </div>
          <table className="w-full mb-8 border-collapse border border-black">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-center text-sm font-bold">{t('total_orders')}</th>
                <th className="border border-black p-2 text-center text-sm font-bold">{t('total_sales')}</th>
                <th className="border border-black p-2 text-center text-sm font-bold">{t('cost_of_goods')}</th>
                <th className="border border-black p-2 text-center text-sm font-bold">{t('explicit_expenses')}</th>
                <th className="border border-black p-2 text-center text-sm font-bold">{t('net_profit')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2 text-center font-bold text-lg">{legacyReport.total_orders}</td>
                <td className="border border-black p-2 text-center font-bold text-lg">{formatCurrency(legacyReport.total_sales)}</td>
                <td className="border border-black p-2 text-center font-bold text-lg text-orange-600">{formatCurrency(legacyReport.total_cost_of_goods || 0)}</td>
                <td className="border border-black p-2 text-center font-bold text-lg text-red-600">{formatCurrency(legacyReport.total_explicit_expenses || 0)}</td>
                <td className="border border-black p-2 text-center font-bold text-lg text-green-600">
                  {formatCurrency(legacyReport.total_sales - (legacyReport.total_cost_of_goods || 0) - (legacyReport.total_explicit_expenses || 0))}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="mt-16 text-center text-sm text-gray-400">
            <p>{t('end_of_monthly_report')}</p>
          </div>
        </div>
      )}

      {/* Main UI */}
      <div className="print:hidden space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">{t('reports_analytics', 'Reports & Analytics')}</h1>
            <p className="text-muted-foreground">{t('reports_desc', 'Analyze your cafe performance')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCurrentTabToCSV} className="gap-2">
              <Download className="h-4 w-4" /> {t('export_csv', 'Export CSV')}
            </Button>
            {activeTab === 'monthly' && (
              <Button variant="outline" onClick={handlePrint} className="gap-2">
                <FileText className="h-4 w-4" /> {t('print_btn', 'Print')}
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl bg-muted/50 p-1">
            <TabsTrigger value="sales" className="data-[state=active]:bg-background data-[state=active]:shadow-sm"><TrendingUp className="w-4 h-4 mr-2" />Sales</TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-background data-[state=active]:shadow-sm"><ShoppingBag className="w-4 h-4 mr-2" />Products</TabsTrigger>
            <TabsTrigger value="expenses" className="data-[state=active]:bg-background data-[state=active]:shadow-sm"><PieChartIcon className="w-4 h-4 mr-2" />Expenses</TabsTrigger>
            <TabsTrigger value="monthly" className="data-[state=active]:bg-background data-[state=active]:shadow-sm"><Receipt className="w-4 h-4 mr-2" />Monthly Closing</TabsTrigger>
          </TabsList>

          {/* Shared Filters for top 3 tabs */}
          {activeTab !== 'monthly' && (
            <div className="flex flex-wrap gap-4 p-4 mt-6 bg-card border rounded-xl shadow-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <select 
                  className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="today">Today</option>
                  <option value="this_week">This Week</option>
                  <option value="this_month">This Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {dateRange === 'custom' && (
                <div className="flex items-center gap-2">
                  <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="h-8 text-sm rounded border px-2" />
                  <span className="text-muted-foreground">to</span>
                  <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="h-8 text-sm rounded border px-2" />
                </div>
              )}

              <div className="flex items-center gap-2 border-l pl-4 ml-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select 
                  className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer"
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                >
                  <option value="all">All Payments</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                </select>
              </div>

              <div className="flex items-center gap-2 border-l pl-4 ml-2">
                <select 
                  className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {analytics.categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Tab 1: Sales Report */}
          <TabsContent value="sales" className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-card border rounded-xl shadow-sm">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold mt-2">{formatCurrency(metrics.totalRevenue)}</p>
              </div>
              <div className="p-6 bg-card border rounded-xl shadow-sm">
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-3xl font-bold mt-2">{metrics.totalOrders}</p>
              </div>
            </div>
            
            <div className="p-6 bg-card border rounded-xl shadow-sm h-[400px]">
              <h3 className="font-semibold mb-6">Sales Trend</h3>
              {metrics.salesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.salesChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{fontSize: 12}} tickLine={false} axisLine={false} dy={10} />
                    <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} dx={-10} tickFormatter={(val) => `${val}`} />
                    <Tooltip cursor={{ stroke: 'var(--muted)', strokeWidth: 2 }} contentStyle={{ borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="total" name="Revenue" stroke="var(--primary)" strokeWidth={3} dot={{r:4}} activeDot={{r:6}} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">No sales data for this period</div>
              )}
            </div>
          </TabsContent>

          {/* Tab 2: Products Performance */}
          <TabsContent value="products" className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="p-6 bg-card border rounded-xl shadow-sm h-[400px]">
              <h3 className="font-semibold mb-6">Top 5 Products by Revenue</h3>
              {metrics.topProductsByRev.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.topProductsByRev} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                    <XAxis type="number" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ borderRadius: '8px' }} formatter={(val: number) => formatCurrency(val)} />
                    <Bar dataKey="revenue" name="Revenue" fill="var(--primary)" radius={[0, 4, 4, 0]}>
                      {metrics.topProductsByRev.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                 <div className="flex h-full items-center justify-center text-muted-foreground">No product data for this period</div>
              )}
            </div>

            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Quantity Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.productArray.length > 0 ? (
                    metrics.productArray.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="text-muted-foreground">{p.category}</TableCell>
                        <TableCell className="text-right">{p.quantity}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(p.revenue)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No product sales found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Tab 3: Expenses Analysis */}
          <TabsContent value="expenses" className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 p-6 bg-card border rounded-xl shadow-sm flex flex-col justify-center items-center text-center">
                <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                <p className="text-4xl font-bold mt-2 text-red-500">{formatCurrency(metrics.totalExpenses)}</p>
              </div>
              
              <div className="md:col-span-2 p-6 bg-card border rounded-xl shadow-sm h-[300px]">
                <h3 className="font-semibold mb-2">Expenses by Category</h3>
                {metrics.expenseChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.expenseChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {metrics.expenseChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: number) => formatCurrency(val)} contentStyle={{ borderRadius: '8px' }} />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">No expenses for this period</div>
                )}
              </div>
            </div>

            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.expenseChartData.length > 0 ? (
                    metrics.expenseChartData.map((e, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium capitalize">{e.name}</TableCell>
                        <TableCell className="text-right font-semibold text-red-500">{formatCurrency(e.value)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                        No expenses found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Tab 4: Legacy Monthly Closing */}
          <TabsContent value="monthly" className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="flex items-center gap-3 mb-6 p-4 bg-card border rounded-xl shadow-sm">
                <span className="font-medium">Select Closing Month:</span>
                <input 
                  type="month" 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                />
              </div>

              {legacyReport && (
                <div className="rounded-xl border bg-card shadow-sm p-6 space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-lg bg-muted/50 p-4 text-center">
                      <ShoppingBag className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-2xl font-bold">{legacyReport.total_orders}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t('total_orders')}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-4 text-center">
                      <TrendingUp className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-2xl font-bold text-emerald-600">{formatCurrency(legacyReport.total_sales)}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t('total_sales')}</p>
                    </div>
                    <div className="rounded-lg bg-orange-500/10 p-4 text-center">
                      <TrendingUp className="h-6 w-6 mx-auto mb-1 text-orange-500" />
                      <p className="text-2xl font-bold text-orange-600">{formatCurrency(legacyReport.total_cost_of_goods || 0)}</p>
                      <p className="text-xs text-orange-600 mt-1">{t('cost_of_goods')}</p>
                    </div>
                    <div className="rounded-lg bg-red-500/10 p-4 text-center">
                      <TrendingUp className="h-6 w-6 mx-auto mb-1 text-red-500" />
                      <p className="text-2xl font-bold text-red-600">{formatCurrency(legacyReport.total_explicit_expenses || 0)}</p>
                      <p className="text-xs text-red-500 mt-1">{t('explicit_expenses')}</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                    <strong>Note:</strong> This report is generated strictly from Closed Shifts data for accounting purposes. 
                    For real-time and custom date analytics, use the other tabs.
                  </div>
                </div>
              )}
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}
