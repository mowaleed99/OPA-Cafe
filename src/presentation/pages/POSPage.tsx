import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../infrastructure/database/db';
import { loadTableOrder } from '../../application/useCases/pos/loadTableOrder';
import { useAuthStore } from '../../application/store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../../application/store/useCartStore';
import { loadPOSData, type POSData } from '../../application/useCases/pos/loadPOSData';
import { seedCategoriesAndProducts } from '../../application/useCases/pos/seedData';
import CategoryTabs from '../features/pos/CategoryTabs';
import ProductGrid from '../features/pos/ProductGrid';
import CartPanel from '../features/pos/CartPanel';
import type { Product } from '../../core/entities/product';

export default function POSPage() {
  const { cafeId } = useAuthStore();
  const { items, addItem, clearCart, setTableId } = useCartStore();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('table_id');
  const { t } = useTranslation();

  const livePosData = useLiveQuery(
    async () => {
      const cafe = cafeId();
      if (!cafe) return { categories: [], products: [] };
      return await loadPOSData(cafe);
    },
    [cafeId]
  );

  const posData = livePosData || { categories: [], products: [] };

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [tableName, setTableName] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const cafe = cafeId();
    if (!cafe) return;
    setIsLoading(true);
    try {
      // Handle Table Mode
      if (tableId) {
        setTableId(tableId);
        const table = await db.dining_tables.get(tableId);
        if (table) {
          setTableName(table.name_or_number);
          if (table.status === 'occupied' && table.current_order_id) {
            await loadTableOrder(table.current_order_id);
          } else {
            clearCart();
            setTableId(tableId);
          }
        }
      } else {
        setTableName(null);
        clearCart();
      }
    } catch (err) {
      console.error('[POSPage] Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [cafeId, tableId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Track online/offline status
  useEffect(() => {
    const onOnline = () => {
      setIsOffline(false);
      fetchData(); // re-fetch when back online (data may have synced)
    };
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [fetchData]);

  const handleAddProduct = useCallback((product: Product) => {
    addItem(product);
  }, [addItem]);

  const handleSeedData = async () => {
    const cafe = cafeId();
    if (!cafe) return;
    setIsLoading(true);
    try {
      await seedCategoriesAndProducts(cafe);
      // Wait a moment for Dexie writes to settle
      setTimeout(fetchData, 500);
    } catch (err) {
      console.error('Failed to seed data:', err);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* ── Left: Products panel ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-muted/20">
        {/* Topbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <h1 className="font-display font-semibold text-xl text-foreground tracking-tight flex items-center gap-2">
              {t('pos')}
              {tableName && (
                <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                  Dine-in ({tableName})
                </span>
              )}
            </h1>
            {isOffline && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-500/30">
                <WifiOff size={12} />
                Offline mode
              </span>
            )}
          </div>
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-muted"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Category tabs */}
        <div className="px-6 pt-5 pb-3 shrink-0">
          <CategoryTabs
            categories={posData.categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        {/* Product grid — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 pt-2 pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <RefreshCw size={20} className="animate-spin text-muted-foreground" />
            </div>
          ) : posData.categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <p className="text-muted-foreground font-medium">Your catalog is empty.</p>
              <button
                onClick={handleSeedData}
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-medium shadow-sm hover:opacity-90 transition-opacity active:scale-95"
              >
                Load Initial Menu Data
              </button>
            </div>
          ) : (
            <ProductGrid
              categories={posData.categories}
              products={posData.products}
              cartItems={items}
              selectedCategory={selectedCategory}
              onAddProduct={handleAddProduct}
            />
          )}
        </div>
      </div>

      {/* ── Right: Cart panel (fixed width) ──────────────────────────── */}
      <div className="w-[360px] xl:w-[400px] shrink-0 flex flex-col overflow-hidden bg-card border-l border-border shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-20">
        <CartPanel onOrderPlaced={() => fetchData()} />
      </div>
    </div>
  );
}
