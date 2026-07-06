import React, { useState } from 'react';
import { DailyClosing } from '../types';
import { Calendar, FileText, CheckCircle, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';

interface MonthlyClosingProps {
  dailyClosings: DailyClosing[];
  currency: string;
  language: 'en' | 'ar';
}

export default function MonthlyClosingView({
  dailyClosings,
  currency,
  language,
}: MonthlyClosingProps) {
  const isAr = language === 'ar';
  
  // Available months to select
  const availableMonths = [
    { key: '2026-07', labelEn: 'July 2026', labelAr: 'يوليو ٢٠٢٦' },
    { key: '2026-06', labelEn: 'June 2026', labelAr: 'يونيو ٢٠٢٦' }
  ];

  const [activeMonthIdx, setActiveMonthIdx] = useState(0);
  const selectedMonth = availableMonths[activeMonthIdx];

  // Aggregate daily closings for selectedMonth
  const monthlyClosings = dailyClosings.filter(dc => dc.date.startsWith(selectedMonth.key));

  const totalSales = monthlyClosings.reduce((sum, dc) => sum + dc.totalSales, 0);
  const totalOrders = monthlyClosings.reduce((sum, dc) => sum + dc.totalOrders, 0);

  // Aggregate product breakdown
  const productAggMap: Record<string, { productName: string; quantity: number; revenue: number }> = {};
  monthlyClosings.forEach(dc => {
    dc.productBreakdown.forEach(item => {
      if (!productAggMap[item.productId]) {
        productAggMap[item.productId] = {
          productName: item.productName,
          quantity: 0,
          revenue: 0,
        };
      }
      productAggMap[item.productId].quantity += item.quantity;
      productAggMap[item.productId].revenue += item.revenue;
    });
  });

  const productBreakdown = Object.entries(productAggMap).map(([productId, data]) => ({
    productId,
    ...data,
  })).sort((a, b) => b.revenue - a.revenue);

  const t = (key: string): string => {
    const dict: Record<string, { en: string; ar: string }> = {
      title: { en: 'Monthly Closings Ledger', ar: 'دفتر الإغلاق الشهري الموحد' },
      subtitle: { en: 'Consolidated performance aggregates calculated from daily closed audits.', ar: 'مجاميع الأداء الموحدة المحسوبة من تقارير الإغلاق اليومية المدققة.' },
      selectMonth: { en: 'Select Month', ar: 'اختر الشهر' },
      totalSales: { en: 'Consolidated Gross Sales', ar: 'إجمالي المبيعات الموحدة' },
      totalOrders: { en: 'Total Orders Filled', ar: 'إجمالي الطلبات المنجزة' },
      productBreakdown: { en: 'Monthly Product Volume & Contribution', ar: 'حجم مبيعات ومساهمة المنتجات الشهرية' },
      productColumn: { en: 'Product', ar: 'المنتج' },
      qtyColumn: { en: 'Units Sold', ar: 'الوحدات المباعة' },
      revenueColumn: { en: 'Revenue', ar: 'الإيرادات' },
      statementTitle: { en: 'Monthly Consolidated Statement', ar: 'البيان المالي الشهري الموحد' },
      daysClosed: { en: 'Days Audited', ar: 'الأيام المدققة' },
      noClosings: { en: 'No daily closings recorded for this month.', ar: 'لا توجد إغلاقات يومية مسجلة لهذا الشهر.' }
    };
    return dict[key] ? (isAr ? dict[key].ar : dict[key].en) : key;
  };

  const handleNextMonth = () => {
    if (activeMonthIdx > 0) {
      setActiveMonthIdx(activeMonthIdx - 1);
    }
  };

  const handlePrevMonth = () => {
    if (activeMonthIdx < availableMonths.length - 1) {
      setActiveMonthIdx(activeMonthIdx + 1);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Selector banner */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 p-4 rounded-2xl shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-brand-latte" />
          <div>
            <h3 className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider leading-none">
              {t('selectMonth')}
            </h3>
            <span className="text-sm font-bold text-gray-950 dark:text-zinc-100 font-display">
              {isAr ? selectedMonth.labelAr : selectedMonth.labelEn}
            </span>
          </div>
        </div>

        {/* Month Scroll keys */}
        <div className="flex gap-1.5">
          <button
            onClick={handlePrevMonth}
            disabled={activeMonthIdx === availableMonths.length - 1}
            className="p-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-850 text-gray-400 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            disabled={activeMonthIdx === 0}
            className="p-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-850 text-gray-400 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Summary Metrics */}
        <div className="space-y-4 md:col-span-1">
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 rounded-2xl p-5 shadow-xs space-y-4">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-zinc-500">
              {isAr ? 'مجاميع الشهر' : 'Consolidated Totals'}
            </h4>

            {/* Total Sales KPI */}
            <div className="pb-3 border-b border-gray-100 dark:border-zinc-800">
              <span className="text-[10px] text-gray-400 block font-semibold">{t('totalSales')}</span>
              <p className="text-xl font-bold font-mono text-brand-bean dark:text-brand-latte mt-1">
                {currency}{totalSales.toFixed(2)}
              </p>
            </div>

            {/* Total Orders KPI */}
            <div className="pb-3 border-b border-gray-100 dark:border-zinc-800">
              <span className="text-[10px] text-gray-400 block font-semibold">{t('totalOrders')}</span>
              <p className="text-base font-bold font-mono text-gray-950 dark:text-white mt-1">
                {totalOrders}
              </p>
            </div>

            {/* Audited Days Count */}
            <div>
              <span className="text-[10px] text-gray-400 block font-semibold">{t('daysClosed')}</span>
              <p className="text-sm font-bold text-gray-950 dark:text-white mt-1">
                {monthlyClosings.length} {isAr ? 'أيام تم إغلاقها' : 'Days Audited'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Zoomed-out Receipt layout */}
        <div className="md:col-span-2">
          {monthlyClosings.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 rounded-2xl p-8 text-center text-gray-400">
              <p className="text-xs font-semibold">{t('noClosings')}</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl shadow-md p-6 max-w-lg mx-auto space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-bean"></div>

              {/* Receipt Header */}
              <div className="text-center space-y-1 pt-2">
                <span className="text-[10px] font-bold tracking-widest text-brand-latte uppercase">
                  {t('statementTitle')}
                </span>
                <h2 className="text-lg font-bold uppercase font-display text-gray-950 dark:text-zinc-100">
                  O P A CAFE
                </h2>
                <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">
                  {isAr ? selectedMonth.labelAr : selectedMonth.labelEn}
                </p>
              </div>

              {/* Audited Info */}
              <div className="border-t border-b border-dashed border-gray-200 dark:border-zinc-800 py-3 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400">{isAr ? 'الفترة الزمنية' : 'Accounting Period'}</span>
                  <span className="font-bold text-gray-950 dark:text-white">{selectedMonth.key}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('daysClosed')}</span>
                  <span className="font-semibold text-gray-800 dark:text-zinc-200">{monthlyClosings.length} {isAr ? 'إغلاقات يومية' : 'Daily Audits'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{isAr ? 'إجمالي المبيعات' : 'Gross Consolidated Sales'}</span>
                  <span className="font-bold text-gray-950 dark:text-white">{currency}{totalSales.toFixed(2)}</span>
                </div>
              </div>

              {/* Consolidated Products breakdown */}
              <div className="space-y-2 pb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  {t('productBreakdown')}
                </span>
                <div className="space-y-1.5 divide-y divide-gray-100 dark:divide-zinc-850">
                  {productBreakdown.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center pt-2 text-xs font-mono">
                      <div className="flex flex-col">
                        <span className="font-sans font-semibold text-gray-900 dark:text-zinc-200">
                          {item.productName}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {isAr ? 'عدد الوحدات المباعة:' : 'Units:'} <span className="font-bold">{item.quantity}</span>
                        </span>
                      </div>
                      <span className="font-bold text-gray-950 dark:text-zinc-200">
                        {currency}{item.revenue.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Closing footer */}
              <div className="border-t border-dashed border-gray-200 dark:border-zinc-800 pt-4 text-center">
                <p className="text-[10px] font-mono text-gray-400 italic">
                  End of month financial consolidation complete.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
