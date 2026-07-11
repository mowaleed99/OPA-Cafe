import { supabase } from '../../../infrastructure/api/supabase';

export async function deleteUser(
  userId: string,
  cafeId: string
): Promise<{ error: string | null }> {
  try {
    const { data, error } = await supabase.functions.invoke('delete-user', {
      body: { userId, cafe_id: cafeId }
    });

    if (error) {
      return { error: error.message || 'Failed to delete user' };
    }

    if (data?.error) {
      return { error: data.error };
    }

    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' };
  }
}
