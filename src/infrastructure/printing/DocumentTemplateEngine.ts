export class DocumentTemplateEngine {
  private static getThermalStyles(paperSize: '58mm' | '80mm' | 'custom' = '80mm') {
    const width = paperSize === '58mm' ? '58mm' : paperSize === '80mm' ? '80mm' : '100%';
    return `
      <style>
        body {
          font-family: 'Courier New', Courier, monospace;
          font-size: 12px;
          line-height: 1.2;
          width: ${width};
          margin: 0 auto;
          padding: 10px;
          color: #000;
          background: #fff;
        }
        * { box-sizing: border-box; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
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
        .item-details { display: flex; justify-content: space-between; padding-left: 8px; font-size: 11px; }
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

    const styles = this.getThermalStyles(paperSize);
    
    let html = `<!DOCTYPE html><html><head>${styles}</head><body>`;
    
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
    const styles = this.getThermalStyles(paperSize);

    let html = `<!DOCTYPE html><html><head>${styles}</head><body>`;
    
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
    html += `<div class="item-row"><div class="item-details"><span>Cash:</span><span>${report.metrics?.paymentMethods?.cash?.amount} ${currency}</span></div></div>`;
    html += `<div class="item-row"><div class="item-details"><span>Card:</span><span>${report.metrics?.paymentMethods?.card?.amount} ${currency}</span></div></div>`;
    
    // Profit
    html += `<div class="divider"></div>`;
    html += `<h4 class="mt-2">Profit Analysis</h4>`;
    html += `<div class="item-row"><div class="item-details"><span>Revenue:</span><span>${report.metrics?.profit?.revenue} ${currency}</span></div></div>`;
    html += `<div class="item-row"><div class="item-details"><span>COGS:</span><span>${report.metrics?.profit?.cogs} ${currency}</span></div></div>`;
    html += `<div class="item-row"><div class="item-details"><span>Expenses:</span><span>${report.metrics?.profit?.expenses} ${currency}</span></div></div>`;
    html += `<div class="totals-row grand-total mt-2"><span>Net Profit:</span><span>${report.metrics?.profit?.netProfit} ${currency}</span></div>`;
    html += `<div class="item-row"><div class="item-details"><span>Margin:</span><span>${Math.round(report.metrics?.profit?.profitMargin || 0)}%</span></div></div>`;

    // Categories
    html += `<div class="divider"></div>`;
    html += `<h4 class="mt-2">Categories</h4>`;
    report.metrics?.categories?.forEach((cat: any) => {
      html += `<div class="item-row">
        <div class="item-name">${cat.name}</div>
        <div class="item-details"><span>Qty: ${cat.quantity}</span><span>${cat.revenue} ${currency}</span></div>
      </div>`;
    });

    html += `<div class="text-center mt-4 mb-4"><p>End of Report</p></div>`;
    html += `</body></html>`;
    return html;
  }

  static generateMonthlyReport(report: any, settings: any, currency: string = 'EGP'): string {
    const { cafeName = 'OPA Cafe', paperSize = '80mm' } = settings;
    const styles = this.getThermalStyles(paperSize);

    let html = `<!DOCTYPE html><html><head>${styles}</head><body>`;
    
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
}
