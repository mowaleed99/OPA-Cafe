import { db } from '../../../infrastructure/database/db';
import { enqueueSync } from '../../sync/syncQueue';
import type { Expense } from '../../../core/entities/expense';

export async function getExpenses(cafeId: string): Promise<Expense[]> {
  return await db.expenses
    .where('cafe_id')
    .equals(cafeId)
    .reverse()
    .sortBy('expense_date');
}

export async function createExpense(
  cafeId: string,
  category: string,
  amount: number,
  expense_date: string,
  description: string,
  is_recurring: boolean
): Promise<Expense> {
  const now = new Date().toISOString();
  const expense: Expense = {
    id: crypto.randomUUID(),
    cafe_id: cafeId,
    category,
    amount: Number(amount),
    expense_date,
    description,
    is_recurring,
    created_at: now,
    updated_at: now,
  };

  await db.transaction('rw', db.expenses, db.sync_queue, async () => {
    await db.expenses.add(expense);
    await enqueueSync('insert', 'expenses', expense as any);
  });

  return expense;
}

export async function updateExpense(expense: Expense): Promise<void> {
  expense.updated_at = new Date().toISOString();
  expense.amount = Number(expense.amount);
  
  await db.transaction('rw', db.expenses, db.sync_queue, async () => {
    await db.expenses.put(expense);
    await enqueueSync('update', 'expenses', expense as any);
  });
}

export async function deleteExpense(expenseId: string): Promise<void> {
  await db.transaction('rw', db.expenses, db.sync_queue, async () => {
    await db.expenses.delete(expenseId);
    await enqueueSync('delete', 'expenses', { id: expenseId });
  });
}
