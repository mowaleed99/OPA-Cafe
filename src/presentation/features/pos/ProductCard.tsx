import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Product } from '../../../domain/entities/product';

import { useTranslation } from 'react-i18next';

interface ProductCardProps {
  product: Product;
  cartQuantity: number;
  inventoryStatus?: { stock_quantity: number; minimum_stock: number } | null;
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

export default React.memo(function ProductCard({ product, cartQuantity, inventoryStatus, onAdd }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { t } = useTranslation();
  const color = getCardColor(product.name);
  
  // Get 1 or 2 initials from the product name
  const initials = product.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
    
  const inCart = cartQuantity > 0;
  
  let warningBadge = null;
  if (inventoryStatus) {
    if (inventoryStatus.stock_quantity <= 0) {
      warningBadge = (
        <span className="absolute top-2 left-2 z-30 px-1.5 py-0.5 rounded-sm text-[10px] font-bold text-white shadow-sm bg-red-500/90 backdrop-blur-sm">
          {t('out_of_stock')}
        </span>
      );
    } else if (inventoryStatus.minimum_stock > 0 && inventoryStatus.stock_quantity <= inventoryStatus.minimum_stock) {
      warningBadge = (
        <span className="absolute top-2 left-2 z-30 px-1.5 py-0.5 rounded-sm text-[10px] font-bold text-white shadow-sm bg-orange-500/90 backdrop-blur-sm">
          {t('low_stock')}
        </span>
      );
    }
  }

  return (
    <button
      onClick={() => onAdd(product)}
      className={cn(
        'group relative flex flex-col rounded-md overflow-hidden border bg-card',
        'transition-all duration-150 active:scale-95 cursor-pointer text-left',
        'hover:border-primary hover:shadow-sm',
        inCart ? 'border-primary ring-1 ring-primary' : 'border-border'
      )}
      aria-label={`Add ${product.name} to cart`}
    >
      {product.image_url ? (
        <>
          {/* Colored image area */}
          <div
            className="relative flex items-center justify-center border-b border-border/50 overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
              minHeight: '110px',
            }}
          >
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover absolute inset-0"
            />
            {/* Add overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-20">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-card shadow-sm border border-border">
                <Plus size={16} className="text-foreground" />
              </div>
            </div>
          </div>
          {/* Info area */}
          <div className="p-3 flex flex-col gap-1 bg-card">
            <span className="text-[13px] font-semibold text-foreground leading-tight line-clamp-2">
              {product.name}
            </span>
            <p className="text-[13px] font-medium text-muted-foreground tabular-nums">
              {product.price.toLocaleString('en-EG', { minimumFractionDigits: 0 })} EGP
            </p>
          </div>
        </>
      ) : (
        /* Text-Only Tile Design (No image, no icon, no letter) */
        <div 
          className="flex flex-col items-center justify-center flex-1 p-4 text-center overflow-hidden relative"
          style={{ 
            background: `
              radial-gradient(circle at top right, ${color}25 0%, transparent 70%),
              radial-gradient(circle at bottom left, ${color}15 0%, transparent 60%),
              linear-gradient(135deg, ${color}10 0%, transparent 100%)
            `,
            backgroundColor: 'hsl(var(--card))',
            minHeight: '160px'
          }}
        >
          <span className="text-[15px] font-bold text-foreground leading-snug mb-1 z-10 line-clamp-3">
            {product.name}
          </span>
          <span className="text-[13px] font-bold z-10 tabular-nums drop-shadow-sm" style={{ color }}>
            {product.price.toLocaleString('en-EG', { minimumFractionDigits: 0 })} EGP
          </span>

          {/* Add overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-20">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-card shadow-sm border border-border">
              <Plus size={16} className="text-foreground" />
            </div>
          </div>
        </div>
      )}

      {/* Warning badge (absolute on top left) */}
      {warningBadge}

      {/* Cart quantity badge (absolute on top right of the whole card) */}
      {inCart && (
        <span
          className="absolute top-2 right-2 z-30 min-w-[24px] h-[24px] flex items-center justify-center rounded-sm text-xs font-bold text-primary-foreground shadow-sm bg-primary"
        >
          {cartQuantity}
        </span>
      )}
    </button>
  );
});
