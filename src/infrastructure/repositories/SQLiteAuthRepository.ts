import { AppUser } from '../../domain/entities/user';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import type { IDatabaseDriver } from '../database/IDatabaseDriver';
import { defaultDatabaseDriver } from '../database/ElectronIpcDatabaseDriver';

export class SQLiteAuthRepository implements IAuthRepository {
  private tableName = 'app_users';

  constructor(private dbDriver: IDatabaseDriver = defaultDatabaseDriver) {}

  async findById(id: string): Promise<AppUser | null> {
    return this.dbDriver.findOne(this.tableName, id);
  }

  async findByEmail(email: string): Promise<AppUser | null> {
    const users = await this.dbDriver.findMany<AppUser>(this.tableName, { email });
    return users.length > 0 ? users[0] : null;
  }

  async getUsers(cafeId: string): Promise<AppUser[]> {
    return this.dbDriver.findMany<AppUser>(this.tableName, { cafe_id: cafeId });
  }

  async insertUser(user: AppUser): Promise<void> {
    await this.dbDriver.insert(this.tableName, user);
  }

  async updateUser(id: string, user: Partial<AppUser>): Promise<void> {
    await this.dbDriver.update(this.tableName, id, user);
  }

  async deleteUser(id: string): Promise<void> {
    await this.dbDriver.update(this.tableName, id, { deleted_at: new Date().toISOString() });
  }

  async countUsers(): Promise<number> {
    const all = await this.dbDriver.findMany(this.tableName, {});
    return all.length;
  }
}
