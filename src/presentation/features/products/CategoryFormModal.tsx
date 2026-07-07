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
import type { Category } from '../../../core/entities/category';
import { useAuthStore } from '../../../application/store/useAuthStore';
import { createCategory, updateCategory } from '../../../application/useCases/products/manageCategories';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
  onSaved: () => void;
}

export function CategoryFormModal({ isOpen, onClose, categoryToEdit, onSaved }: CategoryFormModalProps) {
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const cafeId = useAuthStore(state => state.cafeId());

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
    } else {
      setName('');
    }
  }, [categoryToEdit, isOpen]);

  const handleSave = async () => {
    if (!name.trim() || !cafeId) return;
    setIsSaving(true);
    try {
      if (categoryToEdit) {
        await updateCategory({ ...categoryToEdit, name });
      } else {
        await createCategory(cafeId, name);
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error('Failed to save category', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{categoryToEdit ? 'Edit Category' : 'Add Category'}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <label className="text-sm font-medium mb-1 block">Category Name</label>
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="e.g. Hot Drinks" 
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving || !name.trim()}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
