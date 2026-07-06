import React, { useState } from 'react';
import { Category, Product } from '../types';
import { Plus, Edit2, Trash2, Layers, X, ArrowUp, ArrowDown } from 'lucide-react';

interface CategoriesProps {
  categories: Category[];
  products: Product[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onEditCategory: (id: string, category: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
}

export default function CategoriesView({
  categories,
  products,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}: CategoriesProps) {
  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [order, setOrder] = useState<number>(1);

  const openAddModal = () => {
    setEditingCatId(null);
    setName('');
    setOrder(categories.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCatId(cat.id);
    setName(cat.name);
    setOrder(cat.order);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Category name is required');

    const payload = {
      name: name.trim(),
      order: Number(order) || 1,
    };

    if (editingCatId) {
      onEditCategory(editingCatId, payload);
    } else {
      onAddCategory(payload);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    const productsInCat = products.filter((p) => p.categoryId === id);
    if (productsInCat.length > 0) {
      alert(`Cannot delete "${name}" because it contains ${productsInCat.length} products. Reassign or delete the products first.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      onDeleteCategory(id);
    }
  };

  const moveOrder = (cat: Category, direction: 'up' | 'down') => {
    const delta = direction === 'up' ? -1 : 1;
    onEditCategory(cat.id, { order: Math.max(1, cat.order + delta) });
  };

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-100 dark:border-zinc-800 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-display font-semibold text-gray-900 dark:text-zinc-100">
            Menu Navigation Categories
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Group your hot beverages, cold press juices, and kitchen breakfast platters for touchscreen cashier quick-filtering.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-brand-bean hover:bg-brand-bean/90 dark:bg-brand-latte dark:text-zinc-950 font-semibold text-xs rounded-xl text-white flex items-center justify-center gap-1.5 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Main List Grid */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-gray-50/50 dark:bg-zinc-950/40 border-b border-gray-100 dark:border-zinc-850 flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-latte" />
          <h2 className="text-xs font-semibold uppercase tracking-wider font-display text-gray-900 dark:text-zinc-200">
            Registered Categories ({categories.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-50 dark:divide-zinc-850">
          {sortedCategories.map((cat, idx) => {
            const count = products.filter((p) => p.categoryId === cat.id).length;
            return (
              <div
                key={cat.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50/40 dark:hover:bg-zinc-950/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-beige/30 dark:bg-brand-bean/30 text-brand-bean dark:text-brand-latte flex items-center justify-center text-xs font-mono font-bold">
                    {cat.order}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-950 dark:text-zinc-100">{cat.name}</h3>
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500">{count} products assigned</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Sorting orders */}
                  <div className="flex gap-0.5 border border-gray-150 dark:border-zinc-800 rounded-md bg-gray-50 dark:bg-zinc-950 overflow-hidden">
                    <button
                      onClick={() => moveOrder(cat, 'up')}
                      disabled={cat.order <= 1}
                      className="p-1 hover:bg-gray-150 dark:hover:bg-zinc-800 text-gray-400 disabled:opacity-30"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveOrder(cat, 'down')}
                      className="p-1 hover:bg-gray-150 dark:hover:bg-zinc-800 text-gray-400"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-500 hover:text-brand-latte"
                    title="Rename / Reorder"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-gray-400 hover:text-red-600"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Categories modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-150 dark:border-zinc-800 p-5 w-full max-w-sm shadow-xl animate-scale-up">
            
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold font-display text-gray-950 dark:text-zinc-100">
                {editingCatId ? 'Configure Category' : 'Create Menu Category'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-850 rounded-lg text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Category Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brewed Tea, Hot Paninis..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-200 p-2.5 rounded-lg border border-gray-150 dark:border-zinc-850 outline-none focus:ring-1 focus:ring-brand-latte"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Sort/Display Order</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-full bg-gray-50 dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-200 p-2.5 rounded-lg border border-gray-150 dark:border-zinc-850 outline-none font-mono"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 border border-gray-200 text-gray-600 dark:border-zinc-800 dark:text-zinc-400 rounded-xl text-xs font-semibold text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-brand-bean text-white dark:bg-brand-latte dark:text-zinc-950 rounded-xl text-xs font-bold text-center"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
