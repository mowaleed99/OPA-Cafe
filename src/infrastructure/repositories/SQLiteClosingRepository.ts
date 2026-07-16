import { IClosingRepository } from '../../domain/repositories/IClosingRepository';
import { DailyClosing, DailyClosingItem } from '../../domain/entities/daily_closing';
import { BaseElectronRepository } from './BaseElectronRepository';
import type { IDatabaseDriver } from '../database/IDatabaseDriver';

export class SQLiteClosingRepository extends BaseElectronRepository<DailyClosing> implements IClosingRepository {
  constructor(dbDriver?: IDatabaseDriver) {
    super('daily_closings', dbDriver);
  }

  async getClosings(cafeId: string): Promise<DailyClosing[]> {
    const list = await this.dbDriver.findMany('daily_closings', { cafe_id: cafeId }, {
      orderBy: { column: 'closed_at', direction: 'desc' }
    });
    return list.filter((c: any) => !c.deleted_at) as DailyClosing[];
  }

  async getClosingsByDatePrefix(cafeId: string, prefix: string): Promise<DailyClosing[]> {
    const list = await this.dbDriver.findMany('daily_closings', {
      cafe_id: cafeId,
      closing_date: { $gte: `${prefix}-01`, $lte: `${prefix}-31` }
    }, {
      orderBy: { column: 'closing_date', direction: 'asc' }
    } as any);
    return list.filter((c: any) => !c.deleted_at) as DailyClosing[];
  }

  async getClosingById(id: string): Promise<DailyClosing | null> {
    const c = await this.dbDriver.findOne('daily_closings', id);
    if (!c || c.deleted_at) return null;
    return c as DailyClosing;
  }

  async getClosingByDate(cafeId: string, date: string): Promise<DailyClosing | null> {
    const list = await this.dbDriver.findMany('daily_closings', {
      cafe_id: cafeId,
      closing_date: date
    });
    const valid = list.filter((c: any) => !c.deleted_at) as DailyClosing[];
    return valid[0] || null;
  }

  async getClosingItems(closingId: string): Promise<DailyClosingItem[]> {
    const list = await this.dbDriver.findMany('daily_closing_items', { daily_closing_id: closingId });
    return list.filter((i: any) => !i.deleted_at) as DailyClosingItem[];
  }
}
