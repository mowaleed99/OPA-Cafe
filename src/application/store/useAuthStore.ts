import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import type { AppUser } from '../../core/entities/user';
import { supabase } from '../../infrastructure/api/supabase';
import { db } from '../../infrastructure/database/db';

interface AuthState {
  session: Session | null;
  appUser: AppUser | null;
  isLoading: boolean;
  // Computed helpers
  isOwner: () => boolean;
  isCashier: () => boolean;
  cafeId: () => string | null;
  // Actions
  setSession: (session: Session | null) => void;
  setAppUser: (user: AppUser | null) => void;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  appUser: null,
  isLoading: true,

  isOwner: () => get().appUser?.role === 'owner',
  isCashier: () => get().appUser?.role === 'cashier',
  cafeId: () => get().appUser?.cafe_id ?? null,

  setSession: (session) => set({ session }),
  setAppUser: (appUser) => set({ appUser }),

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (!data.user) return { error: 'No user returned' };

    // Fetch the app_users record to get role and cafe_id
    let appUser = null;
    const { data: remoteUser, error: userError } = await supabase
      .from('app_users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (remoteUser) {
      appUser = remoteUser;
      // Update local db
      await db.app_users.put(appUser);
    } else {
      // Fallback to local DB if offline
      appUser = await db.app_users.get(data.user.id) ?? null;
    }

    if (!appUser) return { error: 'User profile not found. Contact your administrator or check connection.' };

    set({ session: data.session, appUser });
    return { error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, appUser: null });
  },

  // Call this once on app start to restore an existing session
  initialize: async () => {
    set({ isLoading: true });
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      let appUser = null;
      try {
        const { data: remoteUser } = await supabase
          .from('app_users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (remoteUser) {
          appUser = remoteUser;
          await db.app_users.put(appUser);
        }
      } catch (err) {
        // Ignore network errors
      }

      if (!appUser) {
        // Fallback to local
        appUser = await db.app_users.get(session.user.id) ?? null;
      }

      set({ session, appUser });
    }

    set({ isLoading: false });

    // Listen for future auth state changes (logout on other tabs, token refresh, etc.)
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        set({ session: null, appUser: null });
        return;
      }
      let appUser = null;
      try {
        const { data: remoteUser } = await supabase
          .from('app_users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (remoteUser) {
          appUser = remoteUser;
          await db.app_users.put(appUser);
        }
      } catch (err) {}

      if (!appUser) {
        appUser = await db.app_users.get(session.user.id) ?? null;
      }
      set({ session, appUser });
    });
  },
}));
