import { authRepository } from '../../../infrastructure/repositories/index';
import { enqueueSync } from '../../sync/syncQueue';

export async function deleteUser(
  userId: string,
  cafeId: string
): Promise<{ error: string | null }> {
  try {
    const existing = await authRepository.findById(userId);
    if (!existing) {
      return { error: 'User not found locally.' };
    }

    await authRepository.deleteUser(userId); // Performs soft delete internally
    await enqueueSync('delete', 'app_users', { id: userId, cafe_id: cafeId });

    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' };
  }
}
