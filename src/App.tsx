import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { 
  Product, Category, CustomerDebt, Supplier, Purchase, UserRole, CafeSettings, Order, ActivityLog, CartItem, PaymentMethod, Table, DailyClosing 
} from './types';
import { 
  INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_DEBTS, INITIAL_SUPPLIERS, INITIAL_PURCHASES, INITIAL_USERS, INITIAL_SETTINGS, INITIAL_ORDERS, INITIAL_LOGS, INITIAL_TABLES, INITIAL_DAILY_CLOSINGS 
} from './data';

// Import Views
import DashboardView from './components/DashboardView';
import POSView from './components/POSView';
import ProductsView from './components/ProductsView';
import CategoriesView from './components/CategoriesView';
import SuppliersView from './components/SuppliersView';
import PurchasesView from './components/PurchasesView';
import ReportsView from './components/ReportsView';
import UsersView from './components/UsersView';
import SettingsView from './components/SettingsView';
import DailyClosingView from './components/DailyClosingView';

// Lucide Icons for navigation
import { 
  LayoutDashboard, ShoppingCart, Coffee, Layers, Users, Truck, FileText, BarChart2, ShieldAlert, Settings, Moon, Sun, AlertCircle, RefreshCcw, Menu, X, CheckSquare 
} from 'lucide-react';

