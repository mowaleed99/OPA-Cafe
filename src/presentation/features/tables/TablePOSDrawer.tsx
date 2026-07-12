import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, RefreshCw, WifiOff, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { db } from '../../../infrastructure/database/db';
import { loadTableOrder } from '../../../application/useCases/pos/loadTableOrder';
import { useAuthStore } from '../../../application/store/useAuthStore';
import { useCartStore } from '../../../application/store/useCartStore';
import { loadPOSData, type POSData } from '../../../application/useCases/pos/loadPOSData';
import CategoryTabs from '../pos/CategoryTabs';
import ProductGrid from '../pos/ProductGrid';
import TableCartPanel from './TableCartPanel';

interface TablePOSDrawerProps {
  tableId: string;
  tableName: string;
  onClose: () => void;
}

export default function TablePOSDrawer({ tableId, tableName, onClose }: TablePOSDrawerProps) {
  const { t } = useTranslation();
  const { cafeId } = useAuthStore();
  const { items: localCart, addItem: handleAddProduct, clearCart, setTableId } = useCartStore();

  const [livePosData, setPosData] = useState<POSData>({ categories: [], products: [], inventoryMap: {} });
  const posData = livePosData || { categories: [], products: [], inventoryMap: {} };
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [visible, setVisible] = useState(false);

  const fetchData = useCallback(async () => {
    const cafe = cafeId();
    if (!cafe) return;
    setIsLoading(true);
    try {
      const data = await loadPOSData(cafe);
      setPosData(data);

      setTableId(tableId);
      const table = await db.dining_tables.get(tableId);
      if (table) {
        if (table.status === 'occupied' && table.current_order_id) {
          await loadTableOrder(table.current_order_id);
        } else {
          clearCart();
          setTableId(tableId);
        }
      }
    } catch (err) {
      console.error('[TablePOSDrawer] Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [cafeId, tableId, clearCart, setTableId]);

  // Animate in
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Online/offline tracking
  useEffect(() => {
    const onOnline = () => { setIsOffline(false); fetchData(); };
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [fetchData]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300); // wait for exit animation
  }, [onClose]);

  // Close on Escape — depends on handleClose so it stays fresh
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleClose]);

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Drawer panel — slides in from the right */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-5xl shadow-2xl transition-transform duration-300 ease-out ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col w-full bg-background overflow-hidden">

          {/* Drawer Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0 bg-background">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users size={18} className="text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-base text-foreground leading-tight">{tableName}</h2>
                <p className="text-xs text-muted-foreground">{t('dine_in_tables')}</p>
              </div>
              {isOffline && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <WifiOff size={12} />
                  Offline
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchData}
                disabled={isLoading}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted"
              >
                <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                {t('refresh')}
              </button>
              <button
                onClick={handleClose}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* POS Body */}
          <div className="flex flex-1 overflow-hidden">

            {/* Left: Products */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Category tabs */}
              <div className="px-5 pt-4 pb-2 shrink-0">
                <CategoryTabs
                  categories={posData.categories}
                  selected={selectedCategory}
                  onSelect={setSelectedCategory}
                />
              </div>

              {/* Product grid */}
              <div className="flex-1 overflow-y-auto px-5 pt-3 pb-5">
                {isLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <RefreshCw size={20} className="animate-spin text-muted-foreground" />
                  </div>
                ) : posData.categories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                    <p className="text-muted-foreground text-sm">Your cafe menu is currently empty.</p>
                  </div>
                ) : (
                  <ProductGrid
                    categories={posData.categories}
                    products={posData.products}
                    cartItems={localCart}
                    inventoryMap={posData.inventoryMap}
                    selectedCategory={selectedCategory}
                    onAddProduct={handleAddProduct}
                  />
                )}
              </div>
            </div>

            {/* Right: Cart */}
            <div className="w-80 xl:w-96 shrink-0 flex flex-col overflow-hidden border-l border-border">
              <TableCartPanel
                onOrderPlaced={() => fetchData()}
                onDone={handleClose}
              />
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
