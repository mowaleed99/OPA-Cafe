import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './application/store/useAuthStore';
import { useSettingsStore } from './application/store/useSettingsStore';
import { processSyncQueue, startRealtimeSync } from './application/sync/syncQueue';
import { fetchSettings } from './application/useCases/settings/manageSettings';
import { useTranslation } from 'react-i18next';

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
import UsersPage from './presentation/pages/UsersPage';
import SettingsPage from './presentation/pages/SettingsPage';

export default function App() {
  const { initialize, appUser } = useAuthStore();
  const { language } = useSettingsStore();
  const { i18n } = useTranslation();

  // Restore session on app start
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Sync language with i18n and HTML dir
  useEffect(() => {
    i18n.changeLanguage(language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, i18n]);

  // Once authenticated, start sync mechanisms and fetch settings
  useEffect(() => {
    if (appUser?.cafe_id) {
      processSyncQueue();
      startRealtimeSync(appUser.cafe_id);
      fetchSettings(appUser.cafe_id);
    }
  }, [appUser?.cafe_id]);

  return (
    <BrowserRouter>
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

            {/* Owner-only routes */}
            <Route element={<ProtectedRoute requiredRole="owner" />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/purchases" element={<PurchasesPage />} />
              <Route path="/debts" element={<DebtsPage />} />
              <Route path="/closing" element={<ClosingPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/pos" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
