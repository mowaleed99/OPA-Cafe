import { authRepository } from '../../../infrastructure/repositories/index';
import { enqueueSync } from '../../sync/syncQueue';
import bcrypt from 'bcryptjs';
import { AppUser } from '../../../domain/entities/user';

export async function createCashier(email: string, password: string, name: string, cafeId: string): Promise<{ error: string | null }> {
  try {
    const existing = await authRepository.findByEmail(email);
    if (existing) {
      return { error: 'User with this email already exists locally.' };
    }

    const newUser: AppUser = {
      id: crypto.randomUUID(),
      cafe_id: cafeId,
      role: 'cashier',
      name,
      email,
      created_at: new Date().toISOString(),
      local_password_hash: bcrypt.hashSync(password, 10),
    };

    await authRepository.insertUser(newUser);
    await enqueueSync('insert', 'app_users', newUser as unknown as Record<string, unknown>);

    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' };
  }
}
