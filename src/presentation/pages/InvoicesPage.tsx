import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../application/store/useAuthStore';
import { useSettingsStore } from '../../application/store/useSettingsStore';
import { SalesInvoicesTable } from '../features/invoices/SalesInvoicesTable';
import { SupplierInvoicesTable } from '../features/invoices/SupplierInvoicesTable';
import { FileText, Truck, Receipt } from 'lucide-react';

type InvoicesTab = 'sales' | 'supplier';

export default function InvoicesPage() {
  const { t } = useTranslation();
  const { cashierPermissions } = useSettingsStore();
  const isOwner = useAuthStore(s => s.isOwner());
  const [activeTab, setActiveTab] = useState<InvoicesTab>('sales');

  const canSeeSales = isOwner || cashierPermissions.includes('invoices_sales');
  const canSeeSupplier = isOwner || cashierPermissions.includes('invoices_supplier');

  // Default to supplier tab if cashier only has supplier access
  useEffect(() => {
    if (!canSeeSales && canSeeSupplier) setActiveTab('supplier');
  }, [canSeeSales, canSeeSupplier]);

  const tabs = [
    { id: 'sales' as const, labelKey: 'sales_invoices', icon: FileText, show: canSeeSales },
    { id: 'supplier' as const, labelKey: 'supplier_invoices', icon: Truck, show: canSeeSupplier },
  ].filter(t => t.show);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Receipt size={22} className="text-primary" />
          {t('invoices')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t('invoices_desc')}</p>
      </div>

      {/* Tab switcher */}
      {tabs.length > 1 && (
        <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon size={15} />
                {t(tab.labelKey)}
              </button>
            );
          })}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'sales' && canSeeSales && <SalesInvoicesTable />}
      {activeTab === 'supplier' && canSeeSupplier && <SupplierInvoicesTable />}
    </div>
  );
}
