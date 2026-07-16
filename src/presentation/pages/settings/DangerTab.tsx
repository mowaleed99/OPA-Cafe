import React from 'react';
import { AlertCircle, CheckCircle2, Trash2, ShoppingBag, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

interface DangerTabProps {
  dangerMessage: { type: 'success' | 'error'; text: string } | null;
  menuConfirm: string;
  setMenuConfirm: (val: string) => void;
  salesConfirm: string;
  setSalesConfirm: (val: string) => void;
  purchasesConfirm: string;
  setPurchasesConfirm: (val: string) => void;
  isClearingMenu: boolean;
  isClearingSales: boolean;
  isClearingPurchases: boolean;
  handleClearMenu: () => Promise<void>;
  handleClearSales: () => Promise<void>;
  handleClearPurchases: () => Promise<void>;
}

export function DangerTab({
  dangerMessage,
  menuConfirm,
  setMenuConfirm,
  salesConfirm,
  setSalesConfirm,
  purchasesConfirm,
  setPurchasesConfirm,
  isClearingMenu,
  isClearingSales,
  isClearingPurchases,
  handleClearMenu,
  handleClearSales,
  handleClearPurchases,
}: DangerTabProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-800">
        <AlertCircle size={16} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
        <p className="text-sm text-red-700 dark:text-red-400 leading-relaxed">
          {t('danger_warning')}
        </p>
      </div>

      {dangerMessage && (
        <div className={`flex items-center gap-3 p-4 rounded-lg border text-sm ${
          dangerMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800'
        }`}>
          <CheckCircle2 size={16} className="shrink-0" />
          {dangerMessage.text}
        </div>
      )}

      <div className="bg-card border border-red-200 dark:border-red-900 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-red-100 dark:border-red-900 bg-red-50/60 dark:bg-red-950/20">
          <Trash2 size={15} className="text-red-500" />
          <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 tracking-wide uppercase">{t('clear_menu_title')}</h3>
        </div>
        <div className="px-6 py-5">
          <h4 className="font-semibold text-sm text-foreground mb-1">{t('clear_menu_subtitle')}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            {t('clear_menu_desc')}
          </p>
          <div className="flex gap-2 items-center">
            <Input
              placeholder={t('type_delete')}
              value={menuConfirm}
              onChange={(e) => setMenuConfirm(e.target.value)}
              className="w-52 border-red-300 focus-visible:ring-red-400 dark:border-red-700"
            />
            <Button
              variant="destructive"
              disabled={menuConfirm !== 'DELETE' || isClearingMenu}
              onClick={handleClearMenu}
              className="shrink-0 flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              {isClearingMenu ? t('clearing') : t('clear_menu_btn')}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-red-200 dark:border-red-900 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-red-100 dark:border-red-900 bg-red-50/60 dark:bg-red-950/20">
          <ShoppingBag size={15} className="text-red-500" />
          <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 tracking-wide uppercase">{t('clear_sales_title')}</h3>
        </div>
        <div className="px-6 py-5">
          <h4 className="font-semibold text-sm text-foreground mb-1">{t('clear_sales_subtitle')}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            {t('clear_sales_desc')}
          </p>
          <div className="flex gap-2 items-center">
            <Input
              placeholder={t('type_delete')}
              value={salesConfirm}
              onChange={(e) => setSalesConfirm(e.target.value)}
              className="w-52 border-red-300 focus-visible:ring-red-400 dark:border-red-700"
            />
            <Button
              variant="destructive"
              disabled={salesConfirm !== 'DELETE' || isClearingSales}
              onClick={handleClearSales}
              className="shrink-0 flex items-center gap-1.5"
            >
              <ShoppingBag size={14} />
              {isClearingSales ? t('clearing') : t('clear_sales_btn')}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-red-200 dark:border-red-900 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-red-100 dark:border-red-900 bg-red-50/60 dark:bg-red-950/20">
          <Truck size={15} className="text-red-500" />
          <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 tracking-wide uppercase">{t('clear_purchases_title')}</h3>
        </div>
        <div className="px-6 py-5">
          <h4 className="font-semibold text-sm text-foreground mb-1">{t('clear_purchases_subtitle')}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            {t('clear_purchases_desc')}
          </p>
          <div className="flex gap-2 items-center">
            <Input
              placeholder={t('type_delete')}
              value={purchasesConfirm}
              onChange={(e) => setPurchasesConfirm(e.target.value)}
              className="w-52 border-red-300 focus-visible:ring-red-400 dark:border-red-700"
            />
            <Button
              variant="destructive"
              disabled={purchasesConfirm !== 'DELETE' || isClearingPurchases}
              onClick={handleClearPurchases}
              className="shrink-0 flex items-center gap-1.5"
            >
              <Truck size={14} />
              {isClearingPurchases ? t('clearing') : t('clear_purchases_btn')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
