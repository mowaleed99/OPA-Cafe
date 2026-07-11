import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './application/store/useAuthStore';
import { useSettingsStore } from './application/store/useSettingsStore';
import { processSyncQueue, startRealtimeSync } from './application/sync/syncQueue';
import { pullInitialData } from './application/sync/pullInitialData';
import { cleanupLocalDuplicates } from './cleanupLocal';
import { fetchSettings } from './application/useCases/settings/manageSettings';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import { AutoBackupService } from './application/services/AutoBackupService';

// Layouts
import AuthLayout from './presentation/layouts/AuthLayout';
import AppLayout from './presentation/layouts/AppLayout';

// Route guard
import ProtectedRoute from './presentation/components/ProtectedRoute';

// Auth pages
import LoginPage from './presentation/pages/LoginPage';

// Feature pages
import DashboardPage from './presentation/pages/DashboardPage';
import POSPage from './presentation/pages/POSPage';
import TablesPage from './presentation/pages/TablesPage';
import ProductsPage from './presentation/pages/ProductsPage';
import InventoryPage from './presentation/pages/InventoryPage';
import CategoriesPage from './presentation/pages/CategoriesPage';
import SuppliersPage from './presentation/pages/SuppliersPage';
import PurchasesPage from './presentation/pages/PurchasesPage';
import DebtsPage from './presentation/pages/DebtsPage';
import ClosingPage from './presentation/pages/ClosingPage';
import ReportsPage from './presentation/pages/ReportsPage';
import ExpensesPage from './presentation/pages/ExpensesPage';
import UsersPage from './presentation/pages/UsersPage';
import SettingsPage from './presentation/pages/SettingsPage';
import InvoicesPage from './presentation/pages/InvoicesPage';
import AuditLogPage from './presentation/pages/AuditLogPage';

export default function App() {
  const { initialize, appUser } = useAuthStore();
  const { language } = useSettingsStore();
  const { i18n, t } = useTranslation();
  const [isInitializingData, setIsInitializingData] = useState(false);

  // Restore session on app start
  useEffect(() => {
    initialize();
    AutoBackupService.initialize();
  }, [initialize]);

  // Sync language with i18n and HTML dir
  useEffect(() => {
    i18n.changeLanguage(language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, i18n]);

  // Once authenticated, start sync mechanisms and fetch settings
  useEffect(() => {
    async function initSync() {
      if (!appUser?.cafe_id) return;
      setIsInitializingData(true);
      await cleanupLocalDuplicates(); // Clean duplicates before pushing
      await processSyncQueue(); // Push local changes first
      await pullInitialData(appUser.cafe_id); // Then pull remote data
      setIsInitializingData(false);

      startRealtimeSync(appUser.cafe_id);
      fetchSettings(appUser.cafe_id);
    }
    
    initSync();
  }, [appUser?.cafe_id]);

  if (isInitializingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <RefreshCw size={48} className="animate-spin text-[var(--brand-latte)] mb-4" />
        <h2 className="text-xl font-medium text-foreground">Synchronizing Cafe Data...</h2>
        <p className="text-muted-foreground mt-2">Please wait while we initialize your local database.</p>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected routes — any authenticated user */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/pos" element={<POSPage />} />
            <Route path="/tables" element={<TablesPage />} />

            {/* Dynamic Permission routes */}
            <Route element={<ProtectedRoute requiredPermission="dashboard" />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="products" />}>
              <Route path="/products" element={<ProductsPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="inventory" />}>
              <Route path="/inventory" element={<InventoryPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="categories" />}>
              <Route path="/categories" element={<CategoriesPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="suppliers" />}>
              <Route path="/suppliers" element={<SuppliersPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="purchases" />}>
              <Route path="/purchases" element={<PurchasesPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="debts" />}>
              <Route path="/debts" element={<DebtsPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="closing" />}>
              <Route path="/closing" element={<ClosingPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="reports" />}>
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
            </Route>

            {/* Owner-only routes */}
            <Route element={<ProtectedRoute requiredRole="owner" />}>
              <Route path="/users" element={<UsersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/audit-log" element={<AuditLogPage />} />
            </Route>

            {/* Invoices — owner always sees both tabs; cashier sees sales tab if permitted */}
            <Route element={<ProtectedRoute requiredPermission="invoices_sales" />}>
              <Route path="/invoices" element={<InvoicesPage />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/pos" replace />} />
      </Routes>
    </HashRouter>
  );
}
