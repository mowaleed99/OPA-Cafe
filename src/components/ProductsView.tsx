import React, { useState } from 'react';
import { Product, Category } from '../types';
import { Search, Filter, Plus, Edit2, Archive, CheckCircle, AlertCircle, ShoppingCart, Trash2, X } from 'lucide-react';

interface ProductsProps {
  products: Product[];
  categories: Category[];
  currency: string;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onEditProduct: (id: string, product: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
}

export default function ProductsView({
  products,
  categories,
  currency,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}: ProductsProps) {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(10);
  const [status, setStatus] = useState<'active' | 'draft' | 'archived'>('active');
  const [notes, setNotes] = useState('');

  // Filtering products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const openAddModal = () => {
    setEditingProductId(null);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setPrice(0);
    setCost(0);
    setStock(100);
    setMinStock(15);
    setStatus('active');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProductId(p.id);
    setName(p.name);
    setCategoryId(p.categoryId);
    setPrice(p.price);
    setCost(p.cost);
    setStock(p.stock);
    setMinStock(p.minStock);
    setStatus(p.status);
    setNotes(p.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Product name is required');
    if (!categoryId) return alert('Category is required');

    const productPayload = {
      name: name.trim(),
      categoryId,
      price: Number(price),
      cost: Number(cost),
      stock: Number(stock),
      minStock: Number(minStock),
      status,
      notes: notes.trim() || undefined,
    };

    if (editingProductId) {
      onEditProduct(editingProductId, productPayload);
    } else {
      onAddProduct(productPayload);
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you absolutely sure you want to delete ${name}? This cannot be undone.`)) {
      onDeleteProduct(id);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-100 dark:border-zinc-800 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-display font-semibold text-gray-900 dark:text-zinc-100">
            Beverages & Kitchen Inventory
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Shopify-inspired product ledger. Configure cost calculations, prices, stock safety nets and sales availability states.
          </p>
        </div>
        
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-brand-bean hover:bg-brand-bean/90 dark:bg-brand-latte dark:text-zinc-950 font-semibold text-xs rounded-xl text-white flex items-center justify-center gap-1.5 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Search, Filter, Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-50/50 dark:bg-zinc-950/40 p-3 rounded-xl border border-gray-100 dark:border-zinc-850">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search items by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-zinc-200 rounded-lg border border-gray-150 dark:border-zinc-800 outline-none focus:ring-1 focus:ring-brand-latte"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-3 pr-8 py-2 bg-white dark:bg-zinc-900 text-xs text-gray-700 dark:text-zinc-300 rounded-lg border border-gray-150 dark:border-zinc-800 outline-none appearance-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <Filter className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full pl-3 pr-8 py-2 bg-white dark:bg-zinc-900 text-xs text-gray-700 dark:text-zinc-300 rounded-lg border border-gray-150 dark:border-zinc-800 outline-none appearance-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active (On POS)</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <Filter className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-55/25 dark:bg-zinc-950/60 border-b border-gray-100 dark:border-zinc-800/80 text-gray-500 dark:text-zinc-400 font-semibold">
                <th className="p-4 font-semibold">Product Information</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 text-right font-semibold">Cost Price</th>
                <th className="p-4 text-right font-semibold">Sales Price</th>
                <th className="p-4 text-right font-semibold">Gross Margin</th>
                <th className="p-4 text-center font-semibold">Stock Status</th>
                <th className="p-4 font-semibold">State</th>
                <th className="p-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-850">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-gray-400">
                    <p className="text-sm font-semibold">No products found</p>
                    <p className="text-xs text-gray-400 mt-1">Adjust filters or create your first product above.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const categoryName = categories.find((c) => c.id === p.categoryId)?.name || 'Unassigned';
                  const marginPercent = p.price > 0 ? ((p.price - p.cost) / p.price) * 100 : 0;
                  
                  // Stock badges
                  let stockBadge = (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 px-2.5 py-0.5 rounded-full">
                      {p.stock} units
                    </span>
                  );
                  if (p.stock === 0) {
                    stockBadge = (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 px-2.5 py-0.5 rounded-full">
                        Out of stock
                      </span>
                    );
                  } else if (p.stock <= p.minStock) {
                    stockBadge = (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 px-2.5 py-0.5 rounded-full">
                        Low Stock ({p.stock})
                      </span>
                    );
                  }

                  // Status badges
                  let statusBadge = (
                    <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wide bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 px-2 py-0.5 rounded-md">
                      Active
                    </span>
                  );
                  if (p.status === 'draft') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wide bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400 px-2 py-0.5 rounded-md">
                        Draft
                      </span>
                    );
                  } else if (p.status === 'archived') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wide bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 px-2 py-0.5 rounded-md">
                        Archived
                      </span>
                    );
                  }

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/40 dark:hover:bg-zinc-950/40 transition-colors">
                      {/* Name & Note */}
                      <td className="p-4">
                        <div className="font-semibold text-gray-950 dark:text-zinc-100 truncate max-w-[180px]">{p.name}</div>
                        {p.notes && <div className="text-[10px] text-gray-400 dark:text-zinc-500 truncate max-w-[180px] mt-0.5">{p.notes}</div>}
                      </td>
                      {/* Category */}
                      <td className="p-4 text-gray-600 dark:text-zinc-400 font-medium">{categoryName}</td>
                      {/* Cost */}
                      <td className="p-4 text-right font-mono text-gray-700 dark:text-zinc-400">{currency}{p.cost.toFixed(2)}</td>
                      {/* Price */}
                      <td className="p-4 text-right font-mono font-semibold text-gray-950 dark:text-zinc-100">{currency}{p.price.toFixed(2)}</td>
                      {/* Margin */}
                      <td className="p-4 text-right font-mono">
                        <span className={`font-semibold ${marginPercent > 50 ? 'text-emerald-600' : 'text-gray-600 dark:text-zinc-400'}`}>
                          {marginPercent.toFixed(0)}%
                        </span>
                      </td>
                      {/* Stock Badge */}
                      <td className="p-4 text-center">{stockBadge}</td>
                      {/* Status */}
                      <td className="p-4">{statusBadge}</td>
                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-500 hover:text-brand-latte transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Dialog overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-150 dark:border-zinc-800 p-6 w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] animate-scale-up">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-5 pb-2 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold uppercase tracking-wider font-display text-gray-950 dark:text-zinc-100">
                {editingProductId ? 'Configure Product Settings' : 'Add New Cafe Item'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-850 rounded-lg text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
              
              {/* Product Name */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pistachio Matcha Cold Foam..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-200 p-2.5 rounded-lg border border-gray-150 dark:border-zinc-850 outline-none focus:ring-1 focus:ring-brand-latte font-medium"
                />
              </div>

              {/* Grid 1: Category & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Menu Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-200 p-2.5 rounded-lg border border-gray-150 dark:border-zinc-850 outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Menu Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-gray-50 dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-200 p-2.5 rounded-lg border border-gray-150 dark:border-zinc-850 outline-none"
                  >
                    <option value="active">Active (On Sale)</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Grid 2: Cost & Price */}
              <div className="grid grid-cols-2 gap-3 bg-brand-beige/10 dark:bg-brand-bean/5 p-3 rounded-xl border border-brand-beige/30 dark:border-zinc-800">
                <div>
                  <label className="text-[10px] font-bold text-brand-bean/80 dark:text-brand-latte uppercase block mb-1">Unit Cost (Sourcing)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-gray-400">{currency}</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={cost === 0 ? '' : cost}
                      onChange={(e) => setCost(Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2 bg-white dark:bg-zinc-900 text-xs text-gray-950 dark:text-zinc-200 rounded-lg border border-gray-150 dark:border-zinc-800 outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-brand-bean/80 dark:text-brand-latte uppercase block mb-1">Sales Price (POS Retail)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-gray-400">{currency}</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={price === 0 ? '' : price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2 bg-white dark:bg-zinc-900 text-xs text-gray-950 dark:text-zinc-200 rounded-lg border border-gray-150 dark:border-zinc-800 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Grid 3: Current Stock & Minimum Safety Threshold */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Current Stock Level</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    placeholder="e.g. 150"
                    className="w-full bg-gray-50 dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-200 p-2.5 rounded-lg border border-gray-150 dark:border-zinc-850 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Low-Stock Alert Threshold</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                    placeholder="e.g. 15"
                    className="w-full bg-gray-50 dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-200 p-2.5 rounded-lg border border-gray-150 dark:border-zinc-850 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Operational Notes / Ingredients</label>
                <textarea
                  placeholder="e.g. Recipe details, milk instructions, supplier details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-gray-50 dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-200 p-2.5 rounded-lg border border-gray-150 dark:border-zinc-850 outline-none focus:ring-1 focus:ring-brand-latte"
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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
