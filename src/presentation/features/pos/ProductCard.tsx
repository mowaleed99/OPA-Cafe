import { useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Product } from '../../../core/entities/product';

interface ProductCardProps {
  product: Product;
  cartQuantity: number;
  onAdd: (product: Product) => void;
}

/** Deterministic warm color from product name */
function getCardColor(name: string): string {
  const colors = [
    '#D4A373', // latte
    '#B5838D', // mauve
    '#6D9B8A', // sage
    '#8B7BA8', // lavender
    '#C27B4A', // caramel
    '#7A9E7E', // fern
    '#B07BAC', // plum
    '#4E8098', // teal
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff;
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function ProductCard({ product, cartQuantity, onAdd }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const color = getCardColor(product.name);
  const initial = product.name.charAt(0).toUpperCase();
  const inCart = cartQuantity > 0;

  return (
    <button
      onClick={() => onAdd(product)}
      className={cn(
        'group relative flex flex-col rounded-xl overflow-hidden border border-border bg-card',
        'transition-all duration-150 active:scale-95 cursor-pointer text-left',
        'hover:shadow-md hover:-translate-y-0.5',
        inCart && 'ring-2 ring-[var(--brand-latte)]/60'
      )}
      aria-label={`Add ${product.name} to cart`}
    >
      {/* Colored image area */}
      <div
        className="relative flex items-center justify-center"
        style={{
          backgroundColor: color + '22', // 13% opacity tint
          minHeight: '90px',
        }}
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover absolute inset-0"
          />
        ) : (
          <span
            className="text-3xl font-display font-bold select-none"
            style={{ color }}
          >
            {initial}
          </span>
        )}

        {/* Cart quantity badge */}
        {inCart && (
          <span
            className="absolute top-2 right-2 min-w-[22px] h-[22px] flex items-center justify-center rounded-full text-xs font-bold text-white px-1 shadow-sm"
            style={{ backgroundColor: color }}
          >
            {cartQuantity}
          </span>
        )}

        {/* Add overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shadow-md"
            style={{ backgroundColor: color }}
          >
            <Plus size={18} className="text-white" />
          </div>
        </div>
      </div>

      {/* Info area */}
      <div className="p-2.5 flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground leading-tight line-clamp-2">
          {product.name}
        </span>
        <p className="text-xs font-semibold text-foreground/90 tabular-nums">
          {product.price.toLocaleString('en-EG', { minimumFractionDigits: 0 })} EGP
        </p>
      </div>
    </button>
  );
}
