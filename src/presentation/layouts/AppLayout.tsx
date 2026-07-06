import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../application/store/useAuthStore';
import {
  LayoutDashboard,
  ShoppingCart,
  UtensilsCrossed,
  Package,
  Tags,
  Truck,
  ClipboardList,
  BookOpen,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';

const ownerNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pos', icon: ShoppingCart, label: 'POS' },
  { to: '/tables', icon: UtensilsCrossed, label: 'Tables' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/categories', icon: Tags, label: 'Categories' },
  { to: '/suppliers', icon: Truck, label: 'Suppliers' },
  { to: '/purchases', icon: ClipboardList, label: 'Purchases' },
  { to: '/closing', icon: BookOpen, label: 'Closing' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

// Cashiers only see POS and Tables
const cashierNav = [
  { to: '/pos', icon: ShoppingCart, label: 'POS' },
  { to: '/tables', icon: UtensilsCrossed, label: 'Tables' },
];

export default function AppLayout() {
  const { isOwner, signOut } = useAuthStore();
  const navigate = useNavigate();
  const navItems = isOwner() ? ownerNav : cashierNav;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-16 md:w-56 flex flex-col flex-shrink-0 border-r border-border bg-card">
        {/* Logo */}
        <div className="h-14 flex items-center justify-center md:justify-start px-4 border-b border-border">
          <span className="hidden md:block font-display font-bold text-lg text-foreground tracking-tight">
            Crema
          </span>
          <span className="block md:hidden font-display font-bold text-lg text-foreground">☕</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          {navItems.map(({ to, icon: Icon, label }) => (
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
              <span className="hidden md:block">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <div className="p-2 border-t border-border">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut size={18} className="flex-shrink-0" />
            <span className="hidden md:block">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
