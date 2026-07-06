import React from 'react';
import { Order, Product, CustomerDebt, Purchase, ActivityLog } from '../types';
import { TrendingUp, ShoppingBag, AlertTriangle, DollarSign, Activity, FileText, ArrowRight, UserCheck } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface DashboardProps {
  orders: Order[];
  products: Product[];
  debts: CustomerDebt[];
  purchases: Purchase[];
  logs: ActivityLog[];
  currency: string;
  onNavigate: (screen: string) => void;
}

export default function DashboardView({
  orders,
  products,
  debts,
  purchases,
  logs,
  currency,
  onNavigate,
}: DashboardProps) {
  const { t, language } = useLanguage();
  
  // Get today's ISO date prefix "2026-07-06"
  const todayStr = '2026-07-06';

  // Calculate Today's Sales (completed orders on July 6, 2026)
  const todayOrders = orders.filter(
    (o) => o.status === 'completed' && o.date.startsWith(todayStr)
  );
  const totalSalesToday = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const salesCountToday = todayOrders.length;

  // Calculate Outstanding Supplier Debts (Accounts Payable)
  const totalOutstandingPurchases = purchases.reduce((sum, p) => sum + (p.amountRemaining || 0), 0);

  // Calculate Today's Purchases
  const todayPurchases = purchases.filter((p) => p.date.startsWith(todayStr));
  const totalPurchasesToday = todayPurchases.reduce((sum, p) => sum + p.totalAmount, 0);

  // Calculate Low Stock Alerts (excluding archived)
  const lowStockProducts = products.filter(
    (p) => p.status !== 'archived' && p.stock <= p.minStock
  );

  // Calculate Top Selling Products (dynamic)
  const productSalesMap: Record<string, { name: string; count: number; revenue: number }> = {};
  orders
    .filter((o) => o.status === 'completed')
    .forEach((order) => {
      order.items.forEach((item) => {
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = { name: item.productName, count: 0, revenue: 0 };
        }
        productSalesMap[item.productId].count += item.quantity;
        productSalesMap[item.productId].revenue += item.quantity * item.price;
      });
    });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Chart data: hourly sales for July 6, 2026
  // Hours: 7am, 8am, 9am, 10am, 11am, 12pm, 1pm, 2pm, 3pm, 4pm, 5pm
  const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
  const hourlyData = hours.map((hr) => {
    const hourlyOrders = todayOrders.filter((o) => {
      const orderHour = new Date(o.date).getUTCHours(); // Assuming UTC dates in logs
      return orderHour === hr;
    });
    const total = hourlyOrders.reduce((sum, o) => sum + o.total, 0);
    
    // Arabic or English hour display
    let hrLabel = '';
    if (language === 'ar') {
      hrLabel = `${hr > 12 ? hr - 12 : hr} ${hr >= 12 ? 'مساءً' : 'صباحاً'}`;
    } else {
      hrLabel = `${hr > 12 ? hr - 12 : hr}${hr >= 12 ? ' PM' : ' AM'}`;
    }

    return {
      hour: hrLabel,
      amount: total,
    };
  });

  const maxChartAmount = Math.max(...hourlyData.map((d) => d.amount), 50);

  return (
    <div className="space-y-6 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-100 dark:border-zinc-800 pb-5 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-gray-900 dark:text-zinc-100">
            {t('dashboard.title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            {language === 'ar' ? (
              <>
                التحليلات والمراقبة بالوقت الفعلي لـ <span className="font-medium text-brand-latte">أوبـا كـافـيـه</span>.
              </>
            ) : (
              <>
                Real-time analytics and management ledger for <span className="font-medium text-brand-latte">O P A CAFE</span>.
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 px-3 py-1.5 rounded-md self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          {language === 'ar' ? 'جلسة الوردية الحالية: الإثنين، 6 يوليو 2026' : 'Terminal Session: Mon, July 6, 2026'}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Revenue */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 dark:text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider font-display">{t('dashboard.netSales')}</span>
            <div className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-zinc-100">
              {currency}{totalSalesToday.toFixed(2)}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? '+18.4% منذ أمس' : '+18.4% from yesterday'}</span>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 dark:text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider font-display">{t('dashboard.ordersToday')}</span>
            <div className="p-1.5 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
              <ShoppingBag className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-zinc-100">
              {salesCountToday}
            </span>
            <div className="text-xs text-gray-500 mt-1">
              {language === 'ar' ? 'متوسط الفاتورة: ' : 'Avg ticket: '}{currency}{(salesCountToday > 0 ? totalSalesToday / salesCountToday : 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Accounts Payable (Supplier Debts) */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 dark:text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider font-display">
              {language === 'ar' ? 'مستحقات الموردين الآجلة' : 'Accounts Payable'}
            </span>
            <div className="p-1.5 rounded-md bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-zinc-100">
              {currency}{totalOutstandingPurchases.toFixed(2)}
            </span>
            <button 
              onClick={() => onNavigate('suppliers')} 
              className="flex items-center gap-1.5 text-xs text-brand-latte hover:underline mt-1 font-medium text-left"
            >
              {language === 'ar' ? (
                <>إدارة مستحقات {purchases.filter(p => p.amountRemaining && p.amountRemaining > 0).length} فواتير الآجلة</>
              ) : (
                <>Settle {purchases.filter(p => p.amountRemaining && p.amountRemaining > 0).length} pending invoices</>
              )}{' '}
              <ArrowRight className={`w-3 h-3 ${language === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Supplier Purchases */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 dark:text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider font-display">{language === 'ar' ? 'مشتريات اليوم' : 'Purchases Today'}</span>
            <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
              <FileText className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-zinc-100">
              {currency}{totalPurchasesToday.toFixed(2)}
            </span>
            <button 
              onClick={() => onNavigate('purchases')} 
              className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 font-medium text-left"
            >
              {t('purchases.logInvoice')}{' '}
              <ArrowRight className={`w-3 h-3 ${language === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Charts & Stock warning split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart (2 cols wide on desktop) */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider font-display text-gray-900 dark:text-zinc-200">
                {t('dashboard.salesTrend')}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {language === 'ar' ? 'تدفق عمليات اليوم بحسب الساعات الحالية' : "Today's transaction stream by hour"}
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 px-2 py-0.5 rounded-sm">
                {language === 'ar' ? 'النطاق: 1 ساعة' : 'Interval: 1h'}
              </span>
            </div>
          </div>

          {/* SVG Custom Line Chart */}
          <div className="h-64 w-full relative flex flex-col justify-end pt-4">
            {/* Grid lines */}
            <div className="absolute inset-x-0 top-4 bottom-8 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="border-t border-gray-100 dark:border-zinc-800/80 w-full text-[10px] font-mono text-gray-400 dark:text-zinc-500 pt-1">
                  {currency}{((maxChartAmount * (3 - i)) / 3).toFixed(0)}
                </div>
              ))}
            </div>

            {/* Custom SVG Path Bar combo */}
            <div className="h-44 w-full flex items-end justify-between relative px-2 pt-2">
              {hourlyData.map((d, index) => {
                const barHeightPercent = Math.min((d.amount / maxChartAmount) * 100, 100);
                return (
                  <div key={index} className="flex-1 flex flex-col items-center h-full justify-end group z-10">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-gray-950 text-white dark:bg-white dark:text-black text-[10px] py-1 px-2 rounded-md font-mono transition-opacity duration-150 shadow-md whitespace-nowrap">
                      {d.hour}: {currency}{d.amount.toFixed(2)}
                    </div>
                    
                    {/* Visual Bar */}
                    <div 
                      style={{ height: `${Math.max(barHeightPercent, 4)}%` }}
                      className={`w-4/5 sm:w-1/2 max-w-[24px] rounded-t-sm transition-all duration-500 ${
                        d.amount > 0 
                          ? 'bg-brand-latte/70 hover:bg-brand-latte border-t-2 border-brand-bean' 
                          : 'bg-gray-100 dark:bg-zinc-800/50'
                      }`}
                    ></div>
                  </div>
                );
              })}
            </div>

            {/* X Axis Labels */}
            <div className="h-8 border-t border-gray-100 dark:border-zinc-800/60 mt-2 flex items-center justify-between px-1 text-[9px] font-mono text-gray-400 dark:text-zinc-500 overflow-x-auto">
              {hourlyData.map((d, index) => (
                <div key={index} className="text-center w-8 shrink-0">
                  {d.hour.replace(' AM', 'A').replace(' PM', 'P').replace('صباحاً', 'ص').replace('مساءً', 'م')}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider font-display text-gray-900 dark:text-zinc-200">
                {t('dashboard.lowStockAlerts')}
              </h2>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                lowStockProducts.length > 0 
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40' 
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40'
              }`}>
                {lowStockProducts.length} {language === 'ar' ? 'تنبيهات' : 'triggered'}
              </span>
            </div>
            
            {lowStockProducts.length === 0 ? (
              <div className="py-12 text-center text-gray-400 dark:text-zinc-500 flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                  <UserCheck className="w-5 h-5" />
                </div>
                <p className="text-xs">{language === 'ar' ? 'مستويات المخزون كافية وآمنة.' : 'All supply levels are adequate.'}</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[170px] overflow-y-auto pr-1">
                {lowStockProducts.map((p) => (
                  <div 
                    key={p.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50"
                  >
                    <div>
                      <div className="text-xs font-medium text-gray-950 dark:text-zinc-200 truncate max-w-[130px]">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-gray-400 dark:text-zinc-500">
                        {language === 'ar' ? `الحد الأدنى: ${p.minStock} قطعة` : `Min stock: ${p.minStock} units`}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                        p.stock === 0 
                          ? 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400' 
                          : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                      }`}>
                        {p.stock === 0 ? (language === 'ar' ? 'نفذ' : 'OUT') : `${p.stock} ${language === 'ar' ? 'وحدات' : 'units'}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={() => onNavigate('products')}
            className="w-full mt-4 text-center py-2 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-xs text-gray-700 dark:text-zinc-300 rounded-lg border border-gray-100 dark:border-zinc-800 font-medium transition-colors"
          >
            {t('dashboard.viewInventory')}
          </button>
        </div>
      </div>

      {/* Top Products & Recent Actions dual grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider font-display text-gray-900 dark:text-zinc-200 mb-4">
            {language === 'ar' ? 'الأصناف الأكثر طلباً' : 'Most Popular Offerings'}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-zinc-800 text-gray-400 dark:text-zinc-500 font-medium pb-2">
                  <th className={`pb-2 font-semibold ${language === 'ar' ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'اسم المنتج' : 'Product Name'}</th>
                  <th className={`pb-2 font-semibold ${language === 'ar' ? 'text-left' : 'text-right'}`}>{language === 'ar' ? 'الكمية المباعة' : 'Qty Sold'}</th>
                  <th className={`pb-2 font-semibold ${language === 'ar' ? 'text-left' : 'text-right'}`}>{language === 'ar' ? 'إجمالي الإيرادات' : 'Gross revenue'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-zinc-850">
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-gray-400">
                      {language === 'ar' ? 'لا توجد مبيعات مسجلة.' : 'No sales logged.'}
                    </td>
                  </tr>
                ) : (
                  topProducts.map((p, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/40 dark:hover:bg-zinc-950/40 transition-colors">
                      <td className={`py-3 font-medium text-gray-900 dark:text-zinc-200 flex items-center gap-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-brand-beige/40 dark:bg-brand-bean/40 text-brand-bean dark:text-brand-latte text-[10px] font-mono">
                          {idx + 1}
                        </span>
                        {p.name}
                      </td>
                      <td className={`py-3 font-mono text-gray-700 dark:text-zinc-400 ${language === 'ar' ? 'text-left' : 'text-right'}`}>
                        {p.count} {language === 'ar' ? 'طلبات' : 'orders'}
                      </td>
                      <td className={`py-3 font-mono font-semibold text-gray-900 dark:text-zinc-100 ${language === 'ar' ? 'text-left' : 'text-right'}`}>
                        {currency}{p.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Logs Stream */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider font-display text-gray-900 dark:text-zinc-200">
              {t('dashboard.terminalLogs')}
            </h2>
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <Activity className="w-3 h-3 animate-pulse text-emerald-500" />
              {language === 'ar' ? 'سجل العمليات المباشر' : 'Live system activity'}
            </div>
          </div>
          
          <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
            {logs.slice(0, 5).map((log) => {
              // Custom tag colors
              let badgeColor = 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400';
              if (log.type === 'sale') badgeColor = 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400';
              if (log.type === 'purchase') badgeColor = 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400';
              if (log.type === 'debt') badgeColor = 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400';
              if (log.type === 'product') badgeColor = 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400';

              const displayTime = new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={log.id} className="text-xs flex gap-3 items-start border-b border-gray-50 dark:border-zinc-850/50 pb-2.5 last:border-0 last:pb-0">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase shrink-0 ${badgeColor}`}>
                    {log.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 dark:text-zinc-200 font-medium">
                      {log.action} <span className="text-gray-400 dark:text-zinc-500 font-normal">{language === 'ar' ? 'بواسطة' : 'by'}</span> <span className="text-brand-latte">{log.user}</span>
                    </p>
                    <p className="text-gray-500 dark:text-zinc-400 text-[11px] truncate mt-0.5">
                      {log.details}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 shrink-0">
                    {displayTime}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
