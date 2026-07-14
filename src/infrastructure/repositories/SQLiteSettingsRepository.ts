import { ISettingsRepository, AppSettings } from '../../domain/repositories/ISettingsRepository';

export class SQLiteSettingsRepository implements ISettingsRepository {
  async getSettings(cafeId: string): Promise<AppSettings | null> {
    const list = await window.electronAPI.db.findMany('settings', { cafe_id: cafeId });
    return list.length > 0 ? (list[0] as AppSettings) : null;
  }

  async createSettings(settings: AppSettings): Promise<void> {
    await window.electronAPI.db.insert('settings', settings as any);
  }

  async updateSettings(id: string, updates: Partial<AppSettings>): Promise<void> {
    await window.electronAPI.db.update('settings', id, updates as any);
  }
}
