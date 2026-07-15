import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../application/store/useAuthStore';
import { useSettingsStore } from '../../application/store/useSettingsStore';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  ShoppingCart,
  UtensilsCrossed,
  Package,
  Truck,
  ClipboardList,
  BookOpen,
  Users,
  Settings,
  LogOut,
  LineChart,
  TerminalSquare,
  Coffee,
  Banknote,
  Receipt,
  FileText,
  ClipboardCheck,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const ownerNav = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  { to: '/pos', icon: TerminalSquare, labelKey: 'pos' },
  { to: '/tables', icon: UtensilsCrossed, labelKey: 'tables' },
  { to: '/products', icon: Coffee, labelKey: 'products' },
  { to: '/inventory', icon: Package, labelKey: 'inventory' },
  { to: '/suppliers', icon: Truck, labelKey: 'suppliers' },
  { to: '/purchases', icon: ClipboardList, labelKey: 'purchases' },
  { to: '/debts', icon: Banknote, labelKey: 'debts' },
  { to: '/closing', icon: BookOpen, labelKey: 'closing' },
  { to: '/reports', icon: LineChart, labelKey: 'reports' },
  { to: '/expenses', icon: Receipt, labelKey: 'expenses' },
  { to: '/invoices', icon: FileText, labelKey: 'invoices' },
  { to: '/audit-log', icon: ClipboardCheck, labelKey: 'audit_log' },
  { to: '/users', icon: Users, labelKey: 'users' },
  { to: '/settings', icon: Settings, labelKey: 'settings' },
];

export default function AppLayout() {
  const { isOwner, signOut } = useAuthStore();
  const { cashierPermissions } = useSettingsStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<{ pending: number; synced: number; failed: number; isSyncing: boolean } | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (window.electronAPI?.getSyncStatus) {
      window.electronAPI.getSyncStatus().then(setSyncStatus);
    }
    
    let cleanup = () => {};
    if (window.electronAPI?.onSyncStatus) {
      cleanup = window.electronAPI.onSyncStatus((status) => {
        setSyncStatus(status);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      cleanup();
    };
  }, []);
  
  const navItems = isOwner() 
    ? ownerNav 
    : ownerNav.filter(item => 
        item.labelKey === 'pos' || 
        item.labelKey === 'tables' || 
        (cashierPermissions || []).includes(item.labelKey)
      ).filter(item => 
        item.labelKey !== 'users' && 
        item.labelKey !== 'settings' &&
        item.labelKey !== 'audit_log'
      );

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-16 md:w-56 flex flex-col flex-shrink-0 border-r border-border bg-card">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center md:justify-start px-4 border-b border-border">
          <img src="./OPA-logo.png" alt="OPA CAFE" className="hidden md:block h-8 w-auto object-contain" />
          <img src="./OPA-logo.png" alt="OPA CAFE" className="block md:hidden h-8 w-auto object-contain" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          {navItems.map(({ to, icon: Icon, labelKey }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              <span className="hidden md:block">{t(labelKey)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sync Indicator */}
        <div className="px-3 py-3 border-t border-border flex flex-col gap-1 items-center md:items-start text-xs font-medium">
          {!isOnline ? (
            <div className="flex items-center gap-2 text-muted-foreground w-full justify-center md:justify-start" title={t('offline', 'Offline')}>
              <WifiOff className="h-4 w-4" />
              <span className="hidden md:block">{t('offline', 'Offline')}</span>
            </div>
          ) : syncStatus?.isSyncing ? (
            <div className="flex items-center gap-2 text-yellow-500 w-full justify-center md:justify-start" title={t('syncing', 'Syncing...')}>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="hidden md:block">{t('syncing', 'Syncing...')}</span>
            </div>
          ) : syncStatus?.failed > 0 ? (
            <div className="flex items-center gap-2 text-red-500 w-full justify-center md:justify-start" title={`${t('sync_failed', 'Sync Failed')} (${syncStatus.failed})`}>
              <AlertCircle className="h-4 w-4" />
              <span className="hidden md:block truncate">{t('sync_failed', 'Sync Failed')} ({syncStatus.failed})</span>
            </div>
          ) : syncStatus?.pending > 0 ? (
            <div className="flex items-center gap-2 text-yellow-500 w-full justify-center md:justify-start" title={t('pending', 'Pending')}>
              <RefreshCw className="h-4 w-4" />
              <span className="hidden md:block">{t('pending', 'Pending')} ({syncStatus.pending})</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-500 w-full justify-center md:justify-start" title={t('synced', 'Synced')}>
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden md:block">{t('synced', 'Synced')}</span>
            </div>
          )}
        </div>

        {/* Sign out */}
        <div className="p-2 border-t border-border">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut size={18} className="flex-shrink-0" />
            <span className="hidden md:block">{t('sign_out', 'Sign Out')}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto relative bg-background">
        <div className="absolute inset-0 animate-in fade-in duration-300">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
