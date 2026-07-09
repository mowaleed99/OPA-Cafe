import { supabase } from '../../../infrastructure/api/supabase';

export async function createCashier(email: string, password: string, name: string, cafeId: string): Promise<{ error: string | null }> {
  try {
    // We call our secure Edge Function to bypass email confirmation
    // and securely insert into app_users using the Service Role Key.
    const { data, error } = await supabase.functions.invoke('create-cashier', {
      body: { email, password, name, cafe_id: cafeId }
    });

    if (error) {
      return { error: error.message || 'Failed to create cashier' };
    }

    if (data?.error) {
      return { error: data.error };
    }

    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' };
  }
}
