import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { PlusCircle, Pencil, Trash2, Receipt, Calendar } from 'lucide-react';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import type { Expense } from '../../domain/entities/expense';
import { useAuthStore } from '../../application/store/useAuthStore';
import { useCurrency } from '../../application/utils/useCurrency';
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../../application/useCases/expenses/manageExpenses';

// ── Expense Form Modal ────────────────────────────────────────────────────────
function ExpenseModal({
  isOpen,
  onClose,
  expenseToEdit,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit: Expense | null;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const cafeId = useAuthStore(s => s.cafeId());
  
  const [category, setCategory] = useState('rent');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (expenseToEdit) {
      setCategory(expenseToEdit.category);
      setAmount(expenseToEdit.amount.toString());
      setDate(expenseToEdit.expense_date);
      setDescription(expenseToEdit.description || '');
      setIsRecurring(expenseToEdit.is_recurring);
    } else {
      setCategory('rent');
      setAmount('');
      setDate(new Date().toISOString().slice(0, 10));
      setDescription('');
      setIsRecurring(false);
    }
  }, [expenseToEdit, isOpen]);

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount)) || !date || !cafeId) return;
    setSaving(true);
    try {
      if (expenseToEdit) {
        await updateExpense({ 
          ...expenseToEdit, 
          category, 
          amount: Number(amount), 
          expense_date: date, 
          description,
          is_recurring: isRecurring
        });
      } else {
        await createExpense(cafeId, category, Number(amount), date, description, isRecurring);
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{expenseToEdit ? t('edit_expense') : t('add_expense')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-1 block">{t('category')}</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder={t('select_category')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rent">{t('rent')}</SelectItem>
                <SelectItem value="utilities">{t('utilities')}</SelectItem>
                <SelectItem value="wages">{t('wages')}</SelectItem>
                <SelectItem value="petty_cash">{t('petty_cash')}</SelectItem>
                <SelectItem value="other">{t('other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('amount')}</label>
            <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('date')}</label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('description')}</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="..." />
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="is_recurring" 
              checked={isRecurring} 
              onChange={e => setIsRecurring(e.target.checked)} 
              className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
            />
            <label htmlFor="is_recurring" className="text-sm font-medium">{t('recurring_expense')}</label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>{t('cancel')}</Button>
          <Button onClick={handleSave} disabled={saving || !amount || !date}>{t('save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ExpensesPage() {
  const { t } = useTranslation();
  const cafeId = useAuthStore(s => s.cafeId());
  const { formatCurrency } = useCurrency();
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  const load = async () => {
    if (!cafeId) return;
    setExpenses(await getExpenses(cafeId));
  };

  useEffect(() => { load(); }, [cafeId]);

  const handleEdit = (e: Expense) => { setEditing(e); setModalOpen(true); };
  const handleAdd = () => { setEditing(null); setModalOpen(true); };

  const confirmDelete = async () => {
    if (!deletingExpense) return;
    await deleteExpense(deletingExpense.id);
    setDeletingExpense(null);
    load();
  };

  const getCategoryLabel = (cat: string) => {
    const map: Record<string, string> = {
      rent: t('rent'),
      utilities: t('utilities'),
      wages: t('wages'),
      petty_cash: t('petty_cash'),
      other: t('other')
    };
    return map[cat] || cat;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t('Expenses')}</h1>
          <p className="text-muted-foreground mt-1">{t('manage_expenses_desc', 'Manage cafe operational expenses')}</p>
        </div>
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" /> {t('add_expense')}
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('date')}</TableHead>
              <TableHead>{t('category')}</TableHead>
              <TableHead>{t('description')}</TableHead>
              <TableHead className="text-right">{t('amount')}</TableHead>
              <TableHead className="w-[100px] text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  <Receipt className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  {t('no_expenses_yet', 'No expenses recorded yet')}
                </TableCell>
              </TableRow>
            ) : (
              expenses.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {e.expense_date}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                      {getCategoryLabel(e.category)}
                    </span>
                    {e.is_recurring && <span className="ml-2 text-xs text-muted-foreground">({t('recurring_expense')})</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">{e.description || '—'}</TableCell>
                  <TableCell className="text-right font-medium text-destructive">
                    -{formatCurrency(e.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(e)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeletingExpense(e)}>
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

      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        expenseToEdit={editing}
        onSaved={load}
      />

      <ConfirmDialog
        isOpen={!!deletingExpense}
        title={t('delete_expense')}
        description={t('delete_expense_confirm', 'Are you sure you want to delete this expense record? This action cannot be undone.')}
        onClose={() => setDeletingExpense(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
