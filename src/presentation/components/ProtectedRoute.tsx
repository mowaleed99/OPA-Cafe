import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../application/store/useAuthStore';
import { useSettingsStore } from '../../application/store/useSettingsStore';

interface ProtectedRouteProps {
  /** If provided, only users with this role can access the route. */
  requiredRole?: 'owner' | 'cashier';
  /** If provided, cashiers must have at least one of these permission keys to access. */
  requiredPermission?: string | string[];
}

export default function ProtectedRoute({ requiredRole, requiredPermission }: ProtectedRouteProps) {
  const { session, appUser, isLoading } = useAuthStore();
  const { cashierPermissions } = useSettingsStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm animate-pulse">Loading…</div>
      </div>
    );
  }

  if (!session || !appUser) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required (e.g. owner-only routes) redirect unauthorized users
  if (requiredRole && appUser.role !== requiredRole) {
    return <Navigate to="/pos" replace />;
  }

  // Check custom cashier permissions
  if (requiredPermission && appUser.role === 'cashier') {
    const permissionsToCheck = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
    const hasPermission = permissionsToCheck.some(p => (cashierPermissions || []).includes(p));
    
    if (!hasPermission) {
      return <Navigate to="/pos" replace />;
    }
  }

  return <Outlet />;
}
