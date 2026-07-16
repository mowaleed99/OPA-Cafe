import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../../application/utils/useCurrency';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ProductPerformanceItem } from '../../../application/services/ReportingAnalyticsService';

interface ProductPerformanceTabProps {
  topProductsByRev: ProductPerformanceItem[];
  productArray: ProductPerformanceItem[];
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

export const ProductPerformanceTab: React.FC<ProductPerformanceTabProps> = ({
  topProductsByRev,
  productArray,
}) => {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();

  return (
    <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="p-6 bg-card border rounded-xl shadow-sm h-[400px]">
        <h3 className="font-semibold mb-6">{t('top_5_products', 'Top 5 Products by Revenue')}</h3>
        {topProductsByRev.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProductsByRev} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ borderRadius: '8px' }} formatter={(val: number) => formatCurrency(val)} />
              <Bar dataKey="revenue" name={t('revenue', 'Revenue')} fill="var(--primary)" radius={[0, 4, 4, 0]}>
                {topProductsByRev.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">{t('no_product_data', 'No product data for this period')}</div>
        )}
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>{t('product', 'Product')}</TableHead>
              <TableHead>{t('category', 'Category')}</TableHead>
              <TableHead className="text-right">{t('quantity_sold', 'Quantity Sold')}</TableHead>
              <TableHead className="text-right">{t('revenue', 'Revenue')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productArray.length > 0 ? (
              productArray.map(p => (
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
                  {t('no_product_sales', 'No product sales found')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
