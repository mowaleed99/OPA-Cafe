import { AppUser } from '../../domain/entities/user';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';

export class SQLiteAuthRepository implements IAuthRepository {
  private tableName = 'app_users';

  async findById(id: string): Promise<AppUser | null> {
    if (!window.electronAPI) throw new Error('electronAPI is not available');
    return window.electronAPI.db.findOne(this.tableName, id);
  }

  async findByEmail(email: string): Promise<AppUser | null> {
    if (!window.electronAPI) throw new Error('electronAPI is not available');
    // Using findMany with where clause
    const users = await window.electronAPI.db.findMany(this.tableName, { email });
    return users.length > 0 ? users[0] : null;
  }

  async getUsers(cafeId: string): Promise<AppUser[]> {
    if (!window.electronAPI) throw new Error('electronAPI is not available');
    return window.electronAPI.db.findMany(this.tableName, { cafe_id: cafeId });
  }

  async insertUser(user: AppUser): Promise<void> {
    if (!window.electronAPI) throw new Error('electronAPI is not available');
    await window.electronAPI.db.insert(this.tableName, user);
  }

  async updateUser(id: string, user: Partial<AppUser>): Promise<void> {
    if (!window.electronAPI) throw new Error('electronAPI is not available');
    await window.electronAPI.db.update(this.tableName, id, user);
  }

  async deleteUser(id: string): Promise<void> {
    // Soft delete implementation: we update deleted_at
    if (!window.electronAPI) throw new Error('electronAPI is not available');
    await window.electronAPI.db.update(this.tableName, id, { deleted_at: new Date().toISOString() });
  }

  async countUsers(): Promise<number> {
    if (!window.electronAPI) throw new Error('electronAPI is not available');
    // In a fully optimized app, we'd add a count query, but for users, fetching all is fine for now
    const all = await window.electronAPI.db.findMany(this.tableName, {});
    return all.length;
  }
}
