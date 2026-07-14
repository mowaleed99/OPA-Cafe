import { Expense } from '../entities/expense';

export interface IExpenseRepository {
  getExpenses(cafeId: string): Promise<Expense[]>;
  findOne(id: string): Promise<Expense | null>;
  createExpense(expense: Expense): Promise<void>;
  updateExpense(id: string, updates: Partial<Expense>): Promise<void>;
  deleteExpense(id: string): Promise<void>;
}
