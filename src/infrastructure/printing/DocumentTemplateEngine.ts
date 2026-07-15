export class DocumentTemplateEngine {
  private static getThermalStyles(paperSize: '58mm' | '80mm' | 'custom' = '80mm', language: string = 'en') {
    const width = paperSize === '58mm' ? '58mm' : paperSize === '80mm' ? '80mm' : '100%';
    const isRtl = language === 'ar';
    const direction = isRtl ? 'rtl' : 'ltr';
    const textAlignRight = isRtl ? 'left' : 'right';
    const textAlignLeft = isRtl ? 'right' : 'left';
    return `
      <style>
        body {
          font-family: 'Courier New', Courier, monospace, Tahoma, Arial, sans-serif;
          font-size: 12px;
          line-height: 1.2;
          width: ${width};
          margin: 0 auto;
          padding: 10px;
          color: #000;
          background: #fff;
          direction: ${direction};
        }
        * { box-sizing: border-box; }
        .text-center { text-align: center; }
        .text-right { text-align: ${textAlignRight}; }
        .text-left { text-align: ${textAlignLeft}; }
        .font-bold { font-weight: bold; }
        .mb-1 { margin-bottom: 4px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-4 { margin-bottom: 16px; }
        .mt-2 { margin-top: 8px; }
        .mt-4 { margin-top: 16px; }
        .divider { border-top: 1px dashed #000; margin: 8px 0; }
        .flex { display: flex; }
        .justify-between { justify-content: space-between; }
        .item-row { margin-bottom: 6px; }
        .item-name { font-weight: bold; }
        .item-details { display: flex; justify-content: space-between; padding-left: ${isRtl ? '0' : '8px'}; padding-right: ${isRtl ? '8px' : '0'}; font-size: 11px; }
        .totals-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .totals-row.grand-total { font-weight: bold; font-size: 14px; border-top: 1px solid #000; padding-top: 4px; }
        h1, h2, h3, h4 { margin: 0 0 8px 0; }
      </style>
    `;
  }

  static generateReceipt(
    order: any, 
    items: any[], 
    settings: any,
    currency: string = 'EGP'
  ): string {
    const { 
      cafeName = 'OPA Cafe', 
      paperSize = '80mm',
      receiptTemplateConfig = { showLogo: true, showCashier: true, showDiscount: true, footerMessage: 'Thank you for your visit!' }
    } = settings;

    const styles = this.getThermalStyles(paperSize, settings.language);
    
    let html = `<!DOCTYPE html><html dir="${settings.language === 'ar' ? 'rtl' : 'ltr'}"><head>${styles}</head><body>`;
    
    html += `<div class="text-center mb-4">`;
    if (receiptTemplateConfig.showLogo) {
      // In a real app we might inject base64 image here.
    }
    html += `<h2>${cafeName}</h2>`;
    html += `<div>Order: #${order.id.slice(0,8).toUpperCase()}</div>`;
    html += `<div>Date: ${new Date(order.created_at).toLocaleString()}</div>`;
    if (receiptTemplateConfig.showCashier) {
      html += `<div>Cashier: ${order.cashier_id || 'Owner'}</div>`;
    }
    html += `</div>`;
    html += `<div class="divider"></div>`;

    html += `<div class="mb-2">`;
    items.forEach(item => {
      html += `
        <div class="item-row">
          <div class="item-name">${item.product_name || 'Item'}</div>
          <div class="item-details">
            <span>${item.quantity} x ${item.unit_price}</span>
            <span>${item.subtotal} ${currency}</span>
          </div>
        </div>
      `;
    });
    html += `</div>`;
    
    html += `<div class="divider"></div>`;
    html += `<div class="mb-4">`;
    html += `
      <div class="totals-row">
        <span>Subtotal:</span>
        <span>${order.subtotal || order.total_amount} ${currency}</span>
      </div>
    `;
    
    if (receiptTemplateConfig.showDiscount && order.discount_amount > 0) {
      html += `
        <div class="totals-row">
          <span>Discount:</span>
          <span>-${order.discount_amount} ${currency}</span>
        </div>
      `;
    }
    
    html += `
      <div class="totals-row grand-total">
        <span>Total:</span>
        <span>${order.total_amount} ${currency}</span>
      </div>
    `;
    html += `
      <div class="totals-row mt-2">
        <span>Payment Method:</span>
        <span>${order.payment_method?.toUpperCase()}</span>
      </div>
    `;
    html += `</div>`;

    if (receiptTemplateConfig.footerMessage) {
      html += `<div class="text-center mt-4 mb-4"><p>${receiptTemplateConfig.footerMessage}</p></div>`;
    }

    html += `</body></html>`;
    return html;
  }

  static generateDailyReport(report: any, settings: any, currency: string = 'EGP'): string {
    const { cafeName = 'OPA Cafe', paperSize = '80mm' } = settings;
    const styles = this.getThermalStyles(paperSize, settings.language);

    let html = `<!DOCTYPE html><html dir="${settings.language === 'ar' ? 'rtl' : 'ltr'}"><head>${styles}</head><body>`;
    
    html += `<div class="text-center mb-4">`;
    html += `<h2>${cafeName}</h2>`;
    html += `<h3>Daily Closing Report</h3>`;
    html += `<div>Date: ${report.closing.closing_date}</div>`;
    html += `</div>`;
    html += `<div class="divider"></div>`;

    // Sales Overview
    html += `<h4 class="mt-4">Sales Overview</h4>`;
    html += `<div class="item-row"><div class="item-details"><span>Total Sales:</span><span>${report.metrics?.totalSales} ${currency}</span></div></div>`;
    html += `<div class="item-row"><div class="item-details"><span>Total Orders:</span><span>${report.metrics?.totalOrders}</span></div></div>`;
    html += `<div class="item-row"><div class="item-details"><span>AOV:</span><span>${Math.round(report.metrics?.averageOrderValue || 0)} ${currency}</span></div></div>`;
    html += `<div class="item-row"><div class="item-details"><span>Items Sold:</span><span>${report.metrics?.totalItemsSold}</span></div></div>`;
    
    // Payment Methods
    html += `<h4 class="mt-4">Payments Breakdown</h4>`;
    html += `<div class="item-row"><div class="item-details"><span>Cash:</span><span>${report.metrics?.paymentMethods?.cash?.amount || 0} ${currency}</span></div></div>`;
    html += `<div class="item-row"><div class="item-details"><span>Card:</span><span>${report.metrics?.paymentMethods?.card?.amount || 0} ${currency}</span></div></div>`;
    html += `<div class="item-row"><div class="item-details"><span>Debt/Other:</span><span>${report.metrics?.paymentMethods?.other?.amount || 0} ${currency}</span></div></div>`;
    
    // Profit
    html += `<div class="divider"></div>`;
    html += `<h4 class="mt-2">Profit Analysis</h4>`;
    html += `<div class="item-row"><div class="item-details"><span>Revenue:</span><span>${report.metrics?.profit?.revenue} ${currency}</span></div></div>`;
    html += `<div class="item-row"><div class="item-details"><span>COGS:</span><span>${report.metrics?.profit?.cogs} ${currency}</span></div></div>`;
    html += `<div class="item-row"><div class="item-details"><span>Expenses:</span><span>${report.metrics?.profit?.expenses} ${currency}</span></div></div>`;
    html += `<div class="totals-row grand-total mt-2"><span>Net Profit:</span><span>${report.metrics?.profit?.netProfit} ${currency}</span></div>`;
    html += `<div class="item-row"><div class="item-details"><span>Margin:</span><span>${Math.round(report.metrics?.profit?.profitMargin || 0)}%</span></div></div>`;

    // Categories and Detailed Items
    html += `<div class="divider"></div>`;
    html += `<h4 class="mt-2">Items by Category</h4>`;
    
    // Group items by category
    const itemsByCategory: Record<string, any[]> = {};
    report.items?.forEach((item: any) => {
      const cat = item.category_name || 'Unknown';
      if (!itemsByCategory[cat]) itemsByCategory[cat] = [];
      itemsByCategory[cat].push(item);
    });

    Object.keys(itemsByCategory).forEach(catName => {
      const catItems = itemsByCategory[catName];
      const catTotalQty = catItems.reduce((sum, i) => sum + i.quantity_sold, 0);
      const catTotalRev = catItems.reduce((sum, i) => sum + i.total_sales, 0);
      
      html += `<div class="item-row mt-2" style="font-weight: bold; text-decoration: underline;">
        ${catName} (Qty: ${catTotalQty} - ${catTotalRev} ${currency})
      </div>`;
      
      catItems.forEach(item => {
        html += `<div class="item-details">
          <span>- ${item.product_name} x${item.quantity_sold}</span>
          <span>${item.total_sales} ${currency}</span>
        </div>`;
      });
    });

    // Expenses & Purchases
    if (report.metrics?.expensesByCategory && report.metrics.expensesByCategory.length > 0) {
      html += `<div class="divider"></div>`;
      html += `<h4 class="mt-2">Expenses & Purchases</h4>`;
      report.metrics.expensesByCategory.forEach((exp: any) => {
        html += `<div class="item-row">
          <div class="item-details">
            <span>${exp.name} (x${exp.count})</span>
            <span>${exp.amount} ${currency}</span>
          </div>
        </div>`;
      });
    }

    html += `<div class="text-center mt-4 mb-4"><p>End of Report</p></div>`;
    html += `</body></html>`;
    return html;
  }

  static generateA4DailyReport(report: any, settings: any, currency: string = 'EGP'): string {
    const { cafeName = 'OPA Cafe', language = 'en' } = settings;
    const isRtl = language === 'ar';
    const align = isRtl ? 'right' : 'left';
    const dir = isRtl ? 'rtl' : 'ltr';

    let html = `<!DOCTYPE html>
<html dir="${dir}">
<head>
<meta charset="utf-8">
<style>
  body { 
    font-family: Tahoma, Arial, sans-serif; 
    padding: 40px; 
    color: #000;
  }
  table { width: 100%; border-collapse: collapse; margin-bottom: 30px; text-align: ${align}; }
  th, td { border: 1px solid #000; padding: 10px; }
  th { background-color: #f3f4f6; font-weight: bold; }
  h1, h2, h3 { margin: 0 0 10px 0; }
  .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
  .text-right { text-align: ${isRtl ? 'left' : 'right'}; }
  .text-center { text-align: center; }
  .bg-gray { background-color: #f9fafb; font-weight: bold; }
  .text-red { color: #dc2626; }
</style>
</head>
<body>

<div class="header">
  <div>
    <h1 style="text-transform: uppercase;">${cafeName}</h1>
    <h2>Daily Report</h2>
  </div>
  <div>
    <p style="font-size: 18px; font-weight: bold;">${report.closing.closing_date}</p>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th class="text-center">Total Orders</th>
      <th class="text-center">Total Sales</th>
      <th class="text-center">Avg Order</th>
      <th class="text-center">Expenses</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="text-center font-bold" style="font-size: 18px;">${report.closing.total_orders}</td>
      <td class="text-center font-bold" style="font-size: 18px;">${report.closing.total_sales.toFixed(2)} ${currency}</td>
      <td class="text-center font-bold" style="font-size: 18px;">
        ${report.closing.total_orders > 0 ? (report.closing.total_sales / report.closing.total_orders).toFixed(2) : '0.00'} ${currency}
      </td>
      <td class="text-center font-bold text-red" style="font-size: 18px;">${(report.expenses || 0).toFixed(2)} ${currency}</td>
    </tr>
  </tbody>
</table>

<h3>Sales Breakdown</h3>
<table>
  <thead>
    <tr>
      <th>Product</th>
      <th>Category</th>
      <th class="text-right">Qty Sold</th>
      <th class="text-right">Revenue</th>
    </tr>
  </thead>
  <tbody>`;

    const byCategory: Record<string, { qty: number, rev: number, items: any[] }> = {};
    report.items?.forEach((item: any) => {
      const cat = item.category_name || 'Unknown';
      if (!byCategory[cat]) byCategory[cat] = { qty: 0, rev: 0, items: [] };
      byCategory[cat].qty += item.quantity_sold;
      byCategory[cat].rev += item.total_sales;
      byCategory[cat].items.push(item);
    });

    Object.entries(byCategory).forEach(([catName, data]) => {
      html += `
      <tr class="bg-gray">
        <td colspan="2">${catName} (Total)</td>
        <td class="text-right">${data.qty}</td>
        <td class="text-right">${data.rev.toFixed(2)} ${currency}</td>
      </tr>`;
      data.items.forEach((item: any) => {
        html += `
        <tr>
          <td style="padding-${isRtl ? 'right' : 'left'}: 30px;">${item.product_name || item.product_id}</td>
          <td style="color: #6b7280;">${catName}</td>
          <td class="text-right">${item.quantity_sold}</td>
          <td class="text-right">${item.total_sales.toFixed(2)} ${currency}</td>
        </tr>`;
      });
    });

    html += `
  </tbody>
</table>`;

    if (report.payments && report.payments.length > 0) {
      html += `
<h3>Purchase Details</h3>
<table>
  <thead>
    <tr>
      <th>Supplier</th>
      <th>Notes</th>
      <th class="text-right">Amount Paid</th>
    </tr>
  </thead>
  <tbody>`;
      report.payments.forEach((payment: any) => {
        html += `
        <tr>
          <td style="font-weight: bold;">${payment.supplierName}</td>
          <td style="color: #6b7280;">${payment.notes || '-'}</td>
          <td class="text-right text-red font-bold">${payment.amount.toFixed(2)} ${currency}</td>
        </tr>`;
      });
      html += `
  </tbody>
</table>`;
    }

    if (report.metrics?.expensesByCategory && report.metrics.expensesByCategory.length > 0) {
      const directExpenses = report.metrics.expensesByCategory.filter((e: any) => e.name !== 'Purchases');
      if (directExpenses.length > 0) {
        html += `
<h3>Other Expenses</h3>
<table>
  <thead>
    <tr>
      <th>Expense Category</th>
      <th>Count</th>
      <th class="text-right">Amount</th>
    </tr>
  </thead>
  <tbody>`;
        directExpenses.forEach((exp: any) => {
          html += `
          <tr>
            <td style="font-weight: bold;">${exp.name}</td>
            <td>${exp.count}</td>
            <td class="text-right text-red font-bold">${exp.amount.toFixed(2)} ${currency}</td>
          </tr>`;
        });
        html += `
    </tbody>
  </table>`;
      }
    }

    html += `
</body>
</html>`;
    return html;
  }

  static generateMonthlyReport(report: any, settings: any, currency: string = 'EGP'): string {
    const { cafeName = 'OPA Cafe', paperSize = '80mm' } = settings;
    const styles = this.getThermalStyles(paperSize, settings.language);

    let html = `<!DOCTYPE html><html dir="${settings.language === 'ar' ? 'rtl' : 'ltr'}"><head>${styles}</head><body>`;
    
    html += `<div class="text-center mb-4">`;
    html += `<h2>${cafeName}</h2>`;
    html += `<h3>Monthly Closing Report</h3>`;
    html += `<div>Month: ${report.month}</div>`;
    html += `</div>`;
    html += `<div class="divider"></div>`;

    html += `<h4 class="mt-4">Financial Overview</h4>`;
    html += `<div class="item-row"><div class="item-details"><span>Revenue:</span><span>${report.metrics?.profit?.income} ${currency}</span></div></div>`;
    html += `<div class="item-row"><div class="item-details"><span>Expenses:</span><span>${report.metrics?.profit?.expenses} ${currency}</span></div></div>`;
    html += `<div class="totals-row grand-total mt-2"><span>Net Profit:</span><span>${report.metrics?.profit?.netProfit} ${currency}</span></div>`;
    html += `<div class="item-row"><div class="item-details"><span>Margin:</span><span>${Math.round(report.metrics?.profit?.profitPercentage || 0)}%</span></div></div>`;

    html += `<div class="divider"></div>`;
    html += `<h4 class="mt-2">Sales Stats</h4>`;
    html += `<div class="item-row"><div class="item-details"><span>Total Orders:</span><span>${report.total_orders}</span></div></div>`;
    if (report.metrics?.bestSalesDay) {
      html += `<div class="item-row"><div class="item-details"><span>Best Day:</span><span>${report.metrics.bestSalesDay.date} (${report.metrics.bestSalesDay.revenue} ${currency})</span></div></div>`;
    }

    html += `<div class="divider"></div>`;
    html += `<h4 class="mt-2">Category Performance</h4>`;
    report.metrics?.categoryDistribution?.forEach((cat: any) => {
      html += `<div class="item-row">
        <div class="item-name">${cat.name} (${cat.percentage}%)</div>
        <div class="item-details"><span>Revenue:</span><span>${cat.revenue} ${currency}</span></div>
      </div>`;
    });

    html += `<div class="text-center mt-4 mb-4"><p>End of Report</p></div>`;
    html += `</body></html>`;
    return html;
  }

  static generateA4MonthlyReport(report: any, settings: any, currency: string = 'EGP'): string {
    const { cafeName = 'OPA Cafe', language = 'en' } = settings;
    const isRtl = language === 'ar';
    const align = isRtl ? 'right' : 'left';
    const dir = isRtl ? 'rtl' : 'ltr';

    let html = `<!DOCTYPE html>
<html dir="${dir}">
<head>
<meta charset="utf-8">
<style>
  body { 
    font-family: Tahoma, Arial, sans-serif; 
    padding: 40px; 
    color: #000;
  }
  table { width: 100%; border-collapse: collapse; margin-bottom: 30px; text-align: ${align}; }
  th, td { border: 1px solid #000; padding: 10px; }
  th { background-color: #f3f4f6; font-weight: bold; }
  h1, h2, h3 { margin: 0 0 10px 0; }
  .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
  .text-right { text-align: ${isRtl ? 'left' : 'right'}; }
  .text-center { text-align: center; }
  .bg-gray { background-color: #f9fafb; font-weight: bold; }
  .text-red { color: #dc2626; }
  .text-green { color: #16a34a; }
  .text-orange { color: #ea580c; }
</style>
</head>
<body>

<div class="header">
  <div>
    <h1 style="text-transform: uppercase;">${cafeName}</h1>
    <h2>Monthly Report</h2>
  </div>
  <div>
    <p style="font-size: 18px; font-weight: bold;">Month: ${report.month}</p>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th class="text-center">Total Orders</th>
      <th class="text-center">Total Sales</th>
      <th class="text-center">Cost of Goods</th>
      <th class="text-center">Explicit Expenses</th>
      <th class="text-center">Net Profit</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="text-center font-bold" style="font-size: 18px;">${report.total_orders}</td>
      <td class="text-center font-bold" style="font-size: 18px;">${report.total_sales.toFixed(2)} ${currency}</td>
      <td class="text-center font-bold text-orange" style="font-size: 18px;">${(report.total_cost_of_goods || 0).toFixed(2)} ${currency}</td>
      <td class="text-center font-bold text-red" style="font-size: 18px;">${(report.total_explicit_expenses || 0).toFixed(2)} ${currency}</td>
      <td class="text-center font-bold text-green" style="font-size: 18px;">
        ${(report.total_sales - (report.total_cost_of_goods || 0) - (report.total_explicit_expenses || 0)).toFixed(2)} ${currency}
      </td>
    </tr>
  </tbody>
</table>`;

    if (report.metrics?.categoryDistribution && report.metrics.categoryDistribution.length > 0) {
      html += `
<h3>Category Performance</h3>
<table>
  <thead>
    <tr>
      <th>Category Name</th>
      <th class="text-right">Percentage</th>
      <th class="text-right">Revenue</th>
    </tr>
  </thead>
  <tbody>`;
      report.metrics.categoryDistribution.forEach((cat: any) => {
        html += `
        <tr>
          <td style="font-weight: bold;">${cat.name}</td>
          <td class="text-right">${cat.percentage}%</td>
          <td class="text-right">${cat.revenue.toFixed(2)} ${currency}</td>
        </tr>`;
      });
      html += `
  </tbody>
</table>`;
    }

    html += `
</body>
</html>`;
    return html;
  }
}
