import { useState } from 'react';
import { useSettingsStore } from '../../application/store/useSettingsStore';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import {
  Upload, Download, AlertCircle, Trash2, ShoppingBag, Truck,
  Store, Globe, Printer, Palette, User, Shield,
  HardDrive, LogOut, ChevronRight, Sun, Moon, Monitor,
  CheckCircle2, Wifi, WifiOff, Info, Key,
  LayoutDashboard, Coffee, Package, UtensilsCrossed, ClipboardList, Banknote, BookOpen, LineChart,
  FileText, Lock, Cloud, RefreshCw
} from 'lucide-react';
import { updateSettings } from '../../application/useCases/settings/manageSettings';
import { setOwnerPin, hasOwnerPin } from '../../application/useCases/settings/manageOwnerPin';
import { useAuthStore } from '../../application/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

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

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 py-5 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border bg-muted/30">
        <Icon size={16} className="text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase">{title}</h3>
      </div>
      <div className="px-6">{children}</div>
    </div>
  );
}

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
        const saveResult = await window.electronAPI.saveBackup(result.filePath, jsonString);
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

  const activeTabData = tabs.find(tb => tb.id === activeTab)!

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
              {activeTab === 'account'    && t('email_desc')}
              {activeTab === 'roles'      && t('cashier_permissions_desc')}
              {activeTab === 'backup'     && t('export_backup_desc')}
              {activeTab === 'danger'     && t('danger_warning')}
            </p>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6 max-w-3xl">

          {/* GENERAL */}
          {activeTab === 'general' && (
            <>
              <SectionCard title={t('cafe_profile')} icon={Store}>
                <SettingRow label={t('cafe_name_label')} description={t('cafe_name_desc')}>
                  <Input
                    value={cafeName}
                    onChange={(e) => setCafeName(e.target.value)}
                    onBlur={() => { if (cafeId) updateSettings(cafeId, { cafe_name: cafeName }); }}
                    className="w-52"
                    placeholder={t('cafe_name')}
                  />
                </SettingRow>
                <SettingRow label={t('cafe_id_label')} description={t('cafe_id_desc')}>
                  <code className="text-xs bg-muted px-2.5 py-1.5 rounded font-mono text-muted-foreground border border-border">
                    {cafeId ?? '…'}
                  </code>
                </SettingRow>
              </SectionCard>

              <SectionCard title={t('localization')} icon={Globe}>
                <SettingRow label={t('language')} description={t('language_desc')}>
                  <Select value={language} onValueChange={(val: 'ar' | 'en') => {
                    setLanguage(val);
                    if (cafeId) updateSettings(cafeId, { language: val });
                  }}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder={t('language')}>
                        {language === 'ar' ? '🇸🇦 Arabic (العربية)' : '🇬🇧 English'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">{t('arabic')}</SelectItem>
                      <SelectItem value="en">{t('english')}</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>
                <SettingRow label={t('currency')} description={t('currency_desc')}>
                  <Select value={currency} onValueChange={(val: string) => {
                    setCurrency(val);
                    if (cafeId) updateSettings(cafeId, { currency: val });
                  }}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder={t('currency')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EGP">EGP - Egyptian Pound</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                      <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>
              </SectionCard>

            </>
          )}

          {/* APPEARANCE */}
          {activeTab === 'appearance' && (
            <SectionCard title={t('tab_appearance')} icon={Palette}>
              <SettingRow label={t('color_theme')} description={t('color_theme_desc')}>
                <div className="flex gap-2">
                  {([
                    { value: 'light',  icon: Sun,     labelKey: 'theme_light'  },
                    { value: 'dark',   icon: Moon,    labelKey: 'theme_dark'   },
                    { value: 'system', icon: Monitor, labelKey: 'theme_system' },
                  ] as const).map(({ value, icon: Icon, labelKey }) => (
                    <button
                      key={value}
                      onClick={() => applyTheme(value)}
                      className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                        theme === value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground'
                      }`}
                    >
                      <Icon size={18} />
                      {t(labelKey)}
                    </button>
                  ))}
                </div>
              </SettingRow>
              <SettingRow label={t('theme_preview')} description={t('theme_preview_desc')}>
                <div className={`w-52 rounded-lg border overflow-hidden text-xs ${theme === 'dark' ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`}>
                  <div className={`px-3 py-2 border-b flex items-center gap-2 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-gray-50'}`}>
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="ms-1 font-medium">OPA Cafe POS</span>
                  </div>
                  <div className="p-3 space-y-1.5">
                    <div className={`h-2 rounded-full w-3/4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
                    <div className={`h-2 rounded-full w-1/2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
                    <div className="h-5 rounded mt-2 bg-primary/80 w-full" />
                  </div>
                </div>
              </SettingRow>
            </SectionCard>
          )}

          {activeTab === 'account' && (
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
          )}

          {/* ROLES & PERMISSIONS */}
          {activeTab === 'roles' && (
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
                          <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </SectionCard>
          )}

          {/* SECURITY — Owner PIN */}
          {activeTab === 'security' && (
            <SectionCard title={t('owner_approval_pin')} icon={Lock}>
              <div className="py-5 space-y-5">
                {/* Current status */}
                <div className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${
                  pinSet
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400'
                    : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-400'
                }`}>
                  {pinSet ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                  <span>{pinSet === null ? t('loading') : pinSet ? t('pin_is_set') : t('no_pin_set_warning')}</span>
                </div>

                {/* PIN result message */}
                {pinSaveMsg && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg text-sm border ${
                    pinSaveMsg.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400'
                      : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400'
                  }`}>
                    {pinSaveMsg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    {pinSaveMsg.text}
                  </div>
                )}

                {/* Set/Change PIN form */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">{pinSet ? t('change_owner_pin') : t('set_owner_pin')}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t('owner_pin_help')}</p>
                  <div className="flex flex-col gap-2 max-w-xs">
                    <Input
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder={t('new_pin_placeholder')}
                      value={newPin}
                      onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                    />
                    <Input
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder={t('confirm_pin_placeholder')}
                      value={confirmPin}
                      onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    />
                    <Button onClick={handleSavePin} disabled={savingPin || !newPin} className="w-full">
                      {savingPin ? t('saving') : t('save_pin')}
                    </Button>
                  </div>
                </div>

                {/* Clear PIN */}
                {pinSet && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold text-foreground mb-1">{t('remove_pin')}</p>
                    <p className="text-xs text-muted-foreground mb-3">{t('remove_pin_desc')}</p>
                    <Button
                      variant="outline"
                      onClick={handleClearPin}
                      disabled={savingPin}
                      className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      {t('remove_pin')}
                    </Button>
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {/* BACKUP */}
          {activeTab === 'backup' && (
            <>
              {backupMessage && (
                <div className={`flex items-center gap-3 p-4 rounded-lg border text-sm ${
                  backupMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
                    : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800'
                }`}>
                  <CheckCircle2 size={16} className="shrink-0" />
                  {backupMessage.text}
                </div>
              )}
              <SectionCard title={t('cloud_sync', 'Cloud Synchronization')} icon={Cloud}>
                <div className="py-5 flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                    <Cloud size={22} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-foreground mb-1">{t('sync_now', 'Sync Now')}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                      {t('sync_now_desc', 'Manually trigger background synchronization with the cloud server.')}
                    </p>
                    <Button onClick={handleSyncNow} disabled={isSyncingNow} className="flex items-center gap-2" variant="outline">
                      <RefreshCw size={14} className={isSyncingNow ? "animate-spin" : ""} />
                      {isSyncingNow ? t('syncing', 'Syncing...') : t('sync_now_btn', 'Sync Now')}
                    </Button>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title={t('export_section')} icon={Download}>
                <div className="py-5 flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <Download size={22} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-foreground mb-1">{t('download_backup_title')}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                      {t('export_desc')}
                    </p>
                    <Button onClick={handleExport} disabled={isExporting} className="flex items-center gap-2">
                      <Download size={14} />
                      {isExporting ? t('exporting') : t('export_backup_file')}
                    </Button>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title={t('restore_section')} icon={Upload}>
                <div className="py-5 flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                    <Upload size={22} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-foreground mb-1">{t('restore_from_backup')}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      {t('restore_desc')}
                    </p>
                    <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 mb-4">
                      <AlertCircle size={13} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 dark:text-amber-400">{t('restore_caution')}</p>
                    </div>
                    <div className="relative inline-block">
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        disabled={isImporting}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <Button variant="outline" disabled={isImporting} className="flex items-center gap-2">
                        <Upload size={14} />
                        {isImporting ? t('restoring') : t('upload_backup_btn')}
                      </Button>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* AUTO BACKUP CONFIG */}
              <SectionCard title={t('auto_backup_title', 'Automatic Backups')} icon={HardDrive}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">{t('enable_auto_backup', 'Enable Automatic Backups')}</h4>
                      <p className="text-sm text-muted-foreground">{t('auto_backup_desc', 'Automatically download a backup file.')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={autoBackupEnabled}
                        onChange={(e) => useSettingsStore.setState({ autoBackupEnabled: e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  {autoBackupEnabled && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <label className="text-sm font-medium mb-1 block">{t('frequency', 'Frequency')}</label>
                        <select 
                          className="w-full h-10 rounded-md border border-input bg-background px-3"
                          value={autoBackupFrequency}
                          onChange={(e: any) => useSettingsStore.setState({ autoBackupFrequency: e.target.value })}
                        >
                          <option value="daily">{t('daily', 'Daily')}</option>
                          <option value="weekly">{t('weekly', 'Weekly')}</option>
                          <option value="monthly">{t('monthly', 'Monthly')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">{t('time', 'Time')}</label>
                        <input 
                          type="time" 
                          className="w-full h-10 rounded-md border border-input bg-background px-3"
                          value={autoBackupTime}
                          onChange={(e) => useSettingsStore.setState({ autoBackupTime: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {lastBackupDate && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {t('last_backup', 'Last backup:')} {new Date(lastBackupDate).toLocaleString()}
                    </p>
                  )}
                </div>
              </SectionCard>
            </>
          )}

          {/* PRINTING */}
          {activeTab === 'printing' && (
            <>
              <SectionCard title={t('tab_printing')} icon={Printer}>
                <SettingRow 
                  label={t('default_printer', 'Default Printer')} 
                  description={t('default_printer_desc', 'Select the primary printer for receipts and reports.')}
                >
                  <Select 
                    value={defaultPrinter || ''} 
                    onValueChange={(val) => setPrintSettings({ defaultPrinter: val })}
                  >
                    <SelectTrigger className="w-56 bg-background">
                      <SelectValue placeholder={t('select_printer', 'Select a printer')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('none', 'None (Prompt)')}</SelectItem>
                      {availablePrinters.map(p => (
                        <SelectItem key={p.name} value={p.name}>
                          {p.displayName} {p.isDefault ? '(Default)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SettingRow>

                <SettingRow 
                  label={t('paper_size', 'Paper Size')} 
                  description={t('paper_size_desc', 'Select the paper width for your thermal printer.')}
                >
                  <Select 
                    value={paperSize || '80mm'} 
                    onValueChange={(val: any) => setPrintSettings({ paperSize: val })}
                  >
                    <SelectTrigger className="w-48 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="80mm">80mm</SelectItem>
                      <SelectItem value="58mm">58mm</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>

                <SettingRow 
                  label={t('auto_print_receipts', 'Auto-Print Receipts')} 
                  description={t('auto_print_receipts_desc', 'Automatically print a receipt when an order is paid.')}
                >
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={autoPrintReceipts}
                      onChange={(e) => setPrintSettings({ autoPrintReceipts: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </SettingRow>

                <SettingRow 
                  label={t('receipt_copies', 'Receipt Copies')} 
                  description={t('receipt_copies_desc', 'Number of copies to print per receipt.')}
                >
                  <Input 
                    type="number" 
                    min={1} max={5}
                    className="w-24 bg-background"
                    value={receiptCopies || 1}
                    onChange={(e) => setPrintSettings({ receiptCopies: parseInt(e.target.value) || 1 })}
                  />
                </SettingRow>

                <SettingRow 
                  label={t('receipt_footer_msg', 'Receipt Footer Message')} 
                  description={t('receipt_footer_msg_desc', 'Message to display at the bottom of the receipt.')}
                >
                  <Input 
                    type="text" 
                    className="w-64 bg-background"
                    value={receiptTemplateConfig?.footerMessage || 'Thank you for your visit!'}
                    onChange={(e) => setPrintSettings({ 
                      receiptTemplateConfig: { ...receiptTemplateConfig, footerMessage: e.target.value } 
                    })}
                  />
                </SettingRow>

                <SettingRow 
                  label={t('report_default_output', 'Report Default Output')} 
                  description={t('report_default_output_desc', 'Default format when printing reports.')}
                >
                  <Select 
                    value={reportDefaultOutput || 'thermal'} 
                    onValueChange={(val: any) => setPrintSettings({ reportDefaultOutput: val })}
                  >
                    <SelectTrigger className="w-48 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="thermal">{t('thermal_printer')}</SelectItem>
                      <SelectItem value="pdf">{t('pdf_file')}</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>
              </SectionCard>
            </>
          )}

          {/* DANGER ZONE */}
          {activeTab === 'danger' && (
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
          )}

        </div>
      </main>
    </div>
  );
}
