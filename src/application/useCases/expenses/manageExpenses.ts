import { buildSyncOperation, enqueueSync } from '../../sync/syncQueue';
import { expenseRepository } from '../../../infrastructure/repositories/index';
import { executeTransaction, TransactionOperation } from '../../../infrastructure/database/transaction';
import type { Expense } from '../../../domain/entities/expense';

export async function getExpenses(cafeId: string): Promise<Expense[]> {
  return await expenseRepository.getExpenses(cafeId);
}

export async function createExpense(
  cafeId: string,
  category: string,
  amount: number,
  expense_date: string,
  description: string,
  is_recurring: boolean
): Promise<Expense> {
  if (Number(amount) <= 0) throw new Error('Expense amount must be greater than zero');

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

  const ops: TransactionOperation[] = [
    { type: 'insert', table: 'expenses', data: expense },
    buildSyncOperation('insert', 'expenses', expense as unknown as Record<string, unknown>)
  ];

  await executeTransaction(ops);

  if (navigator.onLine && window.electronAPI) {
    window.electronAPI.triggerSync();
  }

  return expense;
}

export async function updateExpense(expense: Expense): Promise<void> {
  if (Number(expense.amount) <= 0) throw new Error('Expense amount must be greater than zero');

  expense.updated_at = new Date().toISOString();
  expense.amount = Number(expense.amount);
  
  const ops: TransactionOperation[] = [
    { type: 'update', table: 'expenses', id: expense.id, data: expense },
    buildSyncOperation('update', 'expenses', expense as unknown as Record<string, unknown>)
  ];

  await executeTransaction(ops);

  if (navigator.onLine && window.electronAPI) {
    window.electronAPI.triggerSync();
  }
}

export async function deleteExpense(expenseId: string): Promise<void> {
  const now = new Date().toISOString();
  const ops: TransactionOperation[] = [
    { type: 'update', table: 'expenses', id: expenseId, data: { deleted_at: now } },
    buildSyncOperation('update', 'expenses', { id: expenseId, deleted_at: now })
  ];

  await executeTransaction(ops);

  if (navigator.onLine && window.electronAPI) {
    window.electronAPI.triggerSync();
  }
}
