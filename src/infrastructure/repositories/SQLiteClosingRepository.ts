import { IClosingRepository } from '../../domain/repositories/IClosingRepository';
import { DailyClosing, DailyClosingItem } from '../../domain/entities/daily_closing';

export class SQLiteClosingRepository implements IClosingRepository {
  async getClosings(cafeId: string): Promise<DailyClosing[]> {
    const list = await window.electronAPI.db.findMany('daily_closings', { cafe_id: cafeId });
    return list
      .filter((c: any) => !c.deleted_at)
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) as DailyClosing[];
  }

  async getClosingById(id: string): Promise<DailyClosing | null> {
    const c = await window.electronAPI.db.findOne('daily_closings', id);
    if (!c || c.deleted_at) return null;
    return c as DailyClosing;
  }

  async getClosingByDate(cafeId: string, date: string): Promise<DailyClosing | null> {
    const closings = await this.getClosings(cafeId);
    return closings.find(c => c.closing_date === date) || null;
  }

  async getClosingItems(closingId: string): Promise<DailyClosingItem[]> {
    const list = await window.electronAPI.db.findMany('daily_closing_items', { daily_closing_id: closingId });
    return list.filter((i: any) => !i.deleted_at) as DailyClosingItem[];
  }
}
