import type { AnalyticsMetrics } from './ReportingAnalyticsService';
import type { MonthlyClosingReport } from '../useCases/closing/monthlyClosing';

export class CsvExportService {
  static downloadCsv(filename: string, csvContent: string): void {
    if (typeof document === 'undefined' || !csvContent) return;
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static exportSalesCsv(metrics: AnalyticsMetrics, dateRange: string): void {
    const filename = `sales-report-${dateRange}.csv`;
    let csvContent = `Date,Revenue\n`;
    metrics.salesChartData.forEach(d => {
      csvContent += `${d.date},${d.total}\n`;
    });
    csvContent += `\nTotal Orders,${metrics.totalOrders}\nTotal Revenue,${metrics.totalRevenue}\n`;
    this.downloadCsv(filename, csvContent);
  }

  static exportProductsCsv(metrics: AnalyticsMetrics, dateRange: string): void {
    const filename = `product-performance-${dateRange}.csv`;
    let csvContent = `Product,Category,Quantity Sold,Revenue\n`;
    metrics.productArray.forEach(p => {
      const safeName = `"${p.name.replace(/"/g, '""')}"`;
      const safeCat = `"${p.category.replace(/"/g, '""')}"`;
      csvContent += `${safeName},${safeCat},${p.quantity},${p.revenue}\n`;
    });
    this.downloadCsv(filename, csvContent);
  }

  static exportExpensesCsv(metrics: AnalyticsMetrics, dateRange: string): void {
    const filename = `expense-report-${dateRange}.csv`;
    let csvContent = `Category,Total Amount\n`;
    metrics.expenseChartData.forEach(e => {
      csvContent += `"${e.name}",${e.value}\n`;
    });
    csvContent += `\nTotal Expenses,${metrics.totalExpenses}\n`;
    this.downloadCsv(filename, csvContent);
  }

  static exportMonthlyCsv(legacyReport: MonthlyClosingReport): void {
    const filename = `monthly-closing-${legacyReport.month}.csv`;
    let csvContent = `Monthly Closing Report - ${legacyReport.month}\n\n`;
    csvContent += `Total Orders,${legacyReport.total_orders}\n`;
    csvContent += `Total Sales,${legacyReport.total_sales}\n`;
    csvContent += `Total COGS,${legacyReport.total_cost_of_goods}\n`;
    csvContent += `Total Explicit Expenses,${legacyReport.total_explicit_expenses}\n`;
    csvContent += `Total Expenses (Combined),${legacyReport.total_expenses}\n`;
    this.downloadCsv(filename, csvContent);
  }

  static exportTab(activeTab: string, metrics: AnalyticsMetrics | null, legacyReport: MonthlyClosingReport | null, dateRange: string): void {
    if (activeTab === 'sales' && metrics) {
      this.exportSalesCsv(metrics, dateRange);
    } else if (activeTab === 'products' && metrics) {
      this.exportProductsCsv(metrics, dateRange);
    } else if (activeTab === 'expenses' && metrics) {
      this.exportExpensesCsv(metrics, dateRange);
    } else if (activeTab === 'monthly' && legacyReport) {
      this.exportMonthlyCsv(legacyReport);
    }
  }
}
