import { AppUser } from '../entities/user';

export interface IAuthRepository {
  findById(id: string): Promise<AppUser | null>;
  findByEmail(email: string): Promise<AppUser | null>;
  getUsers(cafeId: string): Promise<AppUser[]>;
  insertUser(user: AppUser): Promise<void>;
  updateUser(id: string, user: Partial<AppUser>): Promise<void>;
  deleteUser(id: string): Promise<void>;
  countUsers(): Promise<number>;
}
