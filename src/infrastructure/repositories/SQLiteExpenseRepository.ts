import { IExpenseRepository } from '../../domain/repositories/IExpenseRepository';
import { Expense } from '../../domain/entities/expense';
import { BaseElectronRepository } from './BaseElectronRepository';
import type { IDatabaseDriver } from '../database/IDatabaseDriver';

export class SQLiteExpenseRepository extends BaseElectronRepository<Expense> implements IExpenseRepository {
  constructor(dbDriver?: IDatabaseDriver) {
    super('expenses', dbDriver);
  }

  async getExpenses(cafeId: string): Promise<Expense[]> {
    const list = await this.dbDriver.findMany('expenses', { cafe_id: cafeId });
    return list
      .filter((e: any) => !e.deleted_at)
      .sort((a: any, b: any) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime()) as Expense[];
  }

  async findOne(id: string): Promise<Expense | null> {
    const e = await this.dbDriver.findOne('expenses', id);
    if (!e || e.deleted_at) return null;
    return e as Expense;
  }

  async createExpense(expense: Expense): Promise<void> {
    await this.dbDriver.insert('expenses', expense as any);
  }

  async updateExpense(id: string, updates: Partial<Expense>): Promise<void> {
    await this.dbDriver.update('expenses', id, updates as any);
  }

  async deleteExpense(id: string): Promise<void> {
    await this.dbDriver.delete('expenses', id);
  }
}
