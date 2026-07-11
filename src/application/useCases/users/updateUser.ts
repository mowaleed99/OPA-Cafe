import { supabase } from '../../../infrastructure/api/supabase';

export async function updateUser(
  userId: string,
  email: string,
  password: string | null,
  name: string,
  role: 'owner' | 'cashier',
  cafeId: string
): Promise<{ error: string | null }> {
  try {
    const payload: any = {
      userId,
      email,
      name,
      role,
      cafe_id: cafeId
    };
    if (password) {
      payload.password = password;
    }

    const { data, error } = await supabase.functions.invoke('update-user', {
      body: payload
    });

    if (error) {
      return { error: error.message || 'Failed to update user' };
    }

    if (data?.error) {
      return { error: data.error };
    }

    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' };
  }
}
