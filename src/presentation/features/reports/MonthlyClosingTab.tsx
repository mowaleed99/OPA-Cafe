import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../../application/utils/useCurrency';
import { ShoppingBag, TrendingUp } from 'lucide-react';
import type { MonthlyClosingReport } from '../../../application/useCases/closing/monthlyClosing';

interface MonthlyClosingTabProps {
  selectedMonth: string;
  setSelectedMonth: (val: string) => void;
  legacyReport: MonthlyClosingReport | null;
  cafeName: string;
}

export const MonthlyClosingTab: React.FC<MonthlyClosingTabProps> = ({
  selectedMonth,
  setSelectedMonth,
  legacyReport,
  cafeName,
}) => {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();

  return (
    <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-3 mb-6 p-4 bg-card border rounded-xl shadow-sm">
        <span className="font-medium">{t('select_closing_month', 'Select Closing Month:')}</span>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
        />
      </div>

      {legacyReport && (
        <>
          <div className="rounded-xl border bg-card shadow-sm p-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <ShoppingBag className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-2xl font-bold">{legacyReport.total_orders}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('total_orders')}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(legacyReport.total_sales)}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('total_sales')}</p>
              </div>
              <div className="rounded-lg bg-orange-500/10 p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-1 text-orange-500" />
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(legacyReport.total_cost_of_goods || 0)}</p>
                <p className="text-xs text-orange-600 mt-1">{t('cost_of_goods')}</p>
              </div>
              <div className="rounded-lg bg-red-500/10 p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-1 text-red-500" />
                <p className="text-2xl font-bold text-red-600">{formatCurrency(legacyReport.total_explicit_expenses || 0)}</p>
                <p className="text-xs text-red-500 mt-1">{t('explicit_expenses')}</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
              <strong>{t('note', 'Note:')}</strong> {t('monthly_report_note_1', 'This report is generated strictly from Closed Shifts data for accounting purposes.')}{' '}
              {t('monthly_report_note_2', 'For real-time and custom date analytics, use the other tabs.')}
            </div>
          </div>

          {/* Hidden block for Legacy Print */}
          <div className="hidden print:block w-full bg-white text-black p-8 font-sans">
            <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-6">
              <div>
                <h1 className="text-4xl font-bold uppercase tracking-widest">{cafeName}</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mt-1">{t('monthly_report')}</h2>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium text-gray-600">{t('month_label')}: {legacyReport.month}</p>
              </div>
            </div>
            <table className="w-full mb-8 border-collapse border border-black">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-2 text-center text-sm font-bold">{t('total_orders')}</th>
                  <th className="border border-black p-2 text-center text-sm font-bold">{t('total_sales')}</th>
                  <th className="border border-black p-2 text-center text-sm font-bold">{t('cost_of_goods')}</th>
                  <th className="border border-black p-2 text-center text-sm font-bold">{t('explicit_expenses')}</th>
                  <th className="border border-black p-2 text-center text-sm font-bold">{t('net_profit')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2 text-center font-bold text-lg">{legacyReport.total_orders}</td>
                  <td className="border border-black p-2 text-center font-bold text-lg">{formatCurrency(legacyReport.total_sales)}</td>
                  <td className="border border-black p-2 text-center font-bold text-lg text-orange-600">{formatCurrency(legacyReport.total_cost_of_goods || 0)}</td>
                  <td className="border border-black p-2 text-center font-bold text-lg text-red-600">{formatCurrency(legacyReport.total_explicit_expenses || 0)}</td>
                  <td className="border border-black p-2 text-center font-bold text-lg text-green-600">
                    {formatCurrency(legacyReport.total_sales - (legacyReport.total_cost_of_goods || 0) - (legacyReport.total_explicit_expenses || 0))}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="mt-16 text-center text-sm text-gray-400">
              <p>{t('end_of_monthly_report')}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
