import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useAuthStore } from '../../application/store/useAuthStore';
import { useCashiers } from '../../application/useCases/users/getCashiers';
import { createCashier } from '../../application/useCases/users/createCashier';
import { Users, Plus, Shield, Loader2, X } from 'lucide-react';

export default function UsersPage() {
  const { t } = useTranslation();
  const { cafeId } = useAuthStore();
  const currentCafeId = cafeId();
  const { cashiers, isLoading, error, refetch } = useCashiers(currentCafeId);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  return (
    <div className="h-full flex flex-col bg-muted/20">
      {/* Header */}
      <div className="flex-shrink-0 bg-background border-b border-border p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Users className="text-primary" size={28} />
            User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage cashier accounts for OPA CAFE.
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          Create Cashier
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30 font-medium text-foreground">
            Current Cashiers
          </div>
          
          {isLoading ? (
            <div className="p-10 flex justify-center text-muted-foreground">
              <Loader2 className="animate-spin" size={24} />
            </div>
          ) : error ? (
            <div className="p-6 text-destructive text-center">
              Failed to load users: {error}
            </div>
          ) : cashiers.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              No cashiers found. Create one to get started.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {cashiers.map(cashier => (
                <div key={cashier.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Shield size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{t('cashier_account')}</p>
                      <p className="text-xs text-muted-foreground">ID: {cashier.id.substring(0, 8)}...</p>
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
                <label className="text-sm font-medium text-foreground">Name (Username)</label>
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
                <input
                  required
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : null}
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
