import { IExpenseRepository } from '../../domain/repositories/IExpenseRepository';
import { Expense } from '../../domain/entities/expense';

export class SQLiteExpenseRepository implements IExpenseRepository {
  async getExpenses(cafeId: string): Promise<Expense[]> {
    const list = await window.electronAPI.db.findMany('expenses', { cafe_id: cafeId });
    return list
      .filter((e: any) => !e.deleted_at)
      .sort((a: any, b: any) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime()) as Expense[];
  }

  async findOne(id: string): Promise<Expense | null> {
    const e = await window.electronAPI.db.findOne('expenses', id);
    if (!e || e.deleted_at) return null;
    return e as Expense;
  }

  async createExpense(expense: Expense): Promise<void> {
    await window.electronAPI.db.insert('expenses', expense as any);
  }

  async updateExpense(id: string, updates: Partial<Expense>): Promise<void> {
    await window.electronAPI.db.update('expenses', id, updates as any);
  }

  async deleteExpense(id: string): Promise<void> {
    await window.electronAPI.db.delete('expenses', id);
  }
}
