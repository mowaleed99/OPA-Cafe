import { Package } from 'lucide-react';
import type { Category } from '../../../core/entities/category';
import type { Product } from '../../../core/entities/product';
import type { CartItem } from '../../../application/store/useCartStore';
import ProductCard from './ProductCard';

interface ProductGridProps {
  categories: Category[];
  products: Product[];
  cartItems: CartItem[];
  inventoryMap: Record<string, { stock_quantity: number; minimum_stock: number }>;
  selectedCategory: string | null;
  onAddProduct: (product: Product) => void;
}

export default function ProductGrid({
  categories,
  products,
  cartItems,
  inventoryMap,
  selectedCategory,
  onAddProduct,
}: ProductGridProps) {
  const filtered =
    selectedCategory === null
      ? products
      : products.filter((p) => p.category_id === selectedCategory);

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
      {filtered.map((product) => {
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
            onAdd={onAddProduct}
          />
        );
      })}
    </div>
  );
}
