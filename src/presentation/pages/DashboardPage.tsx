import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, Banknote, BarChart3 } from 'lucide-react';
import { useAuthStore } from '../../application/store/useAuthStore';
import { getDashboardStats, type DashboardStats } from '../../application/useCases/dashboard/getDashboardStats';
import { useCurrency } from '../../application/utils/useCurrency';

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border bg-card shadow-sm p-5 flex gap-4 items-start">
      <div className={`rounded-lg p-2.5 ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-0.5">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
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
        {t('no_closing_data_7_days')}
      </div>
    );
  }

  const max = Math.max(...closings.map(c => c.total_sales), 1);

  return (
    <div className="flex items-end gap-3 h-48 mt-4">
      {closings.map(c => {
        const heightPct = (c.total_sales / max) * 100;
        const dayLabel = new Date(c.closing_date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short' });
        return (
          <div key={c.id} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-y-2 text-xs font-semibold bg-popover text-popover-foreground px-2 py-1 rounded shadow-md z-10 absolute -mt-10">
              {formatCurrency(c.total_sales)}
            </div>
            <div className="w-full relative flex items-end justify-center rounded-t-xl bg-muted/30 overflow-hidden" style={{ height: '140px' }}>
              <div
                className="w-10/12 rounded-t-xl bg-gradient-to-t from-primary to-primary/50 transition-all duration-700 ease-out group-hover:from-primary group-hover:to-primary/70 shadow-sm"
                style={{ height: `${Math.max(heightPct, 5)}%` }}
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">{dayLabel}</span>
          </div>
        );
      })}
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
      <div className="p-6 flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t('loading_dashboard')}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">{t('dashboard')}</h1>
        <p className="text-muted-foreground mt-1">
          {new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={Banknote}
          label={t('todays_sales')}
          value={formatCurrency(stats.todaySales)}
          color="bg-green-500"
        />
        <StatCard
          icon={ShoppingBag}
          label={t('todays_orders')}
          value={stats.todayOrders.toString()}
          color="bg-blue-500"
        />

        <StatCard
          icon={BarChart3}
          label={t('7_day_sales')}
          value={formatCurrency(stats.weekSales)}
          sub={t('from_closed_days')}
          color="bg-orange-500"
        />
      </div>

      {/* Weekly Bar Chart */}
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <h2 className="text-base font-semibold mb-4">{t('sales_last_7_days')}</h2>
        <WeeklyChart closings={stats.recentClosings} />
      </div>

      {/* Recent closings quick-table */}
      {stats.recentClosings.length > 0 && (
        <div className="rounded-xl border bg-card shadow-sm p-6">
          <h2 className="text-base font-semibold mb-4">{t('recent_closed_days')}</h2>
          <div className="divide-y">
            {stats.recentClosings.slice().reverse().map(c => (
              <div key={c.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="font-medium">{c.closing_date}</span>
                <span className="text-muted-foreground">{c.total_orders} {t('orders')}</span>
                <span className="font-semibold">{formatCurrency(c.total_sales)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
