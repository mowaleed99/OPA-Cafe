import React, { useState } from 'react';
import { UserRole } from '../types';
import { Shield, Plus, Key, ToggleLeft, ToggleRight, Check, X } from 'lucide-react';

interface UsersProps {
  users: UserRole[];
  onAddUser: (user: Omit<UserRole, 'id'>) => void;
  onToggleUserStatus: (id: string) => void;
}

export default function UsersView({
  users,
  onAddUser,
  onToggleUserStatus,
}: UsersProps) {
  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Owner' | 'Cashier'>('Cashier');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Name is required');

    // Default permissions based on role
    const permissions = role === 'Owner' 
      ? ['all_access', 'view_reports', 'edit_products', 'manage_settings', 'pos_checkout']
      : ['pos_checkout', 'manage_debts'];

    onAddUser({
      name: name.trim(),
      role,
      permissions,
      status: 'active'
    });

    setName('');
    setRole('Cashier');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-4xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-100 dark:border-zinc-800 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-display font-semibold text-gray-900 dark:text-zinc-100">
            Staff & Terminal Access Control
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Maintain cashier rosters, configure role permissions, toggle active terminals, and authorize checkout permissions.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-brand-bean hover:bg-brand-bean/90 dark:bg-brand-latte dark:text-zinc-950 font-semibold text-xs rounded-xl text-white flex items-center justify-center gap-1.5 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Staff Account
        </button>
      </div>

      {/* Staff Roster Grid */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-gray-50/50 dark:bg-zinc-950/40 border-b border-gray-100 dark:border-zinc-850 flex items-center gap-2">
          <Shield className="w-4.5 h-4.5 text-brand-latte" />
          <h2 className="text-xs font-semibold uppercase tracking-wider font-display text-gray-900 dark:text-zinc-200">
            Authorized Personnel Ledger ({users.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-zinc-800">
          {users.map((u) => {
            const isOwner = u.role === 'Owner';
            const isActive = u.status === 'active';

            return (
              <div 
                key={u.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-gray-50/30 dark:hover:bg-zinc-950/20 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    isOwner 
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' 
                      : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                  }`}>
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                      {u.name}
                      <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm ${
                        isOwner 
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300' 
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
                      }`}>
                        {u.role}
                      </span>
                    </h3>
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">UID Key: {u.id}</p>

                    {/* Permissions list */}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {u.permissions.map((perm, idx) => (
                        <span 
                          key={idx}
                          className="text-[9px] font-mono bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400 px-2 py-0.5 rounded-sm"
                        >
                          {perm.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status Toggles */}
                <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-gray-100 dark:border-transparent pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase font-semibold tracking-wider block">Status</span>
                    <span className={`text-xs font-bold flex items-center gap-1 mt-0.5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                      {isActive ? 'Active Shift' : 'Deactivated'}
                    </span>
                  </div>

                  <button
                    onClick={() => onToggleUserStatus(u.id)}
                    className={`p-1 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-850 transition-colors ${
                      isActive ? 'text-brand-latte' : 'text-gray-400'
                    }`}
                    title="Toggle staff login active status"
                  >
                    {isActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-150 dark:border-zinc-800 p-5 w-full max-w-sm shadow-xl animate-scale-up">
            
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold font-display text-gray-950 dark:text-zinc-100">
                Register New Cafe Staff
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
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Staff Member Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hana Refaat"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-200 p-2.5 rounded-lg border border-gray-150 dark:border-zinc-850 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Role Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Owner', 'Cashier'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2 text-xs font-bold rounded-lg border ${
                        role === r
                          ? 'bg-brand-bean text-white border-brand-bean dark:bg-brand-latte dark:text-zinc-950 dark:border-brand-latte'
                          : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-[10px] bg-brand-beige/25 dark:bg-brand-bean/10 p-2.5 rounded-lg text-gray-500 leading-normal">
                {role === 'Owner' 
                  ? '⚠️ Owners hold unlimited access: edit prices, view charts, settle purchases, change settings, and complete POS checks.' 
                  : '✔️ Cashiers hold restricted terminal access: login, ring sales, adjust active baskets, and log customer house tab credits.'}
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
                  Confirm Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
