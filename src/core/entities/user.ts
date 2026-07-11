// Core user entity
// Role: 'owner' = one admin per cafe (full access), 'cashier' = limited to POS only
export interface AppUser {
  id: string; // Maps to Supabase auth.users.id
  cafe_id: string;
  role: 'owner' | 'cashier';
  name?: string | null;
  email?: string | null;
  created_at: string;
}
