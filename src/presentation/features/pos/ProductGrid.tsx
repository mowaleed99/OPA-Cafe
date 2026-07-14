import { Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Category } from '../../../domain/entities/category';
import type { Product } from '../../../domain/entities/product';
import type { CartItem } from '../../../application/store/useCartStore';
import ProductCard from './ProductCard';

interface ProductGridProps {
  categories: Category[];
  products: Product[];
  cartItems: CartItem[];
  inventoryMap: Record<string, { stock_quantity: number; minimum_stock: number }>;
  selectedCategory: string | null;
  searchQuery?: string;
  onAddProduct: (product: Product) => void;
}

export default function ProductGrid({
  categories,
  products,
  cartItems,
  inventoryMap,
  selectedCategory,
  searchQuery = '',
  onAddProduct,
}: ProductGridProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const filtered = products.filter((p) => {
    const matchesCategory = selectedCategory === null || p.category_id === selectedCategory;
    const matchesSearch = searchQuery === '' || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Reset focus when filters change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [selectedCategory, searchQuery]);

  // Handle global keyboard navigation for the grid
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if focus is inside an input unless it's the search input (but we want arrow keys to work even when search is focused)
      const isInput = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';
      
      // If we are in an input and it's NOT the search input, ignore.
      // If it IS the search input, we still want to allow down arrow to start navigating.
      if (isInput && e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Enter') {
        return;
      }

      if (filtered.length === 0) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusedIndex(prev => (prev < filtered.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        // Assuming ~4 items per row, rough navigation
        setFocusedIndex(prev => (prev === -1 ? 0 : Math.min(prev + 4, filtered.length - 1)));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 4, 0));
      } else if (e.key === 'Enter' && focusedIndex >= 0) {
        e.preventDefault();
        onAddProduct(filtered[focusedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filtered, focusedIndex, onAddProduct]);

  if (filtered.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-16">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
          <Package size={24} className="text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">No products here</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {selectedCategory
              ? 'No active products in this category'
              : 'Add products from the Products page'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="grid gap-3"
      style={{
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
      }}
    >
      {filtered.map((product, index) => {
        const cartItem = cartItems.find((i) => i.product.id === product.id);
        const invStatus = product.track_stock && product.inventory_item_id
          ? inventoryMap[product.inventory_item_id] || null
          : null;
        
        return (
          <ProductCard
            key={product.id}
            product={product}
            cartQuantity={cartItem?.quantity ?? 0}
            inventoryStatus={invStatus}
            isFocused={index === focusedIndex}
            onAdd={onAddProduct}
          />
        );
      })}
    </div>
  );
}
