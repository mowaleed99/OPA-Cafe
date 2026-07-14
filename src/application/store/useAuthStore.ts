import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import type { AppUser } from '../../domain/entities/user';
import { supabase } from '../../infrastructure/api/supabase';
import bcrypt from 'bcryptjs';
import { authRepository } from '../../infrastructure/repositories/index';

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

const DEFAULT_CAFE_ID = '00000000-0000-0000-0000-000000000000';

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  appUser: null,
  isLoading: true,

  isOwner: () => get().appUser?.role === 'owner',
  isCashier: () => get().appUser?.role === 'cashier',
  cafeId: () => get().appUser?.cafe_id ?? null,

  setSession: (session) => {
    if (session?.user) localStorage.setItem('offline_user_id', session.user.id);
    else localStorage.removeItem('offline_user_id');
    set({ session });
  },
  
  setAppUser: (appUser) => set({ appUser }),

  signIn: async (email, password) => {
    try {
      const localUser = await authRepository.findByEmail(email);

      if (!localUser) {
        return { error: 'Invalid login credentials. User not found locally.' };
      }

      if (!localUser.local_password_hash) {
        return { error: 'Offline login is not set up. Please connect to the internet to sync credentials.' };
      }

      const isValid = bcrypt.compareSync(password, localUser.local_password_hash);
      
      if (!isValid) {
        return { error: 'Invalid login credentials.' };
      }

      const localSession = {
        access_token: 'local_offline_token',
        refresh_token: 'local_offline_token',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: {
          id: localUser.id,
          email: localUser.email || email,
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: localUser.created_at,
        }
      } as Session;
      
      localStorage.setItem('offline_user_id', localUser.id);
      set({ session: localSession, appUser: localUser });

      // Background Supabase Sync
      if (navigator.onLine) {
        supabase.auth.signInWithPassword({ email, password }).catch(console.warn);
      }

      return { error: null };
    } catch (err: any) {
      console.error('Local sign in error:', err);
      return { error: err.message };
    }
  },

  signOut: async () => {
    try {
      if (navigator.onLine) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.error('Logout error:', e);
    }
    localStorage.removeItem('offline_user_id');
    set({ session: null, appUser: null });
  },

  initialize: async () => {
    set({ isLoading: true });
    try {
      // 1. Owner Bootstrap Check
      const count = await authRepository.countUsers();
      if (count === 0) {
        console.log('[Auth] SQLite is empty. Bootstrapping initial Owner account.');
        const ownerEmail = 'ebrahimnagy2026@opa.com';
        const ownerPassword = 'nagy@Ebrahim2026';
        
        const newOwner: AppUser = {
          id: crypto.randomUUID(),
          cafe_id: DEFAULT_CAFE_ID,
          role: 'owner',
          name: 'System Owner',
          email: ownerEmail,
          created_at: new Date().toISOString(),
          local_password_hash: bcrypt.hashSync(ownerPassword, 10)
        };
        
        await authRepository.insertUser(newOwner);
        console.log('[Auth] Bootstrap complete.');
      }

      // 2. Local Login via Stored ID
      const offlineUserId = localStorage.getItem('offline_user_id');
      if (offlineUserId) {
        const localUser = await authRepository.findById(offlineUserId);
        if (localUser) {
          const mockSession = {
            access_token: 'local_offline_token',
            refresh_token: 'local_offline_token',
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            token_type: 'bearer',
            user: {
              id: offlineUserId,
              email: localUser.email || '',
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated',
              created_at: localUser.created_at,
            }
          } as Session;
          set({ session: mockSession, appUser: localUser, isLoading: false });
        } else {
          set({ session: null, appUser: null, isLoading: false });
        }
      } else {
        set({ session: null, appUser: null, isLoading: false });
      }

      // 3. Background Supabase Check (Non-Blocking)
      if (navigator.onLine) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            // Note: Since we are fully local-first, the remote session mainly just keeps Supabase client alive for sync queue listening
            console.log('[Auth] Supabase session verified in background.');
          }
        }).catch(console.warn);
      }

    } catch (e) {
      console.error('[Auth] Initialize error:', e);
      set({ isLoading: false });
    }
  },
}));
