import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import type { AppUser } from '../../domain/entities/user';
import { AuthService } from '../services/AuthService';

interface AuthState {
  session: Session | null;
  appUser: AppUser | null;
  isLoading: boolean;
  isOwner: () => boolean;
  isCashier: () => boolean;
  cafeId: () => string | null;
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

  setSession: (session) => {
    if (typeof localStorage !== 'undefined') {
      if (session?.user) localStorage.setItem('offline_user_id', session.user.id);
      else localStorage.removeItem('offline_user_id');
    }
    set({ session });
  },
  
  setAppUser: (appUser) => set({ appUser }),

  signIn: async (email, password) => {
    const result = await AuthService.signIn(email, password);
    if (!result.error && (result.session || result.appUser)) {
      set({ session: result.session, appUser: result.appUser });
    }
    return { error: result.error };
  },

  signOut: async () => {
    await AuthService.signOut();
    set({ session: null, appUser: null });
  },

  initialize: async () => {
    set({ isLoading: true });
    try {
      const { session, appUser } = await AuthService.initializeAuth();
      set({ session, appUser, isLoading: false });
    } catch (e) {
      console.error('[Auth] Initialize error:', e);
      set({ isLoading: false });
    }
  },
}));
