import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../../application/store/useSettingsStore';
import { useTranslation } from 'react-i18next';
import {
  Store, Palette, User, Key, Lock, HardDrive, Printer, Shield,
  ChevronRight, Wifi, WifiOff
} from 'lucide-react';
import { updateSettings } from '../../application/useCases/settings/manageSettings';
import { setOwnerPin, hasOwnerPin } from '../../application/useCases/settings/manageOwnerPin';
import { useAuthStore } from '../../application/store/useAuthStore';
import { useNavigate } from 'react-router-dom';

import { GeneralTab } from './settings/GeneralTab';
import { AppearanceTab } from './settings/AppearanceTab';
import { AccountTab, RolesTab } from './settings/AccountRolesTab';
import { SecurityTab } from './settings/SecurityTab';
import { BackupTab } from './settings/BackupTab';
import { PrintingTab } from './settings/PrintingTab';
import { DangerTab } from './settings/DangerTab';

type Tab = 'general' | 'appearance' | 'account' | 'roles' | 'security' | 'backup' | 'printing' | 'danger';

const tabs: { id: Tab; labelKey: string; icon: React.ElementType; color: string }[] = [
  { id: 'general',    labelKey: 'tab_general',    icon: Store,     color: 'text-blue-500' },
  { id: 'appearance', labelKey: 'tab_appearance', icon: Palette,   color: 'text-violet-500' },
  { id: 'account',    labelKey: 'tab_account',    icon: User,      color: 'text-emerald-500' },
  { id: 'roles',      labelKey: 'tab_roles',      icon: Key,       color: 'text-orange-500' },
  { id: 'security',   labelKey: 'tab_security',   icon: Lock,      color: 'text-indigo-500' },
  { id: 'backup',     labelKey: 'tab_backup',     icon: HardDrive, color: 'text-amber-500' },
  { id: 'printing',   labelKey: 'tab_printing',   icon: Printer,   color: 'text-teal-500' },
  { id: 'danger',     labelKey: 'tab_danger',     icon: Shield,    color: 'text-red-500' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const cafeId = useAuthStore(state => state.cafeId());
  const { appUser, signOut, session } = useAuthStore();
  const navigate = useNavigate();
  const {
    language, cafeName, currency, cashierPermissions,
    defaultPrinter, paperSize, autoPrintReceipts, receiptCopies, reportDefaultOutput, receiptTemplateConfig,
    setLanguage, setCafeName, setCurrency, setCashierPermissions, setPrintSettings
  } = useSettingsStore();
  const { t } = useTranslation();

  const [availablePrinters, setAvailablePrinters] = useState<{name: string, displayName: string, isDefault?: boolean}[]>([]);
  useEffect(() => {
    if (window.electronAPI?.getPrinters) {
      window.electronAPI.getPrinters().then(setAvailablePrinters).catch(console.error);
    }
  }, []);

  // Owner PIN state
  const [pinSet, setPinSet] = useState<boolean | null>(null);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinSaveMsg, setPinSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingPin, setSavingPin] = useState(false);

  useEffect(() => {
    if (cafeId) {
      hasOwnerPin(cafeId).then(setPinSet);
    }
  }, [cafeId]);

  // Theme
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    return saved ?? 'system';
  });

  const applyTheme = (th: 'light' | 'dark' | 'system') => {
    setTheme(th);
    localStorage.setItem('theme', th);
    const isDark = th === 'dark' || (th === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  };

  const autoBackupEnabled = useSettingsStore(s => s.autoBackupEnabled);
  const autoBackupFrequency = useSettingsStore(s => s.autoBackupFrequency);
  const autoBackupTime = useSettingsStore(s => s.autoBackupTime);
  const lastBackupDate = useSettingsStore(s => s.lastBackupDate);

  // Backup & Restore
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [backupMessage, setBackupMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setBackupMessage(null);
    try {
      const defaultFilename = `opa-cafe-backup-${new Date().toISOString().split('T')[0]}.json`;

      // @ts-ignore
      if (window.electronAPI) {
        // @ts-ignore
        const result = await window.electronAPI.showSaveDialog({
          defaultPath: defaultFilename,
          filters: [{ name: 'JSON Files', extensions: ['json'] }]
        });
        
        if (result.canceled || !result.filePath) {
          setIsExporting(false);
          return;
        }

        // @ts-ignore
        const saveResult = await window.electronAPI.saveBackup(result.filePath, '');
        if (saveResult.success) {
          setBackupMessage({ type: 'success', text: t('backup_success') });
        } else {
          throw new Error(saveResult.error);
        }
      } else {
        throw new Error('Export is only supported in desktop app');
      }
    } catch (err) {
      setBackupMessage({ type: 'error', text: t('backup_error') });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    setBackupMessage(null);
    try {
      // @ts-ignore
      if (window.electronAPI) {
        // @ts-ignore
        const result = await window.electronAPI.restoreBackup();
        if (result.success) {
          setBackupMessage({ type: 'success', text: t('restore_success') });
        } else if (!result.canceled) {
          throw new Error(result.error);
        }
      } else {
        throw new Error('Restore is only supported in desktop app');
      }
    } catch {
      setBackupMessage({ type: 'error', text: t('restore_error') });
    } finally {
      setIsImporting(false);
    }
  };

  const [isSyncingNow, setIsSyncingNow] = useState(false);
  const handleSyncNow = async () => {
    setIsSyncingNow(true);
    try {
      if (window.electronAPI) {
        await window.electronAPI.triggerSync();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsSyncingNow(false), 2000);
    }
  };

  // Danger Zone
  const [menuConfirm, setMenuConfirm] = useState('');
  const [salesConfirm, setSalesConfirm] = useState('');
  const [purchasesConfirm, setPurchasesConfirm] = useState('');
  const [isClearingMenu, setIsClearingMenu] = useState(false);
  const [isClearingSales, setIsClearingSales] = useState(false);
  const [isClearingPurchases, setIsClearingPurchases] = useState(false);
  const [dangerMessage, setDangerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleClearMenu = async () => {
    if (menuConfirm !== 'DELETE') return;
    setIsClearingMenu(true);
    setDangerMessage(null);
    try {
      if (cafeId && window.electronAPI) {
        // @ts-ignore
        const res = await window.electronAPI.clearData(cafeId, 'menu');
        if (!res.success) throw new Error(res.error);
      }
      setMenuConfirm('');
      setDangerMessage({ type: 'success', text: t('clear_menu_success') });
    } catch {
      setDangerMessage({ type: 'error', text: t('clear_menu_fail') });
    } finally {
      setIsClearingMenu(false);
    }
  };

  const handleClearSales = async () => {
    if (salesConfirm !== 'DELETE') return;
    setIsClearingSales(true);
    setDangerMessage(null);
    try {
      if (cafeId && window.electronAPI) {
        // @ts-ignore
        const res = await window.electronAPI.clearData(cafeId, 'sales');
        if (!res.success) throw new Error(res.error);
      }
      setSalesConfirm('');
      setDangerMessage({ type: 'success', text: t('clear_sales_success') });
    } catch {
      setDangerMessage({ type: 'error', text: t('clear_sales_fail') });
    } finally {
      setIsClearingSales(false);
    }
  };

  const handleClearPurchases = async () => {
    if (purchasesConfirm !== 'DELETE') return;
    setIsClearingPurchases(true);
    setDangerMessage(null);
    try {
      if (cafeId && window.electronAPI) {
        // @ts-ignore
        const res = await window.electronAPI.clearData(cafeId, 'purchases');
        if (!res.success) throw new Error(res.error);
      }
      setPurchasesConfirm('');
      setDangerMessage({ type: 'success', text: t('clear_purchases_success') });
    } catch {
      setDangerMessage({ type: 'error', text: t('clear_purchases_fail') });
    } finally {
      setIsClearingPurchases(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSavePin = async () => {
    if (!cafeId) return;
    if (newPin.length < 4) {
      setPinSaveMsg({ type: 'error', text: t('pin_too_short') });
      return;
    }
    if (newPin !== confirmPin) {
      setPinSaveMsg({ type: 'error', text: t('pin_mismatch') });
      return;
    }
    setSavingPin(true);
    setPinSaveMsg(null);
    try {
      await setOwnerPin(cafeId, newPin);
      setNewPin('');
      setConfirmPin('');
      setPinSet(true);
      setPinSaveMsg({ type: 'success', text: t('pin_set_success') });
    } catch {
      setPinSaveMsg({ type: 'error', text: t('pin_save_error') });
    } finally {
      setSavingPin(false);
    }
  };

  const handleClearPin = async () => {
    if (!cafeId) return;
    setSavingPin(true);
    try {
      await setOwnerPin(cafeId, null);
      setPinSet(false);
      setPinSaveMsg({ type: 'success', text: t('pin_cleared') });
    } catch {
      setPinSaveMsg({ type: 'error', text: t('pin_save_error') });
    } finally {
      setSavingPin(false);
    }
  };

  const activeTabData = tabs.find(tb => tb.id === activeTab)!;

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col border-r border-border bg-card">
        <div className="px-5 pt-6 pb-4 border-b border-border">
          <h1 className="text-lg font-display font-bold text-foreground">{t('settings')}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{t('manage_system_preferences')}</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-primary-foreground' : tab.color} />
                <span className="flex-1">{t(tab.labelKey)}</span>
                {isActive && <ChevronRight size={14} className="opacity-70" />}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">OPA Cafe POS</p>
            <p>Version 1.0.0</p>
            <div className="flex items-center gap-1.5 mt-2">
              {navigator.onLine
                ? <><Wifi size={11} className="text-emerald-500" /><span className="text-emerald-600">{t('online')}</span></>
                : <><WifiOff size={11} className="text-amber-500" /><span className="text-amber-600">{t('offline')}</span></>}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border px-8 py-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted">
            <activeTabData.icon size={16} className={activeTabData.color} />
          </div>
          <div>
            <h2 className="text-base font-display font-semibold text-foreground">{t(activeTabData.labelKey)}</h2>
            <p className="text-xs text-muted-foreground">
              {activeTab === 'general'    && t('cafe_name_desc')}
              {activeTab === 'appearance' && t('color_theme_desc')}
              {activeTab === 'account'    && t('account_details')}
              {activeTab === 'roles'      && t('cashier_permissions_desc')}
              {activeTab === 'security'   && t('owner_pin_desc')}
              {activeTab === 'backup'     && t('backup_desc')}
              {activeTab === 'printing'   && t('printing_desc')}
              {activeTab === 'danger'     && t('danger_warning')}
            </p>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6 max-w-3xl">
          {activeTab === 'general' && (
            <GeneralTab
              cafeId={cafeId}
              cafeName={cafeName}
              setCafeName={setCafeName}
              language={language}
              setLanguage={setLanguage}
              currency={currency}
              setCurrency={setCurrency}
            />
          )}

          {activeTab === 'appearance' && (
            <AppearanceTab
              theme={theme}
              applyTheme={applyTheme}
            />
          )}

          {activeTab === 'account' && (
            <AccountTab
              appUser={appUser}
              session={session}
              handleSignOut={handleSignOut}
            />
          )}

          {activeTab === 'roles' && (
            <RolesTab
              cafeId={cafeId}
              cashierPermissions={cashierPermissions}
              setCashierPermissions={setCashierPermissions}
            />
          )}

          {activeTab === 'security' && (
            <SecurityTab
              pinSet={pinSet}
              pinSaveMsg={pinSaveMsg}
              newPin={newPin}
              setNewPin={setNewPin}
              confirmPin={confirmPin}
              setConfirmPin={setConfirmPin}
              savingPin={savingPin}
              handleSavePin={handleSavePin}
              handleClearPin={handleClearPin}
            />
          )}

          {activeTab === 'backup' && (
            <BackupTab
              backupMessage={backupMessage}
              isSyncingNow={isSyncingNow}
              handleSyncNow={handleSyncNow}
              isExporting={isExporting}
              handleExport={handleExport}
              isImporting={isImporting}
              handleImport={handleImport}
              autoBackupEnabled={autoBackupEnabled}
              autoBackupFrequency={autoBackupFrequency}
              autoBackupTime={autoBackupTime}
              lastBackupDate={lastBackupDate}
            />
          )}

          {activeTab === 'printing' && (
            <PrintingTab
              cafeId={cafeId}
              defaultPrinter={defaultPrinter}
              availablePrinters={availablePrinters}
              paperSize={paperSize}
              autoPrintReceipts={autoPrintReceipts}
              receiptCopies={receiptCopies}
              receiptTemplateConfig={receiptTemplateConfig}
              reportDefaultOutput={reportDefaultOutput}
              setPrintSettings={setPrintSettings}
            />
          )}

          {activeTab === 'danger' && (
            <DangerTab
              dangerMessage={dangerMessage}
              menuConfirm={menuConfirm}
              setMenuConfirm={setMenuConfirm}
              salesConfirm={salesConfirm}
              setSalesConfirm={setSalesConfirm}
              purchasesConfirm={purchasesConfirm}
              setPurchasesConfirm={setPurchasesConfirm}
              isClearingMenu={isClearingMenu}
              isClearingSales={isClearingSales}
              isClearingPurchases={isClearingPurchases}
              handleClearMenu={handleClearMenu}
              handleClearSales={handleClearSales}
              handleClearPurchases={handleClearPurchases}
            />
          )}
        </div>
      </main>
    </div>
  );
}
