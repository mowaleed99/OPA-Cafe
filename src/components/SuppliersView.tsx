import React, { useState } from 'react';
import { Supplier, Purchase } from '../types';
import { Truck, Search, Plus, Phone, Mail, MapPin, X } from 'lucide-react';

interface SuppliersProps {
  suppliers: Supplier[];
  purchases: Purchase[];
  currency: string;
  onAddSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  onEditSupplier: (id: string, supplier: Partial<Supplier>) => void;
}

export default function SuppliersView({
  suppliers,
  purchases,
  currency,
  onAddSupplier,
  onEditSupplier,
}: SuppliersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    setEditingSupplier(null);
    setName('');
    setContactName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setIsModalOpen(true);
  };

  const openEditModal = (s: Supplier) => {
    setEditingSupplier(s);
    setName(s.name);
    setContactName(s.contactName);
    setPhone(s.phone);
    setEmail(s.email);
    setAddress(s.address || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Supplier name is required');

    const payload = {
      name: name.trim(),
      contactName: contactName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim() || undefined,
    };

    if (editingSupplier) {
      onEditSupplier(editingSupplier.id, payload);
    } else {
      onAddSupplier(payload);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-100 dark:border-zinc-800 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-display font-semibold text-gray-900 dark:text-zinc-100">
            Supply Vendors & Partners
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Shopify Admin style. Store your contact directory of dairy distributors, specialty coffee bean roasters, and bakery wholesalers.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-brand-bean hover:bg-brand-bean/90 dark:bg-brand-latte dark:text-zinc-950 font-semibold text-xs rounded-xl text-white flex items-center justify-center gap-1.5 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Supplier
        </button>
      </div>

      {/* Search Filter bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input 
          type="text" 
          placeholder="Search suppliers by name or contact agent..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-zinc-200 rounded-lg border border-gray-150 dark:border-zinc-800 outline-none focus:ring-1 focus:ring-brand-latte"
        />
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map((s) => {
          const supplierPurchases = purchases.filter(p => p.supplierId === s.id);
          const totalOwed = supplierPurchases.reduce((sum, p) => sum + p.amountRemaining, 0);

          return (
            <div 
              key={s.id}
              className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-brand-beige/30 dark:bg-brand-bean/30 text-brand-bean dark:text-brand-latte flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-950 dark:text-zinc-100 leading-tight">
                      {s.name}
                    </h3>
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">
                      Contact: <span className="font-semibold text-gray-600 dark:text-zinc-400">{s.contactName}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-3 py-1.5 px-2.5 bg-gray-50 dark:bg-zinc-950 rounded-lg border border-gray-100 dark:border-zinc-850 flex items-center justify-between">
                  <span className="text-[9px] text-gray-400 uppercase font-bold">Outstanding Owed</span>
                  <span className={`text-xs font-bold font-mono ${totalOwed > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {currency}{totalOwed.toFixed(2)}
                  </span>
                </div>

              {/* Direct links details */}
              <div className="mt-4 space-y-2 text-[11px] text-gray-600 dark:text-zinc-400 font-medium">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <a href={`tel:${s.phone}`} className="hover:underline">{s.phone}</a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <a href={`mailto:${s.email}`} className="hover:underline truncate">{s.email}</a>
                </div>
                {s.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                    <span className="leading-tight">{s.address}</span>
                  </div>
                )}
              </div>
            </div>

              <button
                onClick={() => openEditModal(s)}
                className="w-full mt-5 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 border border-gray-100 dark:border-zinc-800 text-center text-[10px] font-bold uppercase tracking-wider rounded-lg text-gray-700 dark:text-zinc-300"
              >
                Configure Supplier Info
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-150 dark:border-zinc-800 p-5 w-full max-w-sm shadow-xl animate-scale-up">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold font-display text-gray-950 dark:text-zinc-100">
                {editingSupplier ? 'Update Supplier Profile' : 'Register Supplier Partner'}
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
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Supplier Brand Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Portland Organic Milks..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-200 p-2.5 rounded-lg border border-gray-150 dark:border-zinc-850 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Account Manager Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Higgins"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-200 p-2.5 rounded-lg border border-gray-150 dark:border-zinc-850 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Vendor Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. (555) 019-2834"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-200 p-2.5 rounded-lg border border-gray-150 dark:border-zinc-850 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Vendor Order Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sales@valleymilks.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-200 p-2.5 rounded-lg border border-gray-150 dark:border-zinc-850 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Sourcing Address (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 12 Pasture Road, Portland, OR"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-200 p-2.5 rounded-lg border border-gray-150 dark:border-zinc-850 outline-none"
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
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
