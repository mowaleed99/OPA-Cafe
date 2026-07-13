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
    if (!navigator.onLine) {
      return { error: 'You are offline. Please connect to the internet to sign in.' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (!data.user) return { error: 'No user returned' };

    let appUser = null;
    try {
      const { data: remoteUser, error: userError } = await supabase
        .from('app_users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (remoteUser) {
        appUser = remoteUser;
        await db.app_users.put(appUser);
      }
    } catch (err) {
      console.warn('Could not fetch remote user, falling back to local DB', err);
    }

    if (!appUser) {
      appUser = await db.app_users.get(data.user.id) ?? null;
    }

    if (!appUser) return { error: 'User profile not found. Contact your administrator or check connection.' };

    set({ session: data.session, appUser });
    return { error: null };
  },

  signOut: async () => {
    try {
      if (navigator.onLine) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.error('Logout error:', e);
    }
    set({ session: null, appUser: null });
  },

  initialize: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // 1. Load from local DB immediately (Stale-while-revalidate)
        let appUser = await db.app_users.get(session.user.id) ?? null;
        set({ session, appUser, isLoading: false });

        // 2. Fetch remote asynchronously without blocking
        if (navigator.onLine) {
          supabase
            .from('app_users')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(async ({ data }) => {
              if (data) {
                await db.app_users.put(data);
                // Only update state if we actually changed something to avoid re-renders
                set((state) => ({ ...state, appUser: data }));
              }
            })
            .catch(err => {
              console.warn('Failed to fetch remote user in background:', err);
            });
        }
      } else {
        set({ session: null, appUser: null, isLoading: false });
      }
    } catch (e) {
      console.error('Initialize error:', e);
      set({ isLoading: false });
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        set({ session: null, appUser: null });
        return;
      }
      
      // Local first
      let appUser = await db.app_users.get(session.user.id) ?? null;
      set({ session, appUser });

      // Remote async
      if (navigator.onLine) {
        supabase
          .from('app_users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(async ({ data }) => {
            if (data) {
              await db.app_users.put(data);
              set((state) => ({ ...state, appUser: data }));
            }
          })
          .catch(err => {
            console.warn('Failed to fetch remote user on auth change in background:', err);
          });
      }
    });
  },
}));
