import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, Banknote, BarChart3 } from 'lucide-react';
import { useAuthStore } from '../../application/store/useAuthStore';
import { getDashboardStats, type DashboardStats } from '../../application/useCases/dashboard/getDashboardStats';

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
  if (closings.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        No closing data for the past 7 days.
      </div>
    );
  }

  const max = Math.max(...closings.map(c => c.total_sales), 1);

  return (
    <div className="flex items-end gap-3 h-40">
      {closings.map(c => {
        const heightPct = (c.total_sales / max) * 100;
        const dayLabel = new Date(c.closing_date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short' });
        return (
          <div key={c.id} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground">${c.total_sales.toFixed(0)}</span>
            <div className="w-full relative flex items-end" style={{ height: '96px' }}>
              <div
                className="w-full rounded-t-md bg-primary/80 transition-all duration-500"
                style={{ height: `${Math.max(heightPct, 4)}%` }}
                title={`${c.closing_date}: $${c.total_sales.toFixed(2)}`}
              />
            </div>
            <span className="text-xs text-muted-foreground">{dayLabel}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const cafeId = useAuthStore(s => s.cafeId());
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (!cafeId) return;
    getDashboardStats(cafeId).then(setStats);
  }, [cafeId]);

  if (!stats) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          {new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Banknote}
          label="Today's Sales"
          value={`$${stats.todaySales.toFixed(2)}`}
          color="bg-green-500"
        />
        <StatCard
          icon={ShoppingBag}
          label="Today's Orders"
          value={stats.todayOrders.toString()}
          color="bg-blue-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg. Order Value"
          value={`$${stats.todayAverageOrder.toFixed(2)}`}
          color="bg-violet-500"
        />
        <StatCard
          icon={BarChart3}
          label="7-Day Sales"
          value={`$${stats.weekSales.toFixed(2)}`}
          sub="from closed days"
          color="bg-orange-500"
        />
      </div>

      {/* Weekly Bar Chart */}
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <h2 className="text-base font-semibold mb-4">Sales — Last 7 Days</h2>
        <WeeklyChart closings={stats.recentClosings} />
      </div>

      {/* Recent closings quick-table */}
      {stats.recentClosings.length > 0 && (
        <div className="rounded-xl border bg-card shadow-sm p-6">
          <h2 className="text-base font-semibold mb-4">Recent Closed Days</h2>
          <div className="divide-y">
            {stats.recentClosings.slice().reverse().map(c => (
              <div key={c.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="font-medium">{c.closing_date}</span>
                <span className="text-muted-foreground">{c.total_orders} orders</span>
                <span className="font-semibold">${c.total_sales.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
