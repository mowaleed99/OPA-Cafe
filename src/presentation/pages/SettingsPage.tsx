import { useState } from 'react';
import { useSettingsStore } from '../../application/store/useSettingsStore';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import {
  Upload, Download, AlertCircle, Trash2, ShoppingBag,
  Store, Globe, Printer, Palette, User, Shield,
  HardDrive, LogOut, ChevronRight, Sun, Moon, Monitor,
  CheckCircle2, Wifi, WifiOff, Info,
} from 'lucide-react';
import { db } from '../../infrastructure/database/db';
import { supabase } from '../../infrastructure/api/supabase';
import { updateSettings } from '../../application/useCases/settings/manageSettings';
import { useAuthStore } from '../../application/store/useAuthStore';
import { useNavigate } from 'react-router-dom';

type Tab = 'general' | 'appearance' | 'account' | 'backup' | 'danger';

const tabs: { id: Tab; labelKey: string; icon: React.ElementType; color: string }[] = [
  { id: 'general',    labelKey: 'tab_general',    icon: Store,     color: 'text-blue-500' },
  { id: 'appearance', labelKey: 'tab_appearance', icon: Palette,   color: 'text-violet-500' },
  { id: 'account',    labelKey: 'tab_account',    icon: User,      color: 'text-emerald-500' },
  { id: 'backup',     labelKey: 'tab_backup',     icon: HardDrive, color: 'text-amber-500' },
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
    language, cafeName, printPaperSize,
    setLanguage, setCafeName, setPrintPaperSize,
  } = useSettingsStore();
  const { t } = useTranslation();

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

  // Backup & Restore
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [backupMessage, setBackupMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setBackupMessage(null);
    try {
      const data: Record<string, unknown[]> = {};
      for (const table of db.tables) {
        data[table.name] = await db.table(table.name).toArray();
      }
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `opa-cafe-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupMessage({ type: 'success', text: t('backup_success') });
    } catch {
      setBackupMessage({ type: 'error', text: t('backup_error') });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    setBackupMessage(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        await db.transaction('rw', db.tables, async () => {
          for (const tableName of Object.keys(data)) {
            if (db.tables.find(t => t.name === tableName)) {
              await db.table(tableName).clear();
              await db.table(tableName).bulkAdd(data[tableName]);
            }
          }
        });
        setBackupMessage({ type: 'success', text: t('restore_success') });
      } catch {
        setBackupMessage({ type: 'error', text: t('restore_error') });
      } finally {
        setIsImporting(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Danger Zone
  const [menuConfirm, setMenuConfirm] = useState('');
  const [salesConfirm, setSalesConfirm] = useState('');
  const [isClearingMenu, setIsClearingMenu] = useState(false);
  const [isClearingSales, setIsClearingSales] = useState(false);
  const [dangerMessage, setDangerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleClearMenu = async () => {
    if (menuConfirm !== 'DELETE') return;
    setIsClearingMenu(true);
    setDangerMessage(null);
    try {
      // 1. Clear local IndexedDB
      await db.transaction('rw', [db.categories, db.products, db.sync_queue], async () => {
        await db.categories.clear();
        await db.products.clear();
        await db.sync_queue.clear();
      });

      // 2. Clear online (Supabase) — only if online and cafeId is known
      if (navigator.onLine && cafeId) {
        const [{ error: catErr }, { error: prodErr }] = await Promise.all([
          supabase.from('categories').delete().eq('cafe_id', cafeId),
          supabase.from('products').delete().eq('cafe_id', cafeId),
        ]);
        if (catErr) throw catErr;
        if (prodErr) throw prodErr;
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
      // 1. Clear local IndexedDB
      await db.transaction('rw', [db.orders, db.order_items, db.daily_closings, db.daily_closing_items, db.sync_queue, db.dining_tables], async () => {
        await db.orders.clear();
        await db.order_items.clear();
        await db.daily_closings.clear();
        await db.daily_closing_items.clear();
        await db.sync_queue.clear();
        const tables = await db.dining_tables.toArray();
        for (const tbl of tables) {
          await db.dining_tables.put({ ...tbl, status: 'available', current_order_id: undefined });
        }
      });

      // 2. Clear online (Supabase) — only if online and cafeId is known
      if (navigator.onLine && cafeId) {
        // Delete child tables first to avoid FK violations
        const { data: remoteOrders } = await supabase.from('orders').select('id').eq('cafe_id', cafeId);
        const { data: remoteClosings } = await supabase.from('daily_closings').select('id').eq('cafe_id', cafeId);

        const orderIds = (remoteOrders ?? []).map(o => o.id);
        const closingIds = (remoteClosings ?? []).map(c => c.id);

        if (orderIds.length > 0) {
          const { error: oiErr } = await supabase.from('order_items').delete().in('order_id', orderIds);
          if (oiErr) throw oiErr;
        }
        if (closingIds.length > 0) {
          const { error: dciErr } = await supabase.from('daily_closing_items').delete().in('daily_closing_id', closingIds);
          if (dciErr) throw dciErr;
        }

        const [{ error: ordErr }, { error: dcErr }, { error: tblErr }] = await Promise.all([
          supabase.from('orders').delete().eq('cafe_id', cafeId),
          supabase.from('daily_closings').delete().eq('cafe_id', cafeId),
          supabase.from('tables').update({ status: 'available', current_order_id: null }).eq('cafe_id', cafeId),
        ]);
        if (ordErr) throw ordErr;
        if (dcErr) throw dcErr;
        if (tblErr) throw tblErr;
      }

      setSalesConfirm('');
      setDangerMessage({ type: 'success', text: t('clear_sales_success') });
    } catch {
      setDangerMessage({ type: 'error', text: t('clear_sales_fail') });
    } finally {
      setIsClearingSales(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
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
              </SectionCard>

              <SectionCard title={t('receipt_printing')} icon={Printer}>
                <SettingRow label={t('paper_size')} description={t('paper_size_desc')}>
                  <Select value={printPaperSize} onValueChange={(val: 'A4' | '80mm' | '58mm') => {
                    setPrintPaperSize(val);
                    if (cafeId) updateSettings(cafeId, { print_paper_size: val });
                  }}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder={t('print_paper_size')}>
                        {printPaperSize === 'A4' ? 'A4 (Standard)' : printPaperSize === '80mm' ? 'Thermal 80mm' : 'Thermal 58mm'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4 (Standard)</SelectItem>
                      <SelectItem value="80mm">Thermal 80mm</SelectItem>
                      <SelectItem value="58mm">Thermal 58mm</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>
                <SettingRow label={t('print_preview')} description={t('print_preview_desc')}>
                  <div className={`border border-dashed border-border rounded-lg flex items-center justify-center bg-muted/40 text-xs text-muted-foreground font-mono transition-all
                    ${printPaperSize === 'A4' ? 'w-20 h-28' : printPaperSize === '80mm' ? 'w-14 h-24' : 'w-10 h-20'}`}>
                    {printPaperSize}
                  </div>
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
                    <span className="ml-1 font-medium">OPA Cafe POS</span>
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
            </>
          )}

        </div>
      </main>
    </div>
  );
}
