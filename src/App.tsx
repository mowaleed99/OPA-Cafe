import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './application/store/useAuthStore';
import { processSyncQueue, startRealtimeSync } from './application/sync/syncQueue';

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
import CategoriesPage from './presentation/pages/CategoriesPage';
import SuppliersPage from './presentation/pages/SuppliersPage';
import PurchasesPage from './presentation/pages/PurchasesPage';
import ClosingPage from './presentation/pages/ClosingPage';
import UsersPage from './presentation/pages/UsersPage';
import SettingsPage from './presentation/pages/SettingsPage';

export default function App() {
  const { initialize, appUser } = useAuthStore();

  // Restore session on app start
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Once authenticated, start sync mechanisms
  useEffect(() => {
    if (appUser?.cafe_id) {
      processSyncQueue();
      startRealtimeSync(appUser.cafe_id);
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
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/purchases" element={<PurchasesPage />} />
              <Route path="/closing" element={<ClosingPage />} />
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
