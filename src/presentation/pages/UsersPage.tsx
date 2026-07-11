import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useAuthStore } from '../../application/store/useAuthStore';
import { useCashiers, CashierUser } from '../../application/useCases/users/getCashiers';
import { createCashier } from '../../application/useCases/users/createCashier';
import { updateUser } from '../../application/useCases/users/updateUser';
import { deleteUser } from '../../application/useCases/users/deleteUser';
import { Users, Plus, Shield, Loader2, X, Trash2, Eye, EyeOff } from 'lucide-react';

export default function UsersPage() {
  const { t } = useTranslation();
  const { cafeId } = useAuthStore();
  const currentCafeId = cafeId();
  const { cashiers, isLoading, error, refetch } = useCashiers(currentCafeId);
  
  // Create State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Edit/Delete State
  const [selectedUser, setSelectedUser] = useState<CashierUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<'owner' | 'cashier'>('cashier');
  const [showEditPassword, setShowEditPassword] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateCashier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCafeId) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    const { error } = await createCashier(newEmail, newPassword, newName, currentCafeId);
    
    if (error) {
      setSubmitError(error);
      setIsSubmitting(false);
      return;
    }
    
    // Success
    setIsSubmitting(false);
    setIsModalOpen(false);
    setNewEmail('');
    setNewPassword('');
    setNewName('');
    refetch();
  };

  const openEditModal = (user: CashierUser) => {
    setSelectedUser(user);
    setEditEmail(user.email || '');
    setEditPassword('');
    setEditName(user.name || '');
    setEditRole(user.role as 'owner' | 'cashier');
    setIsEditModalOpen(true);
    setEditError(null);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCafeId || !selectedUser) return;
    
    setIsEditing(true);
    setEditError(null);
    
    const { error } = await updateUser(
      selectedUser.id,
      editEmail,
      editPassword || null,
      editName,
      editRole,
      currentCafeId
    );
    
    if (error) {
      setEditError(error);
      setIsEditing(false);
      return;
    }
    
    setIsEditing(false);
    setIsEditModalOpen(false);
    refetch();
  };

  const handleDeleteUser = async () => {
    if (!currentCafeId || !selectedUser) return;
    if (!confirm(t('confirm_delete') || 'Are you sure you want to delete this user?')) return;
    
    setIsDeleting(true);
    setEditError(null);
    
    const { error } = await deleteUser(selectedUser.id, currentCafeId);
    
    if (error) {
      setEditError(error);
      setIsDeleting(false);
      return;
    }
    
    setIsDeleting(false);
    setIsEditModalOpen(false);
    refetch();
  };

  return (
    <div className="h-full flex flex-col bg-muted/20">
      {/* Header */}
      <div className="flex-shrink-0 bg-background border-b border-border p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Users className="text-primary" size={28} />
            {t('user_management_title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('manage_cashiers_desc2')}
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          {t('create_cashier_btn')}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30 font-medium text-foreground">
            {t('current_cashiers_title')}
          </div>
          
          {isLoading ? (
            <div className="p-10 flex justify-center text-muted-foreground">
              <Loader2 className="animate-spin" size={24} />
            </div>
          ) : error ? (
            <div className="p-6 text-destructive text-center">
              {t('failed_load_users')}: {error}
            </div>
          ) : cashiers.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              {t('no_cashiers')}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {cashiers.map(cashier => (
                <div 
                  key={cashier.id} 
                  onClick={() => openEditModal(cashier)}
                  className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Shield size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{cashier.name || t('cashier_account')}</p>
                      {cashier.email && <p className="text-sm text-muted-foreground">{cashier.email}</p>}
                      <p className="text-xs text-muted-foreground mt-1">ID: {cashier.id.substring(0, 8)}...</p>
                    </div>
                  </div>
                  <div className="text-sm px-3 py-1 bg-secondary text-secondary-foreground rounded-full">
                    {cashier.role}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-bold text-lg">{t('create_cashier')}</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-muted-foreground hover:bg-muted rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateCashier} className="p-5 space-y-4">
              {submitError && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
                  {submitError}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">{t('name_username')}</label>
                <input
                  required
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Ahmed"
                  className="w-full px-3 py-2 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">{t('email_address')}</label>
                <input
                  required
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="ahmed@opa.com"
                  className="w-full px-3 py-2 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">{t('password')}</label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary pe-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : null}
                  {t('create_account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-bold text-lg">{t('edit_user')}</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-muted-foreground hover:bg-muted rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="p-5 space-y-4">
              {editError && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
                  {editError}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">{t('name_username')}</label>
                <input
                  required
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">{t('email_address')}</label>
                <input
                  required
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  {t('password')} <span className="text-xs text-muted-foreground font-normal">{t('leave_blank_keep_current')}</span>
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? "text" : "password"}
                    value={editPassword}
                    onChange={e => setEditPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary pe-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showEditPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">{t('role')}</label>
                <select
                  value={editRole}
                  onChange={e => setEditRole(e.target.value as 'owner' | 'cashier')}
                  className="w-full px-3 py-2 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="cashier">{t('role_cashier') || 'Cashier'}</option>
                  <option value="owner">{t('role_owner') || 'Owner'}</option>
                </select>
              </div>
              
              <div className="pt-4 flex justify-between gap-3">
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  disabled={isDeleting || isEditing}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2"
                >
                  {isDeleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                  {t('delete_user')}
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isEditing || isDeleting}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    {isEditing ? <Loader2 className="animate-spin" size={16} /> : null}
                    {t('save_changes')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
