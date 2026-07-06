import React, { useState } from 'react';
import { Order, Product, DailyClosing } from '../types';
import { Calendar, FileText, CheckCircle, TrendingUp, ShoppingBag, Search, Clock, ArrowRight, User } from 'lucide-react';

interface DailyClosingProps {
  orders: Order[];
  products: Product[];
  dailyClosings: DailyClosing[];
  onAddDailyClosing: (closing: DailyClosing) => void;
  activeUserName: string;
  currency: string;
  language: 'en' | 'ar';
}

export default function DailyClosingView({
  orders,
  products,
  dailyClosings,
  onAddDailyClosing,
  activeUserName,
  currency,
  language,
}: DailyClosingProps) {
  // Translate helper
  const isAr = language === 'ar';
  const t = (key: string): string => {
    const dict: Record<string, { en: string; ar: string }> = {
      title: { en: 'Daily Financial Closing', ar: 'إغلاق الصندوق اليومي' },
      subtitle: { en: 'Audit, reconcile, and secure your cafe ledger entries daily.', ar: 'تدقيق وتسوية وحفظ قيود صندوق المقهى بشكل يومي.' },
      closeDayBtn: { en: 'Close Today', ar: 'إغلاق اليوم' },
      historyTitle: { en: 'Historical Closings', ar: 'سجل الإغلاقات السابقة' },
      searchPlaceholder: { en: 'Search by date...', ar: 'بحث بالتاريخ...' },
      noHistory: { en: 'No past daily closings recorded.', ar: 'لا توجد إغلاقات سابقة مسجلة.' },
      closedBy: { en: 'Closed By', ar: 'تم الإغلاق بواسطة' },
      totalSales: { en: 'Total Gross Sales', ar: 'إجمالي المبيعات' },
      totalOrders: { en: 'Total Orders', ar: 'إجمالي الطلبات' },
      productBreakdown: { en: 'Product Sales Breakdown', ar: 'تفاصيل مبيعات المنتجات' },
      productColumn: { en: 'Product', ar: 'المنتج' },
      qtyColumn: { en: 'Qty Sold', ar: 'الكمية المباعة' },
      revenueColumn: { en: 'Revenue', ar: 'الإيرادات' },
      draftTitle: { en: 'Today\'s Draft Closing Statement', ar: 'مسودة بيان إغلاق اليوم' },
      draftSubtitle: { en: 'Unsaved daily statistics based on today\'s live receipts.', ar: 'إحصاءات غير محفوظة بناءً على الفواتير الحية لليوم.' },
      finalizeBtn: { en: 'Finalize & Save Closing', ar: 'اعتماد وحفظ إغلاق اليوم' },
      alreadyClosed: { en: 'Today has already been finalized.', ar: 'تم إغلاق حسابات اليوم بالفعل.' },
      receiptLayoutTitle: { en: 'Cafe Closing Report', ar: 'تقرير إغلاق المقهى' },
      reconciledStatus: { en: 'RECONCILED & SECURED', ar: 'تمت التسوية والحفظ' },
      savedSuccessfully: { en: 'Daily closing report saved successfully.', ar: 'تم حفظ تقرير الإغلاق اليومي بنجاح.' },
      noSalesToday: { en: 'No sales recorded yet today.', ar: 'لم يتم تسجيل أي مبيعات اليوم بعد.' },
      dateStr: { en: 'Date', ar: 'التاريخ' },
      pastReportTitle: { en: 'Daily Closing Statement', ar: 'بيان الإغلاق اليومي' },
    };
    return dict[key] ? (isAr ? dict[key].ar : dict[key].en) : key;
  };

  const getTodayLocalDateStr = () => {
    // Return today's date formatted as YYYY-MM-DD
    const local = new Date();
    const offset = local.getTimezoneOffset();
    const localDate = new Date(local.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const todayDateStr = getTodayLocalDateStr();

  // State
  const [selectedClosing, setSelectedClosing] = useState<DailyClosing | null>(
    dailyClosings.find(dc => dc.date === todayDateStr) || null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingDraft, setViewingDraft] = useState(!dailyClosings.some(dc => dc.date === todayDateStr));

  // Compute Today's live sales draft
  const getTodaySalesDraft = (): Omit<DailyClosing, 'id'> => {
    // Filter orders for today
    const todayOrders = orders.filter(o => {
      // Order completed today
      const orderDate = o.date.split('T')[0];
      return o.status === 'completed' && orderDate === todayDateStr;
    });

    const totalSales = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = todayOrders.length;

    // Breakdown
    const breakdownMap: Record<string, { productName: string; quantity: number; revenue: number }> = {};
    todayOrders.forEach(o => {
      o.items.forEach(item => {
        if (!breakdownMap[item.productId]) {
          breakdownMap[item.productId] = {
            productName: item.productName,
            quantity: 0,
            revenue: 0,
          };
        }
        breakdownMap[item.productId].quantity += item.quantity;
        breakdownMap[item.productId].revenue += item.quantity * item.price;
      });
    });

    const productBreakdown = Object.entries(breakdownMap).map(([productId, data]) => ({
      productId,
      productName: data.productName,
      quantity: data.quantity,
      revenue: data.revenue,
    }));

    return {
      date: todayDateStr,
      timestamp: new Date().toISOString(),
      totalSales,
      totalOrders,
      productBreakdown,
      closedBy: activeUserName,
    };
  };

  const todayDraft = getTodaySalesDraft();
  const todayAlreadyClosed = dailyClosings.some(dc => dc.date === todayDateStr);

  const handleFinalize = () => {
    if (todayAlreadyClosed) {
      alert(t('alreadyClosed'));
      return;
    }
    if (todayDraft.totalOrders === 0) {
      if (!confirm(isAr ? 'لم تسجل أي طلبات اليوم. هل تريد إغلاق اليوم على أي حال بمبيعات صفرية؟' : 'No sales recorded today. Close day with zero sales anyway?')) {
        return;
      }
    }

    const newClosing: DailyClosing = {
      id: `dc-${todayDateStr}`,
      ...todayDraft,
    };

    onAddDailyClosing(newClosing);
    setSelectedClosing(newClosing);
    setViewingDraft(false);
    alert(t('savedSuccessfully'));
  };

  const filteredHistory = dailyClosings.filter(dc => 
    dc.date.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6 animate-fade-in" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-100 dark:border-zinc-800 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-display font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="p-1.5 bg-brand-crema dark:bg-brand-bean/30 rounded-lg text-brand-latte">
              <CheckCircle className="w-5 h-5" />
            </span>
            {t('title')}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {t('subtitle')}
          </p>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-2">
          {!todayAlreadyClosed && (
            <button
              onClick={() => {
                setViewingDraft(true);
                setSelectedClosing(null);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                viewingDraft
                  ? 'bg-brand-bean text-white dark:bg-brand-latte dark:text-zinc-950 shadow-sm'
                  : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300'
              }`}
            >
              {isAr ? 'مسودة إغلاق اليوم' : 'Today\'s Live Draft'}
            </button>
          )}

          {todayAlreadyClosed && (
            <div className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              {t('alreadyClosed')}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Historical list */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 rounded-2xl p-4 shadow-xs space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-display uppercase tracking-wider text-gray-900 dark:text-zinc-200">
              {t('historyTitle')}
            </h3>
            <span className="text-[10px] bg-gray-100 dark:bg-zinc-800 text-gray-500 font-mono font-bold px-2 py-0.5 rounded-full">
              {dailyClosings.length}
            </span>
          </div>

          <div className="relative">
            <Search className={`w-3.5 h-3.5 text-gray-400 absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
            <input 
              type="text" 
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isAr ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-1.5 bg-gray-50 dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-200 rounded-lg border border-gray-150 dark:border-zinc-850 outline-none`}
            />
          </div>

          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
            {filteredHistory.length === 0 ? (
              <p className="text-[11px] text-gray-400 dark:text-zinc-500 py-6 text-center">{t('noHistory')}</p>
            ) : (
              filteredHistory.map((dc) => {
                const isSelected = selectedClosing?.id === dc.id && !viewingDraft;
                return (
                  <button
                    key={dc.id}
                    onClick={() => {
                      setSelectedClosing(dc);
                      setViewingDraft(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-brand-crema/40 border-brand-beige/55 text-brand-espresso dark:bg-brand-bean/20 dark:border-brand-bean/60 dark:text-brand-latte'
                        : 'bg-white hover:bg-gray-50 dark:bg-zinc-900 border-gray-100 dark:border-zinc-850 text-gray-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <div>
                        <span className="text-xs font-bold font-mono">{dc.date}</span>
                        <p className="text-[9px] text-gray-400 truncate max-w-[130px]">
                          {dc.closedBy}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold font-mono text-gray-950 dark:text-white">
                        {currency}{dc.totalSales.toFixed(2)}
                      </span>
                      <p className="text-[9px] text-gray-400 font-mono">
                        {dc.totalOrders} {isAr ? 'طلبات' : 'orders'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Read-Only Receipt/Statement view */}
        <div className="lg:col-span-2 space-y-4">
          
          {viewingDraft ? (
            /* Live Draft Panel */
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 rounded-2xl p-6 shadow-xs space-y-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 px-2 py-0.5 rounded-md">
                  DRAFT STATEMENT
                </span>
                <h3 className="text-sm font-bold text-gray-950 dark:text-zinc-100 mt-2">
                  {t('draftTitle')}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t('draftSubtitle')}
                </p>
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-850">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">{t('totalSales')}</span>
                  <p className="text-lg font-bold font-mono text-gray-950 dark:text-white mt-1">
                    {currency}{todayDraft.totalSales.toFixed(2)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-850">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">{t('totalOrders')}</span>
                  <p className="text-lg font-bold font-mono text-gray-950 dark:text-white mt-1">
                    {todayDraft.totalOrders}
                  </p>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-900 dark:text-zinc-200 uppercase">
                  {t('productBreakdown')}
                </h4>
                {todayDraft.productBreakdown.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">{t('noSalesToday')}</p>
                ) : (
                  <div className="border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden divide-y divide-gray-150 dark:divide-zinc-850 text-xs">
                    <div className="grid grid-cols-3 bg-gray-50 dark:bg-zinc-950 p-2.5 font-bold text-gray-400">
                      <span>{t('productColumn')}</span>
                      <span className="text-center">{t('qtyColumn')}</span>
                      <span className="text-right">{t('revenueColumn')}</span>
                    </div>
                    {todayDraft.productBreakdown.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-3 p-2.5 font-mono text-gray-700 dark:text-zinc-300">
                        <span className="font-sans font-semibold text-gray-900 dark:text-zinc-200">{item.productName}</span>
                        <span className="text-center font-bold">{item.quantity}</span>
                        <span className="text-right font-bold">{currency}{item.revenue.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                <button
                  onClick={handleFinalize}
                  className="w-full py-3 bg-brand-bean text-white dark:bg-brand-latte dark:text-zinc-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 uppercase tracking-wide hover:opacity-95"
                >
                  <CheckCircle className="w-4 h-4" />
                  {t('finalizeBtn')}
                </button>
              </div>
            </div>
          ) : (
            /* Selected Statement Receipt-Layout Card */
            selectedClosing && (
              <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl shadow-md p-6 max-w-md mx-auto space-y-6 relative overflow-hidden">
                {/* Visual strip at top */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-latte"></div>

                {/* Receipt Header */}
                <div className="text-center space-y-1 pt-2">
                  <span className="text-[10px] font-bold tracking-widest text-brand-latte uppercase">
                    {t('receiptLayoutTitle')}
                  </span>
                  <h2 className="text-lg font-bold uppercase font-display text-gray-950 dark:text-zinc-100">
                    O P A CAFE
                  </h2>
                  <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">
                    {t('reconciledStatus')}
                  </p>
                </div>

                <div className="border-t border-b border-dashed border-gray-200 dark:border-zinc-800 py-3 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('dateStr')}</span>
                    <span className="font-bold text-gray-950 dark:text-white">{selectedClosing.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('closedBy')}</span>
                    <span className="font-semibold text-gray-800 dark:text-zinc-200">{selectedClosing.closedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ref Code</span>
                    <span className="text-gray-500">{selectedClosing.id}</span>
                  </div>
                </div>

                {/* KPI Breakdown */}
                <div className="grid grid-cols-2 gap-4 divide-x divide-gray-100 dark:divide-zinc-800">
                  <div className="text-center">
                    <span className="text-[10px] text-gray-400 block font-bold uppercase mb-0.5">{t('totalSales')}</span>
                    <span className="text-xl font-bold font-mono text-brand-bean dark:text-brand-latte">
                      {currency}{selectedClosing.totalSales.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-gray-400 block font-bold uppercase mb-0.5">{t('totalOrders')}</span>
                    <span className="text-xl font-bold font-mono text-gray-950 dark:text-white">
                      {selectedClosing.totalOrders}
                    </span>
                  </div>
                </div>

                {/* Product Breakdown Ledger */}
                <div className="space-y-2 pb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    {t('productBreakdown')}
                  </span>
                  <div className="space-y-1.5 divide-y divide-gray-100 dark:divide-zinc-850">
                    {selectedClosing.productBreakdown.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center pt-1.5 text-xs font-mono">
                        <div className="flex flex-col">
                          <span className="font-sans font-semibold text-gray-900 dark:text-zinc-200">
                            {item.productName}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            Qty: <span className="font-bold">{item.quantity}</span>
                          </span>
                        </div>
                        <span className="font-bold text-gray-950 dark:text-zinc-200">
                          {currency}{item.revenue.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Closing Tag */}
                <div className="border-t border-dashed border-gray-200 dark:border-zinc-800 pt-4 text-center">
                  <p className="text-[10px] font-mono text-gray-400 italic">
                    All ledger transactions verified by audit log.
                  </p>
                </div>
              </div>
            )
          )}

        </div>
      </div>
    </div>
  );
}
