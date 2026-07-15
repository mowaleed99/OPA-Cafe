import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, Banknote, BarChart3, AlertTriangle, ArrowUpRight, ArrowDownRight, Package, PackageX, DollarSign, Wallet } from 'lucide-react';
import { useAuthStore } from '../../application/store/useAuthStore';
import { getDashboardStats, type DashboardStats } from '../../application/useCases/dashboard/getDashboardStats';
import { useCurrency } from '../../application/utils/useCurrency';
import { PageLayout, PageHeader, PageContent } from '../components/ui/page-layout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color: string;
  trend?: number;
}) {
  return (
    <div className="rounded-xl border bg-card shadow-sm p-5 flex gap-4 items-start">
      <div className={`rounded-lg p-2.5 ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-end gap-2 mt-0.5">
          <p className="text-2xl font-bold">{value}</p>
          {trend !== undefined && (
            <div className={`flex items-center text-xs font-medium mb-1 ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {trend >= 0 ? <ArrowUpRight className="h-3 w-3 me-0.5" /> : <ArrowDownRight className="h-3 w-3 me-0.5" />}
              {Math.abs(trend).toFixed(1)}%
            </div>
          )}
        </div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function WeeklyChart({ closings }: { closings: DashboardStats['recentClosings'] }) {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  if (closings.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        {t('no_closing_data_7_days', 'No closing data for the last 7 days')}
      </div>
    );
  }

  const data = closings.map(c => ({
    name: new Date(c.closing_date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short' }),
    total: c.total_sales,
  }));

  return (
    <div className="h-[250px] mt-4 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.7 }} fontSize={12} dy={10} />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'currentColor', opacity: 0.7 }} 
            fontSize={12} 
            tickFormatter={(value) => `${value}`} 
          />
          <Tooltip 
            cursor={{ fill: 'var(--muted)', opacity: 0.4 }} 
            contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--popover)', color: 'var(--popover-foreground)' }}
            formatter={(value: number) => [formatCurrency(value), t('sales')]}
          />
          <Bar dataKey="total" radius={[4, 4, 0, 0]} fill="var(--primary)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const cafeId = useAuthStore(s => s.cafeId());
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    if (!cafeId) return;
    getDashboardStats(cafeId).then(setStats);
  }, [cafeId]);

  if (!stats) {
    return (
      <PageLayout>
        <PageContent className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">{t('loading_dashboard', 'Loading dashboard...')}</p>
        </PageContent>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader 
        title={t('dashboard')} 
        description={new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} 
      />
      <PageContent className="max-w-6xl mx-auto w-full space-y-6">
        
        {/* Sales Intelligence */}
        <div>
          <h2 className="text-lg font-semibold mb-3">{t('sales_overview', 'Sales Overview')}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Banknote}
              label={t('todays_sales')}
              value={formatCurrency(stats.todaySales)}
              trend={stats.salesComparisonPct}
              sub={t('vs_yesterday', 'vs yesterday')}
              color="bg-emerald-500 dark:bg-emerald-600"
            />
            <StatCard
              icon={ShoppingBag}
              label={t('todays_orders')}
              value={stats.todayOrders.toString()}
              color="bg-blue-500 dark:bg-blue-600"
            />
            <StatCard
              icon={TrendingUp}
              label={t('avg_order_value', 'Avg Order Value')}
              value={formatCurrency(stats.todayAverageOrder)}
              color="bg-purple-500 dark:bg-purple-600"
            />
            <StatCard
              icon={BarChart3}
              label={t('7_day_sales')}
              value={formatCurrency(stats.weekSales)}
              sub={t('from_closed_days')}
              color="bg-orange-500 dark:bg-orange-600"
            />
          </div>
        </div>

        {/* Profit Intelligence */}
        <div>
          <h2 className="text-lg font-semibold mb-3">{t('profit_analysis', 'Profit Analysis (Last 30 Days)')}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={DollarSign}
              label={t('estimated_profit', 'Estimated Profit')}
              value={formatCurrency(stats.estimatedProfit)}
              color="bg-emerald-600"
            />
            <StatCard
              icon={TrendingUp}
              label={t('profit_margin', 'Profit Margin')}
              value={`${stats.profitMarginPct.toFixed(1)}%`}
              color="bg-teal-500 dark:bg-teal-600"
            />
            <StatCard
              icon={Wallet}
              label={t('total_expenses', 'Expenses')}
              value={formatCurrency(stats.totalExpenses)}
              color="bg-red-500 dark:bg-red-600"
            />
            <StatCard
              icon={Package}
              label={t('cogs', 'Cost of Goods Sold')}
              value={formatCurrency(stats.totalCOGS)}
              color="bg-orange-600 dark:bg-orange-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Bar Chart */}
            <div className="rounded-xl border bg-card shadow-sm p-6">
              <h2 className="text-base font-semibold mb-4">{t('sales_last_7_days')}</h2>
              <WeeklyChart closings={stats.recentClosings} />
            </div>

            {/* Inventory Intelligence - Fast / Slow */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border bg-card shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4 text-emerald-500">
                  <TrendingUp className="h-5 w-5" />
                  <h2 className="text-base font-semibold text-foreground">{t('fast_selling', 'Fast Selling Products')}</h2>
                </div>
                {stats.fastSellingProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('no_data', 'No data available')}</p>
                ) : (
                  <div className="space-y-3">
                    {stats.fastSellingProducts.map((p, i) => (
                      <div key={p.id} className="flex justify-between items-center text-sm">
                        <span className="truncate pe-2"><span className="text-muted-foreground me-2">{i+1}.</span>{p.name}</span>
                        <span className="font-semibold">{p.quantity} {t('sold', 'sold')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border bg-card shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4 text-orange-500">
                  <PackageX className="h-5 w-5" />
                  <h2 className="text-base font-semibold text-foreground">{t('slow_moving', 'Slow Moving Products')}</h2>
                </div>
                {stats.slowMovingProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('no_data', 'No data available')}</p>
                ) : (
                  <div className="space-y-3">
                    {stats.slowMovingProducts.map((p, i) => (
                      <div key={p.id} className="flex justify-between items-center text-sm">
                        <span className="truncate pe-2"><span className="text-muted-foreground me-2">{i+1}.</span>{p.name}</span>
                        <span className="font-semibold text-muted-foreground">{p.quantity} {t('sold', 'sold')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            {/* Low Stock Alerts */}
            <div className="rounded-xl border border-destructive/20 bg-card shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <h2 className="text-base font-semibold">{t('low_stock_alerts', 'Low Stock Alerts')}</h2>
              </div>
              
              {stats.lowStockItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('no_low_stock', 'Inventory levels are good.')}</p>
              ) : (
                <div className="space-y-3">
                  {stats.lowStockItems.map(item => (
                    <div key={item.id} className="flex flex-col gap-1 p-3 rounded-lg bg-destructive/10 border border-destructive/10">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm text-foreground">{item.name}</span>
                        <span className="text-sm font-bold text-destructive">
                          {item.stock_quantity} {item.unit}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Min: {item.low_stock_threshold} {item.unit}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </PageContent>
    </PageLayout>
  );
}
