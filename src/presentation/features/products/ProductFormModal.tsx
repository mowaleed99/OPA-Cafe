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
import type { Product } from '../../../core/entities/product';
import type { Category } from '../../../core/entities/category';
import { useAuthStore } from '../../../application/store/useAuthStore';
import { createProduct, updateProduct } from '../../../application/useCases/products/manageProducts';
import { getCategories } from '../../../application/useCases/products/manageCategories';

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
  const [isSaving, setIsSaving] = useState(false);
  const cafeId = useAuthStore(state => state.cafeId());

  useEffect(() => {
    if (!isOpen) return;

    // Load categories first, THEN set form values so the Select
    // always has its options ready when the current value is applied.
    const init = async () => {
      if (cafeId) {
        const cats = await getCategories(cafeId);
        setCategories(cats);
      }

      if (productToEdit) {
        setName(productToEdit.name);
        setPrice(productToEdit.price.toString());
        setCost(productToEdit.cost.toString());
        setCategoryId(productToEdit.category_id);
      } else {
        setName('');
        setPrice('');
        setCost('');
        setCategoryId('');
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
          category_id: categoryId 
        });
      } else {
        await createProduct(cafeId, categoryId, name, parseFloat(price), parseFloat(cost) || 0);
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
          <DialogTitle>{productToEdit ? 'Edit Product' : 'Add Product'}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Product Name</label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Espresso" 
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Category</label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                {/* Compute the name ourselves — never rely on Radix's
                    item-scanning which fails when items load asynchronously */}
                <span className={categoryId && categories.find(c => c.id === categoryId) ? '' : 'text-muted-foreground'}>
                  {categoryId
                    ? (categories.find(c => c.id === categoryId)?.name ?? 'Loading...')
                    : 'Select a category'}
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
              <label className="text-sm font-medium mb-1 block">Selling Price</label>
              <Input 
                type="number" 
                step="0.01"
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                placeholder="0.00" 
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Cost (Optional)</label>
              <Input 
                type="number" 
                step="0.01"
                value={cost} 
                onChange={(e) => setCost(e.target.value)} 
                placeholder="0.00" 
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>{t('cancel')}</Button>
          <Button onClick={handleSave} disabled={isSaving || !name.trim() || !price || !categoryId}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
