import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent } from '../components/ui/tabs';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../application/store/useSettingsStore';
import { useAuthStore } from '../../application/store/useAuthStore';
import { getMonthlyClosing, type MonthlyClosingReport } from '../../application/useCases/closing/monthlyClosing';
import { getAnalyticsData, type AnalyticsRawData } from '../../application/useCases/reports/getAnalytics';
import { printReport as thermalPrintReport } from '../../application/useCases/printing/printReport';
import { exportPdfReport } from '../../application/useCases/printing/exportPdf';
import { useToast } from '../hooks/useToast';
import { ReportingAnalyticsService } from '../../application/services/ReportingAnalyticsService';
import { CsvExportService } from '../../application/services/CsvExportService';
import { ReportsHeader } from '../features/reports/ReportsHeader';
import { SalesOverviewTab } from '../features/reports/SalesOverviewTab';
import { ProductPerformanceTab } from '../features/reports/ProductPerformanceTab';
import { ExpenseBreakdownTab } from '../features/reports/ExpenseBreakdownTab';
import { MonthlyClosingTab } from '../features/reports/MonthlyClosingTab';

export default function ReportsPage() {
  const cafeId = useAuthStore(s => s.cafeId());
  const { cafeName } = useSettingsStore();
  const { t } = useTranslation();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('sales');
  const [analytics, setAnalytics] = useState<AnalyticsRawData | null>(null);

  // Filters
  const [dateRange, setDateRange] = useState('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Legacy
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [legacyReport, setLegacyReport] = useState<MonthlyClosingReport | null>(null);

  useEffect(() => {
    if (!cafeId) return;
    getAnalyticsData(cafeId).then(setAnalytics);
  }, [cafeId]);

  useEffect(() => {
    if (!cafeId) return;
    getMonthlyClosing(cafeId, selectedMonth).then(setLegacyReport);
  }, [cafeId, selectedMonth]);

  const filteredData = useMemo(() => {
    if (!analytics) return null;
    return ReportingAnalyticsService.filterData(analytics, {
      dateRange,
      customStart,
      customEnd,
      categoryFilter,
      paymentFilter,
    });
  }, [analytics, dateRange, customStart, customEnd, categoryFilter, paymentFilter]);

  const metrics = useMemo(() => {
    if (!filteredData || !analytics) return null;
    return ReportingAnalyticsService.calculateMetrics(filteredData, analytics);
  }, [filteredData, analytics]);

  const handlePrint = async () => {
    if (activeTab === 'monthly' && legacyReport) {
      const settings = useSettingsStore.getState();
      try {
        if (settings.reportDefaultOutput === 'pdf') {
          const filePath = await exportPdfReport('monthly', legacyReport, `MonthlyClosing_${legacyReport.month}.pdf`);
          addToast(`PDF saved to: ${filePath}`, 'success');
        } else {
          await thermalPrintReport('monthly', legacyReport, t('monthly_report'));
        }
      } catch (e) {
        console.error('Failed to print', e);
        window.print();
      }
    } else {
      window.print();
    }
  };

  const exportCurrentTabToCSV = () => {
    CsvExportService.exportTab(activeTab, metrics, legacyReport, dateRange);
  };

  if (!analytics || !metrics) {
    return <div className="p-8 text-center text-muted-foreground">{t('loading', 'Loading analytics...')}</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 print:p-0 print:m-0 print:max-w-none">
      <div className="print:hidden space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <ReportsHeader
            activeTab={activeTab}
            onExportCsv={exportCurrentTabToCSV}
            onPrint={handlePrint}
            dateRange={dateRange}
            setDateRange={setDateRange}
            customStart={customStart}
            setCustomStart={setCustomStart}
            customEnd={customEnd}
            setCustomEnd={setCustomEnd}
            paymentFilter={paymentFilter}
            setPaymentFilter={setPaymentFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            categories={analytics.categories}
          />

          <TabsContent value="sales">
            <SalesOverviewTab
              totalRevenue={metrics.totalRevenue}
              totalOrders={metrics.totalOrders}
              salesChartData={metrics.salesChartData}
            />
          </TabsContent>

          <TabsContent value="products">
            <ProductPerformanceTab
              topProductsByRev={metrics.topProductsByRev}
              productArray={metrics.productArray}
            />
          </TabsContent>

          <TabsContent value="expenses">
            <ExpenseBreakdownTab
              totalExpenses={metrics.totalExpenses}
              expenseChartData={metrics.expenseChartData}
            />
          </TabsContent>

          <TabsContent value="monthly">
            <MonthlyClosingTab
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              legacyReport={legacyReport}
              cafeName={cafeName}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* When printing monthly closing, print block is inside MonthlyClosingTab */}
    </div>
  );
}
