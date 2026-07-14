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
  const ops: TransactionOperation[] = [
    { type: 'delete', table: 'expenses', id: expenseId },
    buildSyncOperation('delete', 'expenses', { id: expenseId })
  ];

  await executeTransaction(ops);

  if (navigator.onLine && window.electronAPI) {
    window.electronAPI.triggerSync();
  }
}