export default function App() {
  // Master states loaded from localStorage or initialized with static default data
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('cafe_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('cafe_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [debts, setDebts] = useState<CustomerDebt[]>(() => {
    const saved = localStorage.getItem('cafe_debts');
    return saved ? JSON.parse(saved) : INITIAL_DEBTS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('cafe_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem('cafe_purchases');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
  });

  const [users, setUsers] = useState<UserRole[]>(() => {
    const saved = localStorage.getItem('cafe_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('cafe_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('cafe_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [settings, setSettings] = useState<CafeSettings>(() => {
    const saved = localStorage.getItem('cafe_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.cafeName === 'Artisanal Crema Brews') {
          parsed.cafeName = 'O P A CAFE';
          parsed.receiptHeader = parsed.receiptHeader.replace('ARTISANAL CREMA BREWS', 'O P A CAFE');
          localStorage.setItem('cafe_settings', JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {
        return INITIAL_SETTINGS;
      }
    }
    return INITIAL_SETTINGS;
  });

  const [tables, setTables] = useState<Table[]>(() => {
    const saved = localStorage.getItem('cafe_tables');
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [dailyClosings, setDailyClosings] = useState<DailyClosing[]>(() => {
    const saved = localStorage.getItem('cafe_daily_closings');
    return saved ? JSON.parse(saved) : INITIAL_DAILY_CLOSINGS;
  });

  // Navigation and UI States
  const [activeScreen, setActiveScreen] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('cafe_theme');
    return saved !== 'light';
  });
  const [activeUser, setActiveUser] = useState<UserRole>(() => {
    const savedUsers = localStorage.getItem('cafe_users');
    const parsedUsers = savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS;
    return parsedUsers.find((u: any) => u.status === 'active') || parsedUsers[1]; // default to Sarah Conner (Cashier)
  });
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('cafe_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('cafe_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('cafe_debts', JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem('cafe_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('cafe_purchases', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem('cafe_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('cafe_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('cafe_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('cafe_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('cafe_tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('cafe_daily_closings', JSON.stringify(dailyClosings));
  }, [dailyClosings]);

  useEffect(() => {
    localStorage.setItem('cafe_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Helper: Log activities dynamically
  const logAction = (user: string, action: string, details: string, type: 'sale' | 'purchase' | 'debt' | 'product' | 'system') => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      time: new Date().toISOString(),
      user,
      action,
      details,
      type
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // State Mutators: Products
  const handleAddProduct = (payload: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      id: `p-${Date.now()}`,
      ...payload,
    };
    setProducts((prev) => [newProduct, ...prev]);
    logAction(activeUser.name, 'Product Created', `Added product "${newProduct.name}" to inventory`, 'product');
  };

  const handleEditProduct = (id: string, payload: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...payload } : p))
    );
    const updated = products.find(p => p.id === id);
    if (updated) {
      logAction(activeUser.name, 'Product Configured', `Updated parameters for "${updated.name}"`, 'product');
    }
  };

  const handleDeleteProduct = (id: string) => {
    const targeted = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (targeted) {
      logAction(activeUser.name, 'Product Removed', `Deleted product "${targeted.name}"`, 'product');
    }
  };

  // State Mutators: Categories
  const handleAddCategory = (payload: Omit<Category, 'id'>) => {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      ...payload,
    };
    setCategories((prev) => [...prev, newCat]);
    logAction(activeUser.name, 'Category Created', `Added category "${newCat.name}"`, 'system');
  };

  const handleEditCategory = (id: string, payload: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...payload } : c))
    );
  };

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    logAction(activeUser.name, 'Category Removed', `Deleted category`, 'system');
  };

  // State Mutators: POS Checkout transaction reducer
  const handleCheckoutComplete = (
    cartItems: CartItem[],
    paymentMethod: PaymentMethod,
    discountPercent: number,
    customerIdForDebt?: string,
    orderNotes?: string
  ) => {
    // 1. Reduce stock of products sold
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const itemInCart = cartItems.find((item) => item.product.id === p.id);
        if (itemInCart) {
          return {
            ...p,
            stock: Math.max(0, p.stock - itemInCart.quantity),
          };
        }
        return p;
      })
    );

    // 2. Compute Ticket Totals
    const subtotal = cartItems.reduce((sum, item) => {
      const orig = item.product.price * item.quantity;
      const itemDisc = item.discountPercent ? orig * (item.discountPercent / 100) : 0;
      return sum + (orig - itemDisc);
    }, 0);
    const discountAmount = subtotal * (discountPercent / 100);
    const totalAfterDiscount = subtotal - discountAmount;
    const taxAmount = totalAfterDiscount * (settings.taxPercent / 100);
    const finalTotal = totalAfterDiscount + taxAmount;

    // 3. Log active completed order
    const newOrder: Order = {
      id: `ord-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      items: cartItems.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        discountPercent: item.discountPercent,
        notes: item.notes,
      })),
      paymentMethod,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total: finalTotal,
      cashierId: activeUser.id,
      cashierName: activeUser.name,
      status: 'completed',
    };

    setOrders((prev) => [newOrder, ...prev]);

    // 4. Hook Debt Ledger if "Credit" is settlement selection
    if (paymentMethod === 'Credit' && customerIdForDebt) {
      setDebts((prevDebts) =>
        prevDebts.map((deb) => {
          if (deb.id === customerIdForDebt) {
            const updatedTotal = deb.totalDebt + finalTotal;
            const updatedRemaining = updatedTotal - deb.paidDebt;
            return {
              ...deb,
              totalDebt: updatedTotal,
              remainingDebt: updatedRemaining,
            };
          }
          return deb;
        })
      );
      const debtor = debts.find((d) => d.id === customerIdForDebt);
      logAction(
        activeUser.name,
        'Logged Debt Tab',
        `Registered order #${newOrder.id} (${settings.currency}${finalTotal.toFixed(2)}) on ${debtor?.customerName}'s account`,
        'debt'
      );
    } else {
      logAction(
        activeUser.name,
        'Checkout Complete',
        `Completed order #${newOrder.id} for ${settings.currency}${finalTotal.toFixed(2)} via ${paymentMethod}`,
        'sale'
      );
    }
  };

  // State Mutators: Debts Ledger & Payment Deposits
  const handleRecordPayment = (id: string, amount: number, paymentNotes?: string) => {
    setDebts((prevDebts) =>
      prevDebts.map((deb) => {
        if (deb.id === id) {
          const updatedPaid = deb.paidDebt + amount;
          const updatedRemaining = Math.max(0, deb.totalDebt - updatedPaid);
          const paymentHistoryLog = [
            {
              id: `pay-${Date.now()}`,
              date: new Date().toISOString(),
              amount,
              notes: paymentNotes || 'Deposit payoff on credit tab',
            },
            ...deb.paymentHistory,
          ];
          return {
            ...deb,
            paidDebt: updatedPaid,
            remainingDebt: updatedRemaining,
            paymentHistory: paymentHistoryLog,
          };
        }
        return deb;
      })
    );
    const client = debts.find((d) => d.id === id);
    logAction(
      activeUser.name,
      'Debt Cleared',
      `Collected ${settings.currency}${amount.toFixed(2)} deposit from ${client?.customerName}`,
      'debt'
    );
  };

  const handleRegisterDebtor = (payload: Omit<CustomerDebt, 'id' | 'remainingDebt' | 'paymentHistory'>) => {
    const remainingDebt = payload.totalDebt - payload.paidDebt;
    const initialPaymentHistory = payload.paidDebt > 0 ? [{
      id: `pay-${Date.now()}`,
      date: new Date().toISOString(),
      amount: payload.paidDebt,
      notes: 'Initial account activation deposit'
    }] : [];

    const newDebtor: CustomerDebt = {
      id: `d-${Date.now()}`,
      ...payload,
      remainingDebt,
      paymentHistory: initialPaymentHistory,
    };

    setDebts((prev) => [newDebtor, ...prev]);
    logAction(activeUser.name, 'Ledger Issued', `Approved house tab credit for ${newDebtor.customerName}`, 'debt');
  };

  // State Mutators: Suppliers & Sourcing Invoices
  const handleAddSupplier = (payload: Omit<Supplier, 'id'>) => {
    const newSup: Supplier = {
      id: `s-${Date.now()}`,
      ...payload,
    };
    setSuppliers((prev) => [...prev, newSup]);
    logAction(activeUser.name, 'Supplier Registered', `Registered vendor partner "${newSup.name}"`, 'system');
  };

  const handleEditSupplier = (id: string, payload: Partial<Supplier>) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...payload } : s))
    );
  };

  // State Mutators: Procurement Invoices
  const handleAddPurchase = (payload: Omit<Purchase, 'id' | 'supplierName'>) => {
    const supplierName = suppliers.find((s) => s.id === payload.supplierId)?.name || 'Custom Supplier';
    const newPurchase: Purchase = {
      id: `pur-${Date.now().toString().slice(-5)}`,
      supplierName,
      ...payload,
    };

    setPurchases((prev) => [newPurchase, ...prev]);

    // Update physical products stock if raw materials matched our products (e.g. replenishing coffee beans or croissants)
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const itemRestocked = payload.items.find(
          (item) => item.productName.toLowerCase() === p.name.toLowerCase()
        );
        if (itemRestocked) {
          return {
            ...p,
            stock: p.stock + itemRestocked.quantity,
          };
        }
        return p;
      })
    );

    logAction(
      activeUser.name,
      'Procurement Logged',
      `Received supplier invoice from ${supplierName} totaling ${settings.currency}${payload.totalAmount.toFixed(2)}`,
      'purchase'
    );
  };

  const handleUpdateTableCart = (tableId: string, cartItems: CartItem[], discountPercent: number, notes?: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: cartItems.length > 0 ? 'occupied' : 'available',
              cartItems,
              discountPercent,
              notes: notes || '',
            }
          : t
      )
    );
    const matched = tables.find((t) => t.id === tableId);
    if (matched) {
      logAction(
        activeUser.name,
        'Table Updated',
        `Saved running bill for ${matched.name} with ${cartItems.length} items`,
        'system'
      );
    }
  };

  const handleClearTable = (tableId: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: 'available',
              cartItems: [],
              discountPercent: 0,
              notes: '',
            }
          : t
      )
    );
  };

  const handleRecordPurchasePayment = (purchaseId: string, amount: number, date: string, notes?: string) => {
    setPurchases((prev) =>
      prev.map((p) => {
        if (p.id === purchaseId) {
          const newPaid = (p.amountPaid || 0) + amount;
          const newRemaining = Math.max(0, p.totalAmount - newPaid);
          const newStatus = newRemaining === 0 ? 'Paid' : 'Partial';
          const newPaymentRecord = {
            id: `pay-inst-${Date.now()}`,
            date,
            amount,
            notes: notes || 'Supplier installment',
          };
          return {
            ...p,
            amountPaid: newPaid,
            amountRemaining: newRemaining,
            paymentStatus: newStatus,
            payments: [...(p.payments || []), newPaymentRecord],
          };
        }
        return p;
      })
    );
    logAction(
      activeUser.name,
      'Supplier Installment Settled',
      `Paid ${settings.currency}${amount.toFixed(2)} toward invoice ref: ${purchaseId}`,
      'purchase'
    );
  };

  const handleSaveDailyClosing = (newClosing: DailyClosing) => {
    setDailyClosings((prev) => [newClosing, ...prev]);

    // Archive / Clear today's active orders so the POS till resets to zero
    setOrders((prev) =>
      prev.map((o) => (o.date.startsWith(newClosing.date) && o.status === 'completed' ? { ...o, status: 'archived_closed' } : o))
    );

    logAction(
      activeUser.name,
      'Day Closed',
      `Saved daily closing statement for ${newClosing.date} totaling ${settings.currency}${newClosing.totalSales.toFixed(2)}`,
      'system'
    );
  };

  // State Mutators: Users shift management
  const handleAddUser = (payload: Omit<UserRole, 'id'>) => {
    const newUser: UserRole = {
      id: `u-${Date.now().toString().slice(-4)}`,
      ...payload,
    };
    setUsers((prev) => [...prev, newUser]);
    logAction(activeUser.name, 'User Configured', `Registered staff user "${newUser.name}" as ${newUser.role}`, 'system');
  };

  const handleToggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u))
    );
  };

  // Switch Cashier shift dropdown selector
  const handleSwitchUserShift = (userId: string) => {
    const selected = users.find((u) => u.id === userId);
    if (selected) {
      setActiveUser(selected);
      logAction(selected.name, 'Shift Swapped', `Active terminal shift assigned to ${selected.name}`, 'system');
    }
  };

  const handleSaveSettings = (payload: CafeSettings) => {
    setSettings(payload);
    logAction(activeUser.name, 'Settings Modified', 'Updated currency, taxes, and receipt headers', 'system');
  };

  const handleResetDatabase = () => {
    localStorage.clear();
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setDebts(INITIAL_DEBTS);
    setSuppliers(INITIAL_SUPPLIERS);
    setPurchases(INITIAL_PURCHASES);
    setUsers(INITIAL_USERS);
    setOrders(INITIAL_ORDERS);
    setLogs(INITIAL_LOGS);
    setSettings(INITIAL_SETTINGS);
  };

  const { language, setLanguage, t, dir } = useLanguage();

  // Quick state flags for Sidebar badges
  const lowStockCount = products.filter((p) => p.status !== 'archived' && p.stock <= p.minStock).length;
  const overdueDebtsCount = debts.filter((d) => d.remainingDebt > 0 && new Date(d.dueDate) < new Date()).length;

  return (
    <div dir={dir} className={isDarkMode ? 'dark text-zinc-100 min-h-screen font-sans' : 'text-gray-950 min-h-screen font-sans'}>
      {/* Absolute Master container to support dark mode selector styling */}
      <div className="bg-[#FDFBF7] dark:bg-zinc-950 min-h-screen flex flex-col md:flex-row transition-colors duration-150">
        
        {/* MOBILE HEADER BAR */}
        <div className="md:hidden bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-850 p-4 flex items-center justify-between z-40 sticky top-0 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">☕</span>
            <span className="font-display font-semibold text-xs tracking-wider uppercase text-gray-900 dark:text-zinc-100">
              {settings.cafeName.slice(0, 18)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 transition-colors"
            >
              {language === 'ar' ? 'EN' : 'AR'}
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* SIDEBAR NAVIGATION (Linear inspired, fast, minimal chrome, sharp typography) */}
        <aside className={`
          fixed inset-y-0 ${dir === 'rtl' ? 'right-0' : 'left-0'} transform ${mobileMenuOpen ? 'translate-x-0' : dir === 'rtl' ? 'translate-x-full' : '-translate-x-full'} 
          md:relative md:translate-x-0 md:flex w-64 bg-white dark:bg-zinc-950 border-r border-gray-100 dark:border-zinc-850 p-5 flex flex-col justify-between transition-transform duration-200 ease-in-out z-50
        `}>
          
          <div className="space-y-6">
            {/* Cafe Brand logo */}
            <div className="flex items-center gap-2.5 px-2 pb-2 border-b border-gray-55/40 dark:border-zinc-800/60">
              <span className="text-2xl bg-brand-beige/50 dark:bg-brand-bean/40 w-10 h-10 rounded-lg flex items-center justify-center">☕</span>
              <div>
                <h1 className="font-display font-bold text-xs tracking-wider uppercase text-gray-900 dark:text-zinc-100 truncate max-w-[150px]">
                  {settings.cafeName}
                </h1>
                <span className="text-[10px] font-mono font-medium text-brand-latte">{t('commercialCloud')}</span>
              </div>
            </div>

            {/* Shift swap controls */}
            <div className="bg-gray-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-gray-100 dark:border-zinc-850 space-y-1">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 block px-1">
                {t('activeShift')}
              </span>
              <select
                value={activeUser.id}
                onChange={(e) => handleSwitchUserShift(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-[11px] font-medium text-gray-700 dark:text-zinc-300 p-1.5 rounded-md outline-none"
              >
                {users.filter(u => u.status === 'active').map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Nav Menu */}
            <nav className="space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 block px-2 mb-2">
                {t('nav.operations')}
              </span>

              {[
                { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
                { id: 'pos', label: t('nav.pos'), icon: ShoppingCart },
                { id: 'products', label: t('nav.products'), icon: Coffee, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 font-mono' },
                { id: 'categories', label: t('nav.categories'), icon: Layers },
                { id: 'daily-closing', label: t('nav.dailyClosing'), icon: CheckSquare },
                { id: 'suppliers', label: t('nav.suppliers'), icon: Truck },
                { id: 'purchases', label: t('nav.purchases'), icon: FileText },
                { id: 'reports', label: t('nav.reports'), icon: BarChart2 },
                { id: 'users', label: t('nav.users'), icon: Users },
                { id: 'settings', label: t('nav.settings'), icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeScreen === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveScreen(item.id);
                      setMobileMenuOpen(false); // Close mobile tray
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-crema text-brand-espresso font-bold border border-brand-beige dark:bg-brand-bean/25 dark:border-brand-bean dark:text-brand-latte'
                        : 'text-gray-600 hover:bg-gray-50/50 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-850/50 dark:hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-latte' : 'text-gray-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-semibold ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer controls: Light/Dark and quick system reset */}
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
            {/* Language Selection Row */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400 px-2">
              <span className="font-medium">{language === 'ar' ? 'لغة الواجهة' : 'System Language'}</span>
              <button
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="px-2 py-1 text-[10px] font-bold uppercase rounded-md bg-gray-100 dark:bg-zinc-850 text-gray-700 dark:text-zinc-300 hover:opacity-85 transition-opacity"
              >
                {language === 'ar' ? 'English (EN)' : 'العربية (AR)'}
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400 px-2">
              <span className="font-medium">{t('interfaceTheme')}</span>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300 transition-colors"
                title={isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Signature detail */}
            <div className="text-[10px] text-gray-400 dark:text-zinc-500 px-2 leading-tight">
              <p className="font-semibold text-brand-latte uppercase tracking-wider font-display">O P A Engine v1.8</p>
              <p className="mt-0.5">{t('optimizedTouch')}</p>
            </div>
          </div>
        </aside>

        {/* Back-curtain backdrop for mobile drawer */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          ></div>
        )}

        {/* MAIN VIEWS WORKSTAGE */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {/* Active Screen Router */}
          {activeScreen === 'dashboard' && (
            <DashboardView
              orders={orders}
              products={products}
              debts={debts}
              purchases={purchases}
              logs={logs}
              currency={settings.currency}
              onNavigate={(s) => setActiveScreen(s)}
            />
          )}

          {activeScreen === 'pos' && (
            <POSView
              products={products}
              categories={categories}
              tables={tables}
              currency={settings.currency}
              taxPercent={settings.taxPercent}
              activeUser={activeUser}
              onCheckoutComplete={handleCheckoutComplete}
              onUpdateTableCart={handleUpdateTableCart}
              onClearTable={handleClearTable}
            />
          )}

          {activeScreen === 'products' && (
            <ProductsView
              products={products}
              categories={categories}
              currency={settings.currency}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {activeScreen === 'categories' && (
            <CategoriesView
              categories={categories}
              products={products}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {activeScreen === 'daily-closing' && (
            <DailyClosingView
              orders={orders}
              products={products}
              dailyClosings={dailyClosings}
              onAddDailyClosing={handleSaveDailyClosing}
              activeUserName={activeUser.name}
              currency={settings.currency}
              language={language}
            />
          )}

          {activeScreen === 'suppliers' && (
            <SuppliersView
              suppliers={suppliers}
              purchases={purchases}
              currency={settings.currency}
              onAddSupplier={handleAddSupplier}
              onEditSupplier={handleEditSupplier}
            />
          )}

          {activeScreen === 'purchases' && (
            <PurchasesView
              purchases={purchases}
              suppliers={suppliers}
              products={products}
              currency={settings.currency}
              onAddPurchase={handleAddPurchase}
              onRecordPurchasePayment={handleRecordPurchasePayment}
            />
          )}

          {activeScreen === 'reports' && (
            <ReportsView
              orders={orders}
              products={products}
              categories={categories}
              dailyClosings={dailyClosings}
              currency={settings.currency}
              language={language}
            />
          )}

          {activeScreen === 'users' && (
            <UsersView
              users={users}
              onAddUser={handleAddUser}
              onToggleUserStatus={handleToggleUserStatus}
            />
          )}

          {activeScreen === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onResetDatabase={handleResetDatabase}
            />
          )}

        </main>
      </div>
    </div>
  );
}
