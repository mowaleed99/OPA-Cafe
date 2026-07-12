import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../application/store/useAuthStore';
import { useCurrency } from '../../application/utils/useCurrency';
import { getAuditLog } from '../../application/useCases/orders/getAuditLog';
import { clearAuditLog } from '../../application/useCases/orders/clearAuditLog';
import { verifyOwnerPin } from '../../application/useCases/settings/manageOwnerPin';
import { db } from '../../infrastructure/database/db';
import type { OrderAuditLog } from '../../core/entities/order_audit_log';
import type { AppUser } from '../../core/entities/user';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Button } from '../components/ui/button';
import {
  ClipboardCheck,
  Filter,
  RotateCcw,
  ShieldAlert,
  Ban,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import PinEntryDialog from '../components/PinEntryDialog';

function ActionBadge({ type }: { type: 'void' | 'refund' }) {
  const { t } = useTranslation();
  if (type === 'void') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
        <Ban size={11} />
        {t('action_voided')}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
      <RotateCcw size={11} />
      {t('action_refunded')}
    </span>
  );
}

export default function AuditLogPage() {
  const { t } = useTranslation();
  const cafeId = useAuthStore(s => s.cafeId());
  const { formatCurrency } = useCurrency();

  const [entries, setEntries] = useState<OrderAuditLog[]>([]);
  const [cashiers, setCashiers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [from, setFrom] = useState(thirtyDaysAgo);
  const [to, setTo] = useState(today);

  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>('all');

  const loadData = async () => {
    if (!cafeId) return;
    setIsLoading(true);
    try {
      // Load cashier list for filter dropdown
      const users = await db.app_users.where('cafe_id').equals(cafeId).toArray();
      setCashiers(users);

      // Load filtered audit entries
      const data = await getAuditLog(cafeId, {
        from,
        to,
        userId: selectedUser !== 'all' ? selectedUser : undefined,
      });
      setEntries(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cafeId]);

  const handleApplyFilters = () => loadData();

  const handleResetFilters = () => {
    setFrom(thirtyDaysAgo);
    setTo(today);
    setSelectedUser('all');
    setTimeout(() => loadData(), 0);
  };

  const handleClearLog = async (pin: string) => {
    setIsClearing(true);
    setPinError(null);
    try {
      const isValid = await verifyOwnerPin(cafeId, pin);
      if (!isValid) {
        setPinError(t('pin_incorrect'));
        setIsClearing(false);
        return;
      }
      
      await clearAuditLog(cafeId);
      await loadData();
      setIsPinDialogOpen(false);
    } catch (err) {
      console.error('Failed to clear audit log:', err);
      alert(t('void_error')); // Reuse generic error msg
    } finally {
      setIsClearing(false);
    }
  };

  const voidCount = entries.filter(e => e.action_type === 'void').length;
  const refundCount = entries.filter(e => e.action_type === 'refund').length;
  const totalAmount = entries.reduce((sum, e) => sum + e.order_total, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <ClipboardCheck size={22} className="text-primary" />
            {t('audit_log')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t('audit_log_desc')}</p>
        </div>
        <Button 
          variant="destructive" 
          onClick={() => setIsPinDialogOpen(true)}
          disabled={entries.length === 0}
        >
          <Trash2 size={16} className="mr-2 rtl:ml-2 rtl:mr-0" />
          {t('clear_audit_log')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card shadow-sm p-4">
          <p className="text-xs text-muted-foreground mb-1">{t('total_actions')}</p>
          <p className="text-2xl font-bold text-foreground">{entries.length}</p>
        </div>
        <div className="rounded-xl border bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800 shadow-sm p-4">
          <p className="text-xs text-orange-600 dark:text-orange-400 mb-1">{t('action_voided')}</p>
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{voidCount}</p>
        </div>
        <div className="rounded-xl border bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 shadow-sm p-4">
          <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">{t('action_refunded')}</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{refundCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={15} className="text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">{t('filter_by_date')}</h3>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t('from_date')}</label>
            <Input
              type="date"
              value={from}
              onChange={e => setFrom(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t('to_date')}</label>
            <Input
              type="date"
              value={to}
              onChange={e => setTo(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t('filter_by_cashier')}</label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('all_cashiers')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_cashiers')}</SelectItem>
                {cashiers.map(u => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name ?? u.email ?? u.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleApplyFilters} disabled={isLoading} className="flex items-center gap-2">
            <Filter size={14} />
            {t('apply_filters')}
          </Button>
          <Button variant="outline" onClick={handleResetFilters} disabled={isLoading}>
            {t('reset')}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <ShieldAlert size={15} className="text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              {t('void_refund_actions')}
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {t('total_amount_affected')}: <span className="font-semibold text-foreground">{formatCurrency(totalAmount)}</span>
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
            <RefreshCw size={18} className="animate-spin" />
            <span className="text-sm">{t('loading')}</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <ClipboardCheck size={40} className="text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t('no_audit_entries')}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('date_time')}</TableHead>
                <TableHead>{t('action_type')}</TableHead>
                <TableHead>{t('order_id_short')}</TableHead>
                <TableHead>{t('initiated_by')}</TableHead>
                <TableHead>{t('reason')}</TableHead>
                <TableHead className="text-right">{t('order_amount')}</TableHead>
                <TableHead className="text-center">{t('pin_approved')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map(entry => (
                <TableRow key={entry.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(entry.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <ActionBadge type={entry.action_type} />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{entry.order_id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell className="text-sm">
                    {entry.initiated_by_name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {entry.reason || <span className="italic opacity-50">{t('no_reason')}</span>}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(entry.order_total)}
                  </TableCell>
                  <TableCell className="text-center">
                    {entry.approved_by_owner_pin && (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        <ShieldAlert size={12} />
                        {t('yes')}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <PinEntryDialog
        isOpen={isPinDialogOpen}
        onClose={() => {
          setIsPinDialogOpen(false);
          setPinError(null);
        }}
        onSubmit={handleClearLog}
        title={t('clear_audit_log')}
        description={t('clear_audit_log_confirm')}
        isLoading={isClearing}
        error={pinError}
      />
    </div>
  );
}
