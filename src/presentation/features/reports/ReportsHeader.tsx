import React from 'react';
import { Button } from '../../components/ui/button';
import { TabsList, TabsTrigger } from '../../components/ui/tabs';
import { TrendingUp, ShoppingBag, Download, FileText, Calendar, Filter, PieChart as PieChartIcon, Receipt } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Category } from '../../../domain/entities/category';

interface ReportsHeaderProps {
  activeTab: string;
  onExportCsv: () => void;
  onPrint: () => void;
  dateRange: string;
  setDateRange: (val: string) => void;
  customStart: string;
  setCustomStart: (val: string) => void;
  customEnd: string;
  setCustomEnd: (val: string) => void;
  paymentFilter: string;
  setPaymentFilter: (val: string) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  categories: Category[];
}

export const ReportsHeader: React.FC<ReportsHeaderProps> = ({
  activeTab,
  onExportCsv,
  onPrint,
  dateRange,
  setDateRange,
  customStart,
  setCustomStart,
  customEnd,
  setCustomEnd,
  paymentFilter,
  setPaymentFilter,
  categoryFilter,
  setCategoryFilter,
  categories,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">{t('reports_analytics', 'Reports & Analytics')}</h1>
          <p className="text-muted-foreground">{t('reports_desc', 'Analyze your cafe performance')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onExportCsv} className="gap-2">
            <Download className="h-4 w-4" /> {t('export_csv', 'Export CSV')}
          </Button>
          {activeTab === 'monthly' && (
            <Button variant="outline" onClick={onPrint} className="gap-2">
              <FileText className="h-4 w-4" /> {t('print_btn', 'Print')}
            </Button>
          )}
        </div>
      </div>

      <TabsList className="grid w-full grid-cols-4 max-w-2xl bg-muted/50 p-1">
        <TabsTrigger value="sales" className="data-[state=active]:bg-background data-[state=active]:shadow-sm"><TrendingUp className="w-4 h-4 me-2" />{t('sales', 'Sales')}</TabsTrigger>
        <TabsTrigger value="products" className="data-[state=active]:bg-background data-[state=active]:shadow-sm"><ShoppingBag className="w-4 h-4 me-2" />{t('products', 'Products')}</TabsTrigger>
        <TabsTrigger value="expenses" className="data-[state=active]:bg-background data-[state=active]:shadow-sm"><PieChartIcon className="w-4 h-4 me-2" />{t('expenses', 'Expenses')}</TabsTrigger>
        <TabsTrigger value="monthly" className="data-[state=active]:bg-background data-[state=active]:shadow-sm"><Receipt className="w-4 h-4 me-2" />{t('monthly_closing', 'Monthly Closing')}</TabsTrigger>
      </TabsList>

      {activeTab !== 'monthly' && (
        <div className="flex flex-wrap gap-4 p-4 mt-6 bg-card border rounded-xl shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <select
              className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="today">{t('filter_today', 'Today')}</option>
              <option value="this_week">{t('filter_this_week', 'This Week')}</option>
              <option value="this_month">{t('filter_this_month', 'This Month')}</option>
              <option value="custom">{t('filter_custom_range', 'Custom Range')}</option>
            </select>
          </div>

          {dateRange === 'custom' && (
            <div className="flex items-center gap-2">
              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="h-8 text-sm rounded border px-2" />
              <span className="text-muted-foreground">{t('filter_to', 'to')}</span>
              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="h-8 text-sm rounded border px-2" />
            </div>
          )}

          <div className="flex items-center gap-2 border-s ps-4 ms-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="all">{t('filter_all_payments', 'All Payments')}</option>
              <option value="cash">{t('filter_cash', 'Cash')}</option>
              <option value="card">{t('filter_card', 'Card')}</option>
            </select>
          </div>

          <div className="flex items-center gap-2 border-s ps-4 ms-2">
            <select
              className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">{t('filter_all_categories', 'All Categories')}</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
