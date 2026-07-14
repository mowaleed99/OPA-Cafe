import { authRepository } from '../../../infrastructure/repositories/index';
import { enqueueSync } from '../../sync/syncQueue';
import bcrypt from 'bcryptjs';

export async function updateUser(
  userId: string,
  email: string,
  password: string | null,
  name: string,
  role: 'owner' | 'cashier',
  cafeId: string
): Promise<{ error: string | null }> {
  try {
    const existing = await authRepository.findById(userId);
    if (!existing) {
      return { error: 'User not found locally.' };
    }

    const updates: any = {
      email,
      name,
      role,
      cafe_id: cafeId
    };

    if (password) {
      updates.local_password_hash = bcrypt.hashSync(password, 10);
    }

    await authRepository.updateUser(userId, updates);
    
    // Merge existing with updates for sync payload
    const syncPayload = { ...existing, ...updates };
    await enqueueSync('update', 'app_users', syncPayload as Record<string, unknown>);

    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' };
  }
}
