import React, { useState } from 'react';
import { Product, Category, CartItem, PaymentMethod, Order, Table } from '../types';
import { Search, ShoppingCart, Trash2, Plus, Minus, Tag, Notebook, Receipt, Check, CreditCard, User, X, LayoutGrid, Calendar, LogIn, Save, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface POSProps {
  products: Product[];
  categories: Category[];
  tables: Table[];
  currency: string;
  taxPercent: number;
  activeUser: { name: string; id: string };
  onCheckoutComplete: (
    items: CartItem[],
    paymentMethod: PaymentMethod,
    discountPercent: number,
    orderNotes?: string
  ) => void;
  onUpdateTableCart: (tableId: string, cartItems: CartItem[], discountPercent: number, notes?: string) => void;
  onClearTable: (tableId: string) => void;
}

export default function POSView({
  products,
  categories,
  tables,
  currency,
  taxPercent,
  activeUser,
  onCheckoutComplete,
  onUpdateTableCart,
  onClearTable,
}: POSProps) {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  // Navigation mode state
  const [activeTab, setActiveTab] = useState<'quick' | 'tables'>('quick');
  const [activeTableId, setActiveTableId] = useState<string | null>(null);

  // Search & Filters
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart and local discount
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [orderNotes, setOrderNotes] = useState<string>('');
  
  // Modals / Item customizer
  const [customizingIndex, setCustomizingIndex] = useState<number | null>(null);
  const [itemNote, setItemNote] = useState<string>('');
  const [itemDiscount, setItemDiscount] = useState<number>(0);
  
  // Checkout confirmation / Receipt Simulation
  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<any | null>(null);

  // Find active table details
  const activeTable = tables.find(tb => tb.id === activeTableId);

  // Filter products
  const activeProducts = products.filter((p) => p.status === 'active');
  const filteredProducts = activeProducts.filter((p) => {
    const matchesCategory = selectedCategoryId === 'all' || p.categoryId === selectedCategoryId;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return; // Out of stock
    
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIdx > -1) {
        const updated = [...prevCart];
        if (updated[existingIdx].quantity < product.stock) {
          updated[existingIdx].quantity += 1;
        }
        return updated;
      } else {
        return [...prevCart, { product, quantity: 1, notes: '', discountPercent: 0 }];
      }
    });
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart((prevCart) => {
      const updated = [...prevCart];
      const item = updated[index];
      const newQty = item.quantity + delta;
      
      if (newQty <= 0) {
        updated.splice(index, 1);
      } else if (newQty <= item.product.stock) {
        item.quantity = newQty;
      }
      return updated;
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prevCart) => prevCart.filter((_, idx) => idx !== index));
  };

  const openItemCustomizer = (index: number) => {
    setCustomizingIndex(index);
    setItemNote(cart[index].notes || '');
    setItemDiscount(cart[index].discountPercent || 0);
  };

  const saveItemCustomization = () => {
    if (customizingIndex === null) return;
    setCart((prevCart) => {
      const updated = [...prevCart];
      updated[customizingIndex].notes = itemNote;
      updated[customizingIndex].discountPercent = itemDiscount;
      return updated;
    });
    setCustomizingIndex(null);
  };

  // Calculations
  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => {
      const originalPrice = item.product.price * item.quantity;
      const discountAmount = item.discountPercent ? originalPrice * (item.discountPercent / 100) : 0;
      return sum + (originalPrice - discountAmount);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const globalDiscountAmount = subtotal * (discountPercent / 100);
  const totalAfterDiscount = subtotal - globalDiscountAmount;
  const taxAmount = totalAfterDiscount * (taxPercent / 100);
  const finalTotal = totalAfterDiscount + taxAmount;

  // Active table save state helper
  const handleSaveAndHoldTable = () => {
    if (!activeTableId) return;
    onUpdateTableCart(activeTableId, cart, discountPercent, orderNotes);
    
    // Clear state & exit
    setCart([]);
    setDiscountPercent(0);
    setOrderNotes('');
    setActiveTableId(null);
  };

  // Activate Table
  const handleSelectTable = (tb: Table) => {
    setActiveTableId(tb.id);
    setCart(tb.cartItems || []);
    setDiscountPercent(tb.discountPercent || 0);
    setOrderNotes(tb.notes || '');
  };

  // Checkout submission
  const handleCheckout = () => {
    if (cart.length === 0) return;

    // Save metadata of the order for thermal receipt popup
    const orderData = {
      id: `ord-sim-${Math.floor(Math.random() * 90000) + 10000}`,
      date: new Date().toISOString(),
      items: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        discountPercent: item.discountPercent,
        notes: item.notes
      })),
      paymentMethod,
      subtotal,
      discount: globalDiscountAmount,
      tax: taxAmount,
      total: finalTotal,
      cashierId: activeUser.id,
      cashierName: activeUser.name,
      status: 'completed',
    };

    setLastCompletedOrder(orderData);

    // Call upstream state mutation
    const notePrefix = activeTable 
      ? `Dine-in Table: ${activeTable.name}` 
      : 'Standard POS Quick Checkout';
    onCheckoutComplete(
      cart,
      paymentMethod,
      discountPercent,
      `${notePrefix}. Notes: ${orderNotes}`
    );

    // If we checkout a dine-in table, clear its state
    if (activeTableId) {
      onClearTable(activeTableId);
    }

    // Show receipt popup
    setShowReceipt(true);
    
    // Reset Cart local states
    setCart([]);
    setDiscountPercent(0);
    setPaymentMethod('Cash');
    setOrderNotes('');
    setActiveTableId(null);
  };

  const clearCart = () => {
    const confirmMsg = isAr 
      ? 'هل أنت متأكد من تفريغ سلة المشتريات بالكامل؟' 
      : 'Clear all active items from the current cart?';
    if (window.confirm(confirmMsg)) {
      setCart([]);
    }
  };

  // Compute subtotal on a table on-the-fly
  const calculateTableTotal = (tb: Table) => {
    const tableSub = tb.cartItems.reduce((sum, item) => {
      const originalPrice = item.product.price * item.quantity;
      const discountAmount = item.discountPercent ? originalPrice * (item.discountPercent / 100) : 0;
      return sum + (originalPrice - discountAmount);
    }, 0);
    const tableDisc = tableSub * (tb.discountPercent / 100);
    const tableAfterDisc = tableSub - tableDisc;
    const tableTax = tableAfterDisc * (taxPercent / 100);
    return tableAfterDisc + tableTax;
  };

  return (
    <div className="flex flex-col gap-5 h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] select-none animate-fade-in" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Top selection bar: Quick Takeaway / Dine-In Tables */}
      <div className="flex bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 p-1.5 rounded-2xl shadow-xs shrink-0 gap-3">
        <button
          onClick={() => {
            setActiveTab('quick');
            setActiveTableId(null);
            setCart([]);
            setDiscountPercent(0);
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'quick' && !activeTableId
              ? 'bg-brand-bean text-white dark:bg-brand-latte dark:text-zinc-950 shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {isAr ? 'سفري / تيك أواي' : 'Quick Takeaway'}
        </button>

        <button
          onClick={() => {
            setActiveTab('tables');
            setActiveTableId(null);
            setCart([]);
            setDiscountPercent(0);
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'tables' || activeTableId
              ? 'bg-brand-bean text-white dark:bg-brand-latte dark:text-zinc-950 shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          {isAr ? 'طاولات الصالة' : 'Dine-In Tables'}
        </button>
      </div>

      {/* RENDER GRID OF TABLES */}
      {activeTab === 'tables' && !activeTableId ? (
        <div className="flex-1 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 rounded-2xl p-5 overflow-y-auto space-y-4">
          <div>
            <h2 className="text-sm font-bold font-display uppercase tracking-wider text-gray-900 dark:text-zinc-200">
              {isAr ? 'صالة تقديم الطعام' : 'Dine-In Dining Hall'}
            </h2>
            <p className="text-[11px] text-gray-500">
              {isAr ? 'انقر فوق طاولة لفتح فاتورة جديدة أو تعديل حساب جارٍ.' : 'Select a table to open a new bill or update a running order.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
            {tables.map((tb) => {
              const isOccupied = tb.status === 'occupied';
              const billTotal = isOccupied ? calculateTableTotal(tb) : 0;
              const itemCount = isOccupied ? tb.cartItems.reduce((sum, item) => sum + item.quantity, 0) : 0;

              return (
                <button
                  key={tb.id}
                  onClick={() => handleSelectTable(tb)}
                  className={`p-5 rounded-2xl border text-center flex flex-col justify-between items-center transition-all min-h-[140px] hover:scale-102 ${
                    isOccupied
                      ? 'bg-red-50/20 border-red-200 text-red-950 dark:bg-red-950/10 dark:border-red-900/40 dark:text-red-200'
                      : 'bg-white hover:bg-gray-50 dark:bg-zinc-900 border-gray-150 dark:border-zinc-800 text-gray-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-2xl">🍽️</span>
                    <h3 className="text-xs font-bold leading-none mt-1">{tb.name}</h3>
                  </div>

                  <div className="mt-3 text-center">
                    {isOccupied ? (
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase font-bold text-red-500 bg-red-100/60 dark:bg-red-950/40 px-2 py-0.5 rounded-full font-sans">
                          {isAr ? 'مشغولة' : 'Occupied'}
                        </span>
                        <p className="text-xs font-bold font-mono text-gray-950 dark:text-white mt-1">
                          {currency}{billTotal.toFixed(2)}
                        </p>
                        <p className="text-[9px] text-gray-400 font-mono">
                          {itemCount} {isAr ? 'أصناف' : 'items'}
                        </p>
                      </div>
                    ) : (
                      <span className="text-[9px] uppercase font-bold text-emerald-500 bg-emerald-100/60 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full font-sans">
                        {isAr ? 'شاغرة' : 'Available'}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* STANDARD PRODUCT SELECTION & CART ROW (Renders for Quick Takeaway OR when a table is active) */
        <div className="flex-1 flex flex-col xl:flex-row gap-6 overflow-hidden min-h-0">
          
          {/* Left side: Category filtering and products grid */}
          <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 rounded-2xl p-4 overflow-hidden">
            
            {/* Table context header if we are operating against a table */}
            {activeTable && (
              <div className="bg-brand-crema/40 border border-brand-beige/50 dark:bg-brand-bean/15 dark:border-brand-bean/40 p-3 rounded-xl mb-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🍽️</span>
                  <div>
                    <h4 className="text-xs font-bold text-brand-espresso dark:text-brand-latte">
                      {isAr ? `تعديل حساب: ${activeTable.name}` : `Currently Editing: ${activeTable.name}`}
                    </h4>
                    <p className="text-[9px] text-gray-400 font-mono uppercase tracking-widest">
                      {isAr ? 'الخدمة في الصالة' : 'DINE-IN SERVICE BILL'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveTableId(null);
                    setCart([]);
                    setDiscountPercent(0);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-gray-50 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-xs border border-gray-150 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 rounded-lg flex items-center gap-1 font-bold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {isAr ? 'رجوع للشبكة' : 'Back to Grid'}
                </button>
              </div>
            )}

            {/* Category Header Bar & Search Row */}
            <div className="flex flex-col md:flex-row items-center gap-3 pb-4 border-b border-gray-100 dark:border-zinc-800">
              <div className="relative w-full md:w-72">
                <Search className={`w-4 h-4 text-gray-400 absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
                <input 
                  type="text" 
                  placeholder={t('pos.searchBeverages')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${isAr ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 bg-gray-50 dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-200 rounded-lg border border-gray-150 dark:border-zinc-850 outline-none`}
                />
              </div>

              {/* Slider list of categories */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full no-scrollbar pb-1">
                <button
                  onClick={() => setSelectedCategoryId('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategoryId === 'all'
                      ? 'bg-brand-bean text-white dark:bg-brand-latte dark:text-zinc-950 font-bold'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-600 dark:bg-zinc-950 dark:hover:bg-zinc-850 dark:text-zinc-400'
                  }`}
                >
                  {t('pos.allMenu')}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedCategoryId === cat.id
                        ? 'bg-brand-bean text-white dark:bg-brand-latte dark:text-zinc-950 font-bold'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-600 dark:bg-zinc-950 dark:hover:bg-zinc-850 dark:text-zinc-400'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Products selection Grid */}
            <div className="flex-1 overflow-y-auto mt-4 min-h-[150px]">
              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <span className="text-2xl">☕</span>
                  <p className="text-xs font-semibold mt-2">{t('pos.noProducts')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredProducts.map((p) => {
                    const cartItem = cart.find((item) => item.product.id === p.id);
                    const cartQty = cartItem ? cartItem.quantity : 0;
                    
                    return (
                      <button
                        key={p.id}
                        onClick={() => addToCart(p)}
                        disabled={p.stock <= 0}
                        className={`group relative text-left p-3.5 bg-gray-50/50 hover:bg-brand-crema/30 dark:bg-zinc-950/30 dark:hover:bg-brand-bean/10 rounded-2xl border transition-all flex flex-col justify-between items-start min-h-[110px] ${
                          p.stock <= 0 
                            ? 'opacity-40 cursor-not-allowed border-gray-100 dark:border-zinc-850' 
                            : 'border-gray-100 hover:border-brand-beige/65 dark:border-zinc-850 dark:hover:border-brand-bean/40'
                        }`}
                      >
                        <div className="w-full">
                          <h3 className="text-xs font-bold text-gray-900 dark:text-zinc-100 leading-tight truncate w-full">
                            {p.name}
                          </h3>
                          {p.notes && (
                            <p className="text-[9px] text-gray-400 truncate w-full mt-0.5">
                              {p.notes}
                            </p>
                          )}
                        </div>

                        <div className="w-full flex items-center justify-between mt-3">
                          <span className="text-xs font-bold font-mono text-gray-950 dark:text-zinc-100">
                            {currency}{p.price.toFixed(2)}
                          </span>
                          
                          {p.stock <= 0 ? (
                            <span className="text-[8px] bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 font-semibold px-1.5 py-0.5 rounded-sm">
                              {t('pos.soldOut')}
                            </span>
                          ) : (
                            <span className="text-[8px] px-1.5 py-0.5 font-mono text-gray-400">
                              {p.stock} {isAr ? 'حبة' : 'pcs'}
                            </span>
                          )}
                        </div>

                        {/* Active Selected Badge overlay */}
                        {cartQty > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center bg-brand-bean text-white dark:bg-brand-latte dark:text-zinc-950 rounded-full text-[10px] font-bold font-mono shadow-xs border-2 border-white dark:border-zinc-900">
                            {cartQty}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right side: Active Cart, discounts, payment and totals */}
          <div className="w-full xl:w-96 flex flex-col bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 rounded-2xl overflow-hidden shrink-0">
            
            {/* Cart Header */}
            <div className="p-4 bg-gray-50/50 dark:bg-zinc-950/40 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-brand-latte" />
                <h2 className="text-xs font-semibold uppercase tracking-wider font-display text-gray-900 dark:text-zinc-200">
                  {activeTable ? (isAr ? `${activeTable.name} - فاتورة` : `${activeTable.name} Bill`) : t('pos.currentSale')}
                </h2>
                <span className="text-[10px] font-mono bg-brand-beige/50 dark:bg-brand-bean/40 text-brand-bean dark:text-brand-latte px-2 py-0.5 rounded-full font-bold">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} {isAr ? 'قطع' : 'items'}
                </span>
              </div>
              {cart.length > 0 && (
                <button 
                  onClick={clearCart}
                  className="p-1 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                  title="Clear entire cart"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Cart Item list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[150px]">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 text-gray-400">
                  <span className="text-3xl mb-1">🛒</span>
                  <p className="text-xs font-semibold">{t('pos.emptyCart')}</p>
                  <p className="text-[10px] text-gray-400 max-w-[200px] mt-1">
                    {isAr ? 'انقر على بطاقات المنتجات في الجزء الأيمن لبدء إعداد الطلب.' : 'Tap product cards on the left grid to draft an order.'}
                  </p>
                </div>
              ) : (
                cart.map((item, idx) => {
                  const originalItemPrice = item.product.price * item.quantity;
                  const hasItemDiscount = item.discountPercent && item.discountPercent > 0;
                  const finalItemPrice = hasItemDiscount 
                    ? originalItemPrice - (originalItemPrice * (item.discountPercent! / 100))
                    : originalItemPrice;

                  return (
                    <div key={idx} className="flex gap-2 items-start border-b border-gray-50 dark:border-zinc-850/60 pb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-semibold text-gray-900 dark:text-zinc-200 leading-tight">
                            {item.product.name}
                          </h4>
                          <span className="text-xs font-mono font-bold text-gray-950 dark:text-zinc-100">
                            {currency}{finalItemPrice.toFixed(2)}
                          </span>
                        </div>

                        {/* Modifiers display */}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.notes && (
                            <span className="text-[9px] bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5 font-medium leading-none">
                              <Notebook className="w-2.5 h-2.5 shrink-0" />
                              {item.notes}
                            </span>
                          )}
                          {hasItemDiscount && (
                            <span className="text-[9px] bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5 font-medium leading-none font-mono">
                              <Tag className="w-2.5 h-2.5 shrink-0" />
                              -{item.discountPercent}%
                            </span>
                          )}
                        </div>

                        {/* Adjust qty & customization triggering */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1.5">
                            <button 
                              onClick={() => updateQuantity(idx, -1)}
                              className="w-5.5 h-5.5 rounded-md border border-gray-150 bg-gray-50 hover:bg-gray-100 dark:border-zinc-850 dark:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center justify-center text-xs font-bold"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold font-mono text-gray-900 dark:text-zinc-200 w-5 text-center">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(idx, 1)}
                              disabled={item.quantity >= item.product.stock}
                              className="w-5.5 h-5.5 rounded-md border border-gray-150 bg-gray-50 hover:bg-gray-100 dark:border-zinc-850 dark:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center justify-center text-xs font-bold disabled:opacity-40"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button 
                            onClick={() => openItemCustomizer(idx)}
                            className="text-[10px] text-brand-latte hover:underline font-semibold"
                          >
                            {isAr ? 'تعديل الصنف' : 'Customize'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Cart Totals, Discounts, and Payments Section */}
            <div className="p-4 bg-gray-50 dark:bg-zinc-950/40 border-t border-gray-100 dark:border-zinc-800 space-y-3.5">
              
              {/* Quick Discount slider or percentage selector */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-red-500" />
                  {isAr ? 'خصم السلة الترويجي' : 'Promo Discount'}
                </span>
                <div className="flex items-center gap-1">
                  {[0, 5, 10, 15].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDiscountPercent(d)}
                      className={`px-2 py-0.5 text-[10px] font-bold font-mono rounded-md border transition-colors ${
                        discountPercent === d
                          ? 'bg-red-500 text-white border-red-500'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {d === 0 ? (isAr ? 'بدون' : 'None') : `${d}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Notes / Kitchen Instructions */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 block">
                  {isAr ? 'ملاحظات وتوجيهات الطلب' : 'Kitchen Instructions / Memo'}
                </label>
                <input
                  type="text"
                  placeholder={isAr ? 'مثال: بدون سكر، الحليب منزوع الدسم...' : 'e.g. extra hot, soy milk, no sugar...'}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-[11px] rounded-lg text-gray-800 dark:text-zinc-300 outline-none"
                />
              </div>

              {/* Summary calculations list */}
              <div className="space-y-1.5 text-xs pt-1 border-t border-gray-200/50 dark:border-zinc-800/50">
                <div className="flex justify-between text-gray-500 dark:text-zinc-400">
                  <span>{t('pos.subtotal')}</span>
                  <span className="font-mono font-medium">{currency}{subtotal.toFixed(2)}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>{t('pos.discount')} ({discountPercent}%)</span>
                    <span className="font-mono font-semibold">-{currency}{globalDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500 dark:text-zinc-400">
                  <span>{t('pos.tax')} ({taxPercent}%)</span>
                  <span className="font-mono font-medium">{currency}{taxAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm pt-2 border-t border-gray-150 dark:border-zinc-800 font-bold text-gray-900 dark:text-white">
                  <span>{t('pos.total')}</span>
                  <span className="font-mono text-base text-brand-bean dark:text-brand-latte">
                    {currency}{finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* PAYMENT SELECTION FOR QUICK CHECKOUT / TABLE SETTLEMENT */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 block">
                  {t('pos.paymentMethod')}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Cash', 'Visa', 'Instapay'] as PaymentMethod[]).map((method) => {
                    const isSelected = paymentMethod === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all flex flex-col items-center justify-center gap-1 ${
                          isSelected
                            ? 'bg-brand-crema text-brand-espresso border-brand-beige dark:bg-brand-bean/30 dark:text-brand-latte dark:border-brand-bean'
                            : 'bg-white border-gray-200 text-gray-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 hover:text-gray-900'
                        }`}
                      >
                        {method === 'Cash' ? (isAr ? 'كاش' : 'Cash') : method === 'Visa' ? (isAr ? 'فيزا' : 'Visa') : (isAr ? 'إنستاباي' : 'Instapay')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ACTIONS: IF IN DINE-IN TABLE MODE, WE HAVE TWO OPTIONS: SAVE OR CHECKOUT */}
              <div className="pt-2">
                {activeTable ? (
                  <div className="grid grid-cols-2 gap-3">
                    {/* Hold Table */}
                    <button
                      onClick={handleSaveAndHoldTable}
                      disabled={cart.length === 0}
                      className="py-2.5 bg-gray-100 hover:bg-gray-150 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-gray-700 dark:text-zinc-200 font-bold text-[11px] uppercase tracking-wide rounded-xl flex items-center justify-center gap-1.5 transition-opacity disabled:opacity-40"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {isAr ? 'تعليق الفاتورة' : 'Save & Hold'}
                    </button>

                    {/* Pay & Close */}
                    <button
                      onClick={handleCheckout}
                      disabled={cart.length === 0}
                      className="py-2.5 bg-brand-bean text-white dark:bg-brand-latte dark:text-zinc-950 font-bold text-[11px] uppercase tracking-wide rounded-xl flex items-center justify-center gap-1.5 transition-opacity disabled:opacity-40"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      {isAr ? 'إغلاق ودفع' : 'Close & Pay'}
                    </button>
                  </div>
                ) : (
                  /* Standard takeaway checkout */
                  <button
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    className="w-full py-2.5 bg-brand-bean hover:bg-brand-bean/95 dark:bg-brand-latte dark:hover:bg-brand-latte/90 text-white dark:text-zinc-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider transition-opacity disabled:opacity-40"
                  >
                    <Receipt className="w-4 h-4" />
                    {t('pos.completeOrder')}
                  </button>
                )}
              </div>

            </div>
          </div>

        </div>
      )}

      {/* SINGLE ITEM CUSTOMIZER MODAL */}
      {customizingIndex !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl animate-scale-up">
            
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-zinc-850">
              <h3 className="text-xs font-bold uppercase tracking-wider font-display text-gray-950 dark:text-zinc-100">
                {isAr ? 'تعديل وتخصيص الصنف' : 'Item Modifiers & Customizer'}
              </h3>
              <button 
                onClick={() => setCustomizingIndex(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-850 rounded-lg text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[9px] uppercase font-bold text-gray-400 block mb-1">
                  {isAr ? 'اسم المنتج' : 'Selected Offering'}
                </span>
                <p className="text-xs font-bold text-gray-900 dark:text-zinc-200">
                  {cart[customizingIndex].product.name}
                </p>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 block mb-1">
                  {isAr ? 'ملاحظات تحضير المطبخ' : 'Kitchen Prep Instruction'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. decaf, skim milk, ice..."
                  value={itemNote}
                  onChange={(e) => setItemNote(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-200 p-2.5 rounded-lg border border-gray-150 dark:border-zinc-850 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 block mb-1">
                  {isAr ? 'خصم مخصص للصنف (%)' : 'Line-Item Custom Discount (%)'}
                </label>
                <div className="flex items-center gap-2">
                  {[0, 5, 10, 20, 50].map((disc) => (
                    <button
                      key={disc}
                      type="button"
                      onClick={() => setItemDiscount(disc)}
                      className={`flex-1 py-1 rounded-md text-[10px] font-bold font-mono border transition-colors ${
                        itemDiscount === disc
                          ? 'bg-red-500 text-white border-red-500'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {disc === 0 ? '0%' : `${disc}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => removeFromCart(customizingIndex)}
                  className="flex-1 py-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/20 rounded-xl text-xs font-bold text-center"
                >
                  {isAr ? 'إزالة الصنف' : 'Remove Item'}
                </button>

                <button
                  type="button"
                  onClick={saveItemCustomization}
                  className="flex-1 py-2 bg-brand-bean text-white dark:bg-brand-latte dark:text-zinc-950 rounded-xl text-xs font-bold text-center"
                >
                  {isAr ? 'حفظ التعديل' : 'Save Modifiers'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* THERMAL SIMULATED RECEIPT POPUP */}
      {showReceipt && lastCompletedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative animate-scale-up text-gray-800 my-8">
            <button 
              onClick={() => setShowReceipt(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1.5 pb-4 border-b border-dashed border-gray-200 dark:border-zinc-850">
              <span className="text-2xl bg-brand-beige/40 dark:bg-brand-bean/30 p-2 rounded-lg inline-block">☕</span>
              <h2 className="text-base font-bold uppercase tracking-wider font-display text-gray-950 dark:text-white leading-tight">
                {isAr ? 'أوبرا كافيه' : 'O P A CAFE'}
              </h2>
              <p className="text-[10px] text-gray-400 font-mono">
                {t('receiptHeader') || '100 Craftsmanship Blvd, Portland'}
              </p>
            </div>

            {/* Invoice meta */}
            <div className="py-3 text-[11px] font-mono text-gray-500 dark:text-zinc-400 border-b border-dashed border-gray-150 dark:border-zinc-850 space-y-1">
              <div className="flex justify-between">
                <span>Ref ID:</span>
                <span className="font-bold text-gray-800 dark:text-zinc-200">{lastCompletedOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(lastCompletedOrder.date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span className="font-semibold text-gray-700 dark:text-zinc-300">{lastCompletedOrder.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>Settle Method:</span>
                <span className="font-bold text-brand-bean dark:text-brand-latte uppercase">{lastCompletedOrder.paymentMethod}</span>
              </div>
            </div>

            {/* Products Breakdown */}
            <div className="py-4 space-y-2 border-b border-dashed border-gray-150 dark:border-zinc-850">
              {lastCompletedOrder.items.map((item: any, idx: number) => {
                const originalPrice = item.price * item.quantity;
                const discAmount = item.discountPercent ? originalPrice * (item.discountPercent / 100) : 0;
                const finalPrice = originalPrice - discAmount;
                
                return (
                  <div key={idx} className="flex justify-between text-[11px] font-mono">
                    <div className="space-y-0.5">
                      <span className="font-sans font-semibold text-gray-900 dark:text-zinc-200">{item.productName}</span>
                      <div className="text-[10px] text-gray-400">
                        {item.quantity} x {currency}{item.price.toFixed(2)}
                        {item.discountPercent > 0 && ` (-${item.discountPercent}%)`}
                      </div>
                    </div>
                    <span className="font-bold text-gray-950 dark:text-zinc-100">{currency}{finalPrice.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            {/* Calculations block */}
            <div className="py-3 text-xs font-mono space-y-1.5 text-gray-500 dark:text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{currency}{lastCompletedOrder.subtotal.toFixed(2)}</span>
              </div>
              {lastCompletedOrder.discount > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Discount</span>
                  <span>-{currency}{lastCompletedOrder.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax ({taxPercent}%)</span>
                <span>{currency}{lastCompletedOrder.tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm pt-2 border-t border-dashed border-gray-150 dark:border-zinc-800 font-bold text-gray-950 dark:text-white">
                <span>TOTAL PAID</span>
                <span className="text-brand-bean dark:text-brand-latte font-mono">{currency}{lastCompletedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-4 text-center space-y-1">
              <p className="text-[10px] text-gray-400 font-medium">
                {t('receiptFooter') || 'Thank you for supporting small coffee shops!'}
              </p>
              <div className="w-32 h-6 mx-auto bg-[repeating-linear-gradient(90deg,#000,#000_2px,#fff_2px,#fff_6px)] opacity-35 mt-3"></div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
