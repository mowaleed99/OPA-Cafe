import React from 'react';
import {
  User, Shield, LogOut, Info, Key,
  LayoutDashboard, Coffee, Package, UtensilsCrossed,
  Truck, ClipboardList, Banknote, BookOpen, LineChart, FileText
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/button';
import { SettingRow, SectionCard } from './SettingsShared';
import { updateSettings } from '../../../application/useCases/settings/manageSettings';

interface AccountTabProps {
  appUser: any;
  session: any;
  handleSignOut: () => Promise<void>;
}

export function AccountTab({ appUser, session, handleSignOut }: AccountTabProps) {
  const { t } = useTranslation();

  return (
    <>
      <SectionCard title={t('profile')} icon={User}>
        <SettingRow label={t('user_id')} description={t('user_id_desc')}>
          <span className="text-sm font-medium text-foreground">{appUser?.id ?? '…'}</span>
        </SettingRow>
        <SettingRow label={t('email_address')} description={t('email_desc')}>
          <span className="text-sm text-muted-foreground">{session?.user?.email ?? 'N/A'}</span>
        </SettingRow>
        <SettingRow label={t('role_label')} description={t('role_desc')}>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            appUser?.role === 'owner'
              ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
          }`}>
            <Shield size={11} />
            {appUser?.role === 'owner' ? t('role_owner') : t('role_cashier')}
          </span>
        </SettingRow>
      </SectionCard>

      <SectionCard title={t('session')} icon={LogOut}>
        <div className="py-5">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border mb-4">
            <Info size={15} className="text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('sign_out_info')}
            </p>
          </div>
          <Button variant="destructive" onClick={handleSignOut} className="flex items-center gap-2">
            <LogOut size={15} />
            {t('sign_out')}
          </Button>
        </div>
      </SectionCard>
    </>
  );
}

interface RolesTabProps {
  cafeId: string | null;
  cashierPermissions: string[];
  setCashierPermissions: (perms: string[]) => void;
}

export function RolesTab({ cafeId, cashierPermissions, setCashierPermissions }: RolesTabProps) {
  const { t } = useTranslation();

  return (
    <SectionCard title={t('cashier_permissions')} icon={Key}>
      <div className="py-5">
        <p className="text-sm text-muted-foreground mb-6">
          {t('cashier_permissions_help_text')}
        </p>
        <div className="space-y-3">
          {[
            { key: 'dashboard',         icon: LayoutDashboard },
            { key: 'products',           icon: Coffee },
            { key: 'inventory',          icon: Package },
            { key: 'categories',         icon: UtensilsCrossed },
            { key: 'suppliers',          icon: Truck },
            { key: 'purchases',          icon: ClipboardList },
            { key: 'debts',              icon: Banknote },
            { key: 'closing',            icon: BookOpen },
            { key: 'reports',            icon: LineChart },
            { key: 'invoices_sales',     icon: FileText },
            { key: 'invoices_supplier',  icon: Truck },
          ].map((perm) => {
            const isEnabled = cashierPermissions.includes(perm.key);
            return (
              <div key={perm.key} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded bg-muted flex items-center justify-center ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`}>
                    <perm.icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t(perm.key)}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isEnabled}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const newPerms = checked 
                        ? [...cashierPermissions, perm.key]
                        : cashierPermissions.filter(p => p !== perm.key);
                      
                      setCashierPermissions(newPerms);
                      if (cafeId) {
                        updateSettings(cafeId, { cashier_permissions: newPerms });
                      }
                    }}
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}
