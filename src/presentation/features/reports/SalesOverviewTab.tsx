import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../../application/utils/useCurrency';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SalesOverviewTabProps {
  totalRevenue: number;
  totalOrders: number;
  salesChartData: Array<{ date: string; total: number }>;
}

export const SalesOverviewTab: React.FC<SalesOverviewTabProps> = ({
  totalRevenue,
  totalOrders,
  salesChartData,
}) => {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();

  return (
    <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-card border rounded-xl shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">{t('total_revenue', 'Total Revenue')}</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="p-6 bg-card border rounded-xl shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">{t('total_orders', 'Total Orders')}</p>
          <p className="text-3xl font-bold mt-2">{totalOrders}</p>
        </div>
      </div>

      <div className="p-6 bg-card border rounded-xl shadow-sm h-[400px]">
        <h3 className="font-semibold mb-6">{t('sales_trend', 'Sales Trend')}</h3>
        {salesChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} dy={10} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} tickFormatter={(val) => `${val}`} />
              <Tooltip cursor={{ stroke: 'var(--muted)', strokeWidth: 2 }} contentStyle={{ borderRadius: '8px' }} />
              <Line type="monotone" dataKey="total" name={t('revenue', 'Revenue')} stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">{t('no_sales_data', 'No sales data for this period')}</div>
        )}
      </div>
    </div>
  );
};
