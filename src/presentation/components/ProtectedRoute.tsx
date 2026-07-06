import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../application/store/useAuthStore';

interface ProtectedRouteProps {
  /** If provided, only users with this role can access the route. */
  requiredRole?: 'owner' | 'cashier';
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { session, appUser, isLoading } = useAuthStore();

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

  return <Outlet />;
}
