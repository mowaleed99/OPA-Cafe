import React, { useState } from 'react';
import { Order, Product, Category, DailyClosing } from '../types';
import { BarChart2, Calendar, DollarSign, Percent, TrendingUp, Package, Compass, ChevronRight, FileText } from 'lucide-react';
import MonthlyClosingView from './MonthlyClosingView';

interface ReportsProps {
  orders: Order[];
  products: Product[];
  categories: Category[];
  dailyClosings: DailyClosing[];
  currency: string;
  language: 'en' | 'ar';
}

type Period = 'Today' | 'Weekly' | 'Monthly';

export default function ReportsView({
  orders,
  products,
  categories,
  dailyClosings,
  currency,
  language,
}: ReportsProps) {
  const [viewTab, setViewTab] = useState<'analytics' | 'monthly'>('analytics');
  const [period, setPeriod] = useState<Period>('Weekly');

  const isAr = language === 'ar';

  // Date filters based on simulated context date: July 6, 2026
  const getFilteredOrders = () => {
    const completed = orders.filter(o => o.status === 'completed');
    if (period === 'Today') {
      return completed.filter(o => o.date.startsWith('2026-07-06'));
    }
    if (period === 'Weekly') {
      // 7 days leading up to July 6
      const rangeStart = new Date('2026-06-30T00:00:00Z');
      return completed.filter(o => new Date(o.date) >= rangeStart);
    }
    // Monthly (full June/July 2026)
    const rangeStart = new Date('2026-06-01T00:00:00Z');
    return completed.filter(o => new Date(o.date) >= rangeStart);
  };

  const filteredOrders = getFilteredOrders();

  // Metrics
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = filteredOrders.length;
  const totalDiscountGiven = filteredOrders.reduce((sum, o) => sum + o.discount, 0);

  // Profit/Cost Calculations
  const calculateCostsAndMargins = () => {
    let totalCost = 0;
    filteredOrders.forEach(o => {
      o.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        const itemCost = product ? product.cost : 0;
        totalCost += itemCost * item.quantity;
      });
    });
    const netProfit = totalRevenue - totalCost;
    const marginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    return { totalCost, netProfit, marginPercent };
  };

  const { totalCost, netProfit, marginPercent } = calculateCostsAndMargins();

  // Category breakdown calculation
  const categorySales: Record<string, { name: string; revenue: number; qty: number }> = {};
  categories.forEach(c => {
    categorySales[c.id] = { name: c.name, revenue: 0, qty: 0 };
  });

  filteredOrders.forEach(o => {
    o.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const catId = product.categoryId;
        if (categorySales[catId]) {
          categorySales[catId].revenue += item.quantity * item.price;
          categorySales[catId].qty += item.quantity;
        }
      }
    });
  });

  const categoryArray = Object.values(categorySales).sort((a, b) => b.revenue - a.revenue);
  const maxCategoryRevenue = Math.max(...categoryArray.map(c => c.revenue), 1);

  // Top products list
  const productPerformance: Record<string, { name: string; category: string; qty: number; revenue: number }> = {};
  filteredOrders.forEach(o => {
    o.items.forEach(item => {
      if (!productPerformance[item.productId]) {
        const prod = products.find(p => p.id === item.productId);
        const catName = prod ? categories.find(c => c.id === prod.categoryId)?.name || 'General' : 'General';
        productPerformance[item.productId] = { name: item.productName, category: catName, qty: 0, revenue: 0 };
      }
      productPerformance[item.productId].qty += item.quantity;
      productPerformance[item.productId].revenue += item.quantity * item.price;
    });
  });

  const topPerformanceList = Object.values(productPerformance)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  if (viewTab === 'monthly') {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Sub-nav Tabs switcher */}
        <div className="flex border-b border-gray-100 dark:border-zinc-800 gap-4">
          <button
            onClick={() => setViewTab('analytics')}
            className="pb-3 text-xs font-bold text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-200 flex items-center gap-2 border-b-2 border-transparent transition-all"
          >
            <BarChart2 className="w-4 h-4" />
            {isAr ? 'التحليلات ومؤشرات الأداء' : 'Performance Analytics'}
          </button>
          <button
            onClick={() => setViewTab('monthly')}
            className="pb-3 text-xs font-bold text-brand-latte border-b-2 border-brand-latte flex items-center gap-2 transition-all font-display"
          >
            <FileText className="w-4 h-4" />
            {isAr ? 'تقرير الإغلاق الشهري' : 'Monthly Closings Ledger'}
          </button>
        </div>

        <MonthlyClosingView 
          dailyClosings={dailyClosings}
          currency={currency}
          language={language}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Sub-nav Tabs switcher */}
      <div className="flex border-b border-gray-100 dark:border-zinc-800 gap-4">
        <button
          onClick={() => setViewTab('analytics')}
          className="pb-3 text-xs font-bold text-brand-latte border-b-2 border-brand-latte flex items-center gap-2 transition-all font-display"
        >
          <BarChart2 className="w-4 h-4" />
          {isAr ? 'التحليلات ومؤشرات الأداء' : 'Performance Analytics'}
        </button>
        <button
          onClick={() => setViewTab('monthly')}
          className="pb-3 text-xs font-bold text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-200 flex items-center gap-2 border-b-2 border-transparent transition-all"
        >
          <FileText className="w-4 h-4" />
          {isAr ? 'تقرير الإغلاق الشهري' : 'Monthly Closings Ledger'}
        </button>
      </div>

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-100 dark:border-zinc-800 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-display font-semibold text-gray-900 dark:text-zinc-100">
            {isAr ? 'تقارير الأداء المالي والتحليلات' : 'Financial Performance Reports'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isAr ? 'تحليل المبيعات الإجمالية، الهوامش الصافية، خصومات العملاء وشعبية المنتجات.' : 'Analyze gross sales, net margins, customer discounts, and menu product popularity.'}
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl self-start sm:self-auto border border-gray-150 dark:border-zinc-850">
          {(['Today', 'Weekly', 'Monthly'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                period === p
                  ? 'bg-white text-gray-900 dark:bg-zinc-900 dark:text-zinc-100 shadow-sm font-bold'
                  : 'text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              {p === 'Today' ? (isAr ? 'اليوم' : 'Today') : p === 'Weekly' ? (isAr ? 'الأسبوعي' : 'Weekly') : (isAr ? 'الشهري' : 'Monthly')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Stripe-inspired KPI Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-5">
          <div className="flex justify-between items-center text-gray-400 dark:text-zinc-500 text-xs font-semibold tracking-wider font-display uppercase">
            <span>Gross Sales Revenue</span>
            <DollarSign className="w-4.5 h-4.5 text-brand-latte" />
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-display font-bold text-gray-950 dark:text-zinc-100 font-mono">
              {currency}{totalRevenue.toFixed(2)}
            </span>
            <p className="text-[10px] text-gray-400 mt-1">Discounts given: {currency}{totalDiscountGiven.toFixed(2)}</p>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-5">
          <div className="flex justify-between items-center text-gray-400 dark:text-zinc-500 text-xs font-semibold tracking-wider font-display uppercase">
            <span>Net Profit (Est)</span>
            <TrendingUp className="w-4.5 h-4.5 text-emerald-500" />
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-display font-bold text-emerald-600 font-mono">
              {currency}{netProfit.toFixed(2)}
            </span>
            <p className="text-[10px] text-gray-400 mt-1">Sourcing COGS cost: {currency}{totalCost.toFixed(2)}</p>
          </div>
        </div>

        {/* Gross Margin % */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-5">
          <div className="flex justify-between items-center text-gray-400 dark:text-zinc-500 text-xs font-semibold tracking-wider font-display uppercase">
            <span>Gross Margin</span>
            <Percent className="w-4.5 h-4.5 text-sky-500" />
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-display font-bold text-gray-950 dark:text-zinc-100 font-mono">
              {marginPercent.toFixed(1)}%
            </span>
            <p className="text-[10px] text-gray-400 mt-1">Highly cost efficient margins</p>
          </div>
        </div>

        {/* Ticket Volume */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-5">
          <div className="flex justify-between items-center text-gray-400 dark:text-zinc-500 text-xs font-semibold tracking-wider font-display uppercase">
            <span>Ticket Volume</span>
            <Package className="w-4.5 h-4.5 text-amber-500" />
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-display font-bold text-gray-950 dark:text-zinc-100 font-mono">
              {totalOrdersCount}
            </span>
            <p className="text-[10px] text-gray-400 mt-1">
              Avg ticket: {currency}{(totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Split grid: Category breakdown and Top Sold Rank */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Share Distribution */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-5">
          <div className="flex items-center gap-2 mb-5">
            <Compass className="w-4.5 h-4.5 text-brand-latte" />
            <h2 className="text-xs font-semibold uppercase tracking-wider font-display text-gray-950 dark:text-zinc-200">
              Department Sales Breakdown
            </h2>
          </div>

          <div className="space-y-4">
            {categoryArray.map((c, idx) => {
              const widthPercent = (c.revenue / maxCategoryRevenue) * 100;
              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-950 dark:text-zinc-300">{c.name}</span>
                    <div className="flex gap-3 font-mono text-gray-500">
                      <span>{c.qty} sold</span>
                      <span className="font-bold text-gray-950 dark:text-zinc-100">{currency}{c.revenue.toFixed(2)}</span>
                    </div>
                  </div>
                  {/* Progress bar graph */}
                  <div className="h-2 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${Math.max(widthPercent, 3)}%` }}
                      className="h-full bg-brand-latte rounded-full transition-all duration-500"
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Product Offerings Rank */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 className="w-4.5 h-4.5 text-brand-latte" />
            <h2 className="text-xs font-semibold uppercase tracking-wider font-display text-gray-950 dark:text-zinc-200">
              Top 5 Performing Items
            </h2>
          </div>

          <div className="divide-y divide-gray-50 dark:divide-zinc-850">
            {topPerformanceList.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No sales entries logged in this window.</p>
            ) : (
              topPerformanceList.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between hover:bg-gray-50/20 dark:hover:bg-zinc-950/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-5.5 h-5.5 rounded-md bg-brand-beige/40 dark:bg-brand-bean/30 text-brand-bean dark:text-brand-latte flex items-center justify-center font-mono font-bold text-xs">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-900 dark:text-zinc-100 leading-tight">{item.name}</h4>
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500">{item.category}</span>
                    </div>
                  </div>

                  <div className="text-right font-mono text-xs">
                    <span className="font-bold text-gray-950 dark:text-zinc-200">{currency}{item.revenue.toFixed(2)}</span>
                    <p className="text-[10px] text-gray-400">{item.qty} portions</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
