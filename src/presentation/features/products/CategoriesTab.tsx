import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import type { Category } from '../../../domain/entities/category';
import { useAuthStore } from '../../../application/store/useAuthStore';
import { getCategories, deleteCategory } from '../../../application/useCases/products/manageCategories';
import { CategoryFormModal } from './CategoryFormModal';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';

export function CategoriesTab() {
  const { t } = useTranslation();
  const cafeId = useAuthStore(state => state.cafeId());

  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategories = useCallback(async () => {
    if (!cafeId) return;
    try {
      const data = await getCategories(cafeId);
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, [cafeId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const handleAdd = () => {
    setCategoryToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setCategoryToEdit(category);
    setIsModalOpen(true);
  };

  const handleDelete = (category: Category) => {
    setDeletingCategory(category);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    await deleteCategory(deletingCategory);
    setDeletingCategory(null);
    fetchCategories();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCategoryToEdit(null);
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t('categories')}</h2>
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('addCategory')}
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead className="w-[100px]">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                  {t('noCategoriesFound')}
                </TableCell>
              </TableRow>
            ) : (
              categories.map(category => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(category)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        categoryToEdit={categoryToEdit}
        onSaved={() => {
          handleModalClose();
          fetchCategories();
        }}
      />

      <ConfirmDialog
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleConfirmDelete}
        title={t('deleteCategory')}
        description={`${t('confirmDeleteCategory')} "${deletingCategory?.name}"?`}
      />
    </div>
  );
}
