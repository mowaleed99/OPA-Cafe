import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import type { Product } from '../../../domain/entities/product';
import type { Category } from '../../../domain/entities/category';
import { useAuthStore } from '../../../application/store/useAuthStore';
import { createProduct, updateProduct } from '../../../application/useCases/products/manageProducts';
import { getCategories } from '../../../application/useCases/products/manageCategories';
import { getInventoryItems } from '../../../application/useCases/inventory/manageInventory';
import type { InventoryItem } from '../../../domain/entities/inventory';
import { Search } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  onSaved: () => void;
}

export function ProductFormModal({ isOpen, onClose, productToEdit, onSaved }: ProductFormModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [trackStock, setTrackStock] = useState(false);
  const [inventoryItemId, setInventoryItemId] = useState('');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventorySearch, setInventorySearch] = useState('');
  const [isInventoryDropdownOpen, setIsInventoryDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const cafeId = useAuthStore(state => state.cafeId());

  useEffect(() => {
    if (!isOpen) return;

    // Load categories first, THEN set form values so the Select
    // always has its options ready when the current value is applied.
    const init = async () => {
      if (cafeId) {
        const [cats, items] = await Promise.all([
          getCategories(cafeId),
          getInventoryItems(cafeId)
        ]);
        setCategories(cats);
        setInventoryItems(items);
      }

      if (productToEdit) {
        setName(productToEdit.name);
        setPrice(productToEdit.price.toString());
        setCost(productToEdit.cost.toString());
        setCategoryId(productToEdit.category_id);
        setTrackStock(productToEdit.track_stock || false);
        setInventoryItemId(productToEdit.inventory_item_id || '');
      } else {
        setName('');
        setPrice('');
        setCost('');
        setCategoryId('');
        setTrackStock(false);
        setInventoryItemId('');
        setInventorySearch('');
      }
    };

    init();
  }, [isOpen, cafeId, productToEdit]);

  const handleSave = async () => {
    if (!name.trim() || !price || !categoryId || !cafeId) return;

    setIsSaving(true);
    try {
      if (productToEdit) {
        await updateProduct({ 
          ...productToEdit, 
          name, 
          price: parseFloat(price), 
          cost: parseFloat(cost) || 0,
          category_id: categoryId,
          track_stock: trackStock,
          inventory_item_id: trackStock ? (inventoryItemId || null) : null
        });
      } else {
        await createProduct(
          cafeId, 
          categoryId, 
          name, 
          parseFloat(price), 
          parseFloat(cost) || 0,
          trackStock,
          trackStock ? (inventoryItemId || null) : null
        );
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error('Failed to save product', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{productToEdit ? t('edit_product') : t('add_product')}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">{t('product_name')}</label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder={t('product_name_placeholder')} 
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('category_label')}</label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                {/* Compute the name ourselves — never rely on Radix's
                    item-scanning which fails when items load asynchronously */}
                <span className={categoryId && categories.find(c => c.id === categoryId) ? '' : 'text-muted-foreground'}>
                  {categoryId
                    ? (categories.find(c => c.id === categoryId)?.name ?? 'Loading...')
                    : t('select_category')}
                </span>
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">{t('selling_price')}</label>
              <Input 
                type="number" 
                step="0.01"
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                placeholder="0.00" 
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">{t('cost_optional')}</label>
              <Input 
                type="number" 
                step="0.01"
                value={cost} 
                onChange={(e) => setCost(e.target.value)} 
                placeholder="0.00" 
              />
            </div>
          </div>

          <div className="pt-4 border-t mt-4">
            <label className="flex items-center gap-2 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={trackStock}
                onChange={e => setTrackStock(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="text-sm font-medium">{t('track_stock_automatically')}</span>
            </label>

            {trackStock && (
              <div className="relative">
                <label className="text-sm font-medium mb-1 block text-muted-foreground">
                  {t('select_inventory_item')} ({t('optional_auto_create')})
                </label>
                
                {!isInventoryDropdownOpen ? (
                  <div 
                    className="flex items-center justify-between h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-muted/50"
                    onClick={() => setIsInventoryDropdownOpen(true)}
                  >
                    <span className={!inventoryItemId ? 'text-muted-foreground' : ''}>
                      {inventoryItemId 
                        ? inventoryItems.find(i => i.id === inventoryItemId)?.name || t('unknown_item')
                        : t('auto_create_new_item')}
                    </span>
                  </div>
                ) : (
                  <div className="border rounded-md shadow-sm bg-card overflow-hidden">
                    <div className="flex items-center px-3 border-b">
                      <Search className="h-4 w-4 text-muted-foreground mr-2" />
                      <input
                        autoFocus
                        className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                        placeholder={t('search_inventory_items')}
                        value={inventorySearch}
                        onChange={(e) => setInventorySearch(e.target.value)}
                        onBlur={(e) => {
                          // Close dropdown if clicking outside
                          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                            // slight delay to allow click on item
                            setTimeout(() => setIsInventoryDropdownOpen(false), 200);
                          }
                        }}
                      />
                    </div>
                    <div className="max-h-[200px] overflow-y-auto p-1">
                      <div
                        className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-muted-foreground italic"
                        onMouseDown={() => {
                          setInventoryItemId('');
                          setInventorySearch('');
                          setIsInventoryDropdownOpen(false);
                        }}
                      >
                        {t('auto_create_new_item')}
                      </div>
                      {inventoryItems
                        .filter(item => item.name.toLowerCase().includes(inventorySearch.toLowerCase()))
                        .map(item => (
                          <div
                            key={item.id}
                            className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                            onMouseDown={() => {
                              setInventoryItemId(item.id);
                              setInventorySearch('');
                              setIsInventoryDropdownOpen(false);
                            }}
                          >
                            {item.name}
                          </div>
                      ))}
                      {inventoryItems.filter(item => item.name.toLowerCase().includes(inventorySearch.toLowerCase())).length === 0 && (
                        <p className="py-6 text-center text-sm text-muted-foreground">{t('no_items_found')}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>{t('cancel')}</Button>
          <Button onClick={handleSave} disabled={isSaving || !name.trim() || !price || !categoryId}>
            {t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

