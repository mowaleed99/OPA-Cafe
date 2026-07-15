import { useEffect, useState, useCallback, useRef } from 'react';
import { RefreshCw, WifiOff, Search, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { createRepository } from '../../infrastructure/repositories/RepositoryFactory';
const tableRepository = createRepository<DiningTable>('dining_tables');
import { loadTableOrder } from '../../application/useCases/pos/loadTableOrder';
import { useAuthStore } from '../../application/store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../../application/store/useCartStore';
import { loadPOSData, type POSData } from '../../application/useCases/pos/loadPOSData';
import CategoryTabs from '../features/pos/CategoryTabs';
import ProductGrid from '../features/pos/ProductGrid';
import CartPanel from '../features/pos/CartPanel';
import type { Product } from '../../domain/entities/product';
import type { DiningTable } from '../../domain/entities/table';
import { Input } from '../components/ui/input';

export default function POSPage() {
  const { cafeId } = useAuthStore();
  const { items, addItem, clearCart, setTableId } = useCartStore();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('table_id');
  const { t } = useTranslation();

  const [posData, setPosData] = useState<POSData>({ categories: [], products: [], inventoryMap: {} });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [tableName, setTableName] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const cafe = cafeId();
    if (!cafe) return;
    setIsLoading(true);
    try {
      const data = await loadPOSData(cafe);
      setPosData(data);

      // Handle Table Mode
      if (tableId) {
        setTableId(tableId);
        const table = await tableRepository.findOne(tableId);
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

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+F or Ctrl+F to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      
      // Escape to clear search or unfocus
      if (e.key === 'Escape') {
        if (document.activeElement === searchInputRef.current) {
          searchInputRef.current?.blur();
        } else if (searchQuery) {
          setSearchQuery('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);



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
                {t('offline_mode', 'Offline mode')}
              </span>
            )}
          </div>
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-muted"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            {t('refresh', 'Refresh')}
          </button>
        </div>

        {/* Search & Category tabs */}
        <div className="px-6 pt-5 pb-3 shrink-0 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder={t('search_products') + ' (Ctrl+F)'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9 pe-10 h-11 bg-card border-border shadow-sm w-full md:w-1/2 lg:w-1/3"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
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
              <p className="text-muted-foreground font-medium">{t('no_products_yet')}</p>
            </div>
          ) : (
            <ProductGrid
              categories={posData.categories}
              products={posData.products}
              cartItems={items}
              inventoryMap={posData.inventoryMap}
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
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
