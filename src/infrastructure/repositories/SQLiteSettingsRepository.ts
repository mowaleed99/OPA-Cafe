import { ISettingsRepository, AppSettings } from '../../domain/repositories/ISettingsRepository';
import { BaseElectronRepository } from './BaseElectronRepository';
import type { IDatabaseDriver } from '../database/IDatabaseDriver';

export class SQLiteSettingsRepository extends BaseElectronRepository<AppSettings> implements ISettingsRepository {
  constructor(dbDriver?: IDatabaseDriver) {
    super('settings', dbDriver);
  }

  async getSettings(cafeId: string): Promise<AppSettings | null> {
    const list = await this.dbDriver.findMany('settings', { cafe_id: cafeId });
    return list.length > 0 ? (list[0] as AppSettings) : null;
  }

  async createSettings(settings: AppSettings): Promise<void> {
    await this.dbDriver.insert('settings', settings as any);
  }

  async updateSettings(id: string, updates: Partial<AppSettings>): Promise<void> {
    await this.dbDriver.update('settings', id, updates as any);
  }
}
