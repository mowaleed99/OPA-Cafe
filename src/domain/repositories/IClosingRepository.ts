import { DailyClosing, DailyClosingItem } from '../entities/daily_closing';

export interface IClosingRepository {
  getClosings(cafeId: string): Promise<DailyClosing[]>;
  getClosingsByDatePrefix(cafeId: string, prefix: string): Promise<DailyClosing[]>;
  getClosingById(id: string): Promise<DailyClosing | null>;
  getClosingByDate(cafeId: string, date: string): Promise<DailyClosing | null>;
  getClosingItems(closingId: string): Promise<DailyClosingItem[]>;
}
