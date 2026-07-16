import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../../application/utils/useCurrency';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ExpenseBreakdownTabProps {
  totalExpenses: number;
  expenseChartData: Array<{ name: string; value: number }>;
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

export const ExpenseBreakdownTab: React.FC<ExpenseBreakdownTabProps> = ({
  totalExpenses,
  expenseChartData,
}) => {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();

  return (
    <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 p-6 bg-card border rounded-xl shadow-sm flex flex-col justify-center items-center text-center">
          <p className="text-sm font-medium text-muted-foreground">{t('total_expenses', 'Total Expenses')}</p>
          <p className="text-4xl font-bold mt-2 text-red-500">{formatCurrency(totalExpenses)}</p>
        </div>

        <div className="md:col-span-2 p-6 bg-card border rounded-xl shadow-sm h-[300px]">
          <h3 className="font-semibold mb-2">{t('expenses_by_category', 'Expenses by Category')}</h3>
          {expenseChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => formatCurrency(val)} contentStyle={{ borderRadius: '8px' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">{t('no_expenses_data', 'No expenses for this period')}</div>
          )}
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>{t('category', 'Category')}</TableHead>
              <TableHead className="text-right">{t('total_amount', 'Total Amount')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenseChartData.length > 0 ? (
              expenseChartData.map((e, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium capitalize">{e.name}</TableCell>
                  <TableCell className="text-right font-semibold text-red-500">{formatCurrency(e.value)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                  {t('no_expenses_found', 'No expenses found')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
