import type { Session } from '@supabase/supabase-js';
import type { AppUser } from '../../domain/entities/user';
import bcrypt from 'bcryptjs';
import { authRepository } from '../../infrastructure/repositories/index';
import { supabase } from '../../infrastructure/api/supabase';

const DEFAULT_CAFE_ID = '00000000-0000-0000-0000-000000000000';

export class AuthService {
  private static listenersInitialized = false;

  static isElectron(): boolean {
    return typeof window !== 'undefined' && window.electronAPI?.isElectron === true;
  }

  static async getCloudAppUser(userId: string): Promise<AppUser | null> {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data as AppUser | null;
  }

  static async shareSyncSession(session: Session | null): Promise<void> {
    if (typeof window === 'undefined' || !window.electronAPI?.setSyncSession) return;

    if (session?.access_token === 'local_offline_token') return;

    const result = await window.electronAPI.setSyncSession(session ? {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
    } : null);

    if (session && result?.success === false) {
      console.warn('[Auth] Sync worker rejected the forwarded session. It will retry on next auth event.');
    }
  }

  static async getFreshCloudSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session) {
      console.warn('[Auth] Stored Supabase session could not be refreshed:', error?.message);
      return null;
    }

    return data.session;
  }

  static setupListeners(): void {
    if (this.listenersInitialized) return;
    this.listenersInitialized = true;

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return;
      void this.shareSyncSession(session);
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        void this.getFreshCloudSession().then(this.shareSyncSession).catch((error) => {
          console.warn('[Auth] Unable to restore cloud session after reconnect:', error);
        });
      });
    }
  }

  static async bootstrapOwnerIfNeeded(): Promise<void> {
    if (!this.isElectron()) return;
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
  }

  static async signIn(email: string, password: string): Promise<{ error: string | null; session: Session | null; appUser: AppUser | null }> {
    try {
      if (!this.isElectron()) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.session) return { error: error?.message || 'Unable to start a Supabase session.', session: null, appUser: null };

        const cloudUser = await this.getCloudAppUser(data.session.user.id);
        if (!cloudUser) {
          await supabase.auth.signOut();
          return { error: 'Your account is not assigned to an OPA Cafe profile.', session: null, appUser: null };
        }

        return { error: null, session: data.session, appUser: cloudUser };
      }

      let localUser = await authRepository.findByEmail(email);

      if (!localUser) {
        // User not found locally. If online, try fetching them from the Cloud!
        if (typeof window !== 'undefined' && navigator.onLine) {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error || !data.session) {
            return { error: 'Invalid login credentials.', session: null, appUser: null };
          }
          // Cloud auth succeeded! Fetch their cloud profile.
          const cloudUser = await this.getCloudAppUser(data.session.user.id);
          if (!cloudUser) {
            await supabase.auth.signOut();
            return { error: 'Your account is not assigned to an OPA Cafe profile.', session: null, appUser: null };
          }
          // Auto-heal local database: insert the missing user with their password hash!
          const newHash = bcrypt.hashSync(password, 10);
          cloudUser.local_password_hash = newHash;
          await authRepository.insertUser(cloudUser);
          localUser = cloudUser;
          
          // Sign out immediately because the main flow below will sign them back in
          await supabase.auth.signOut();
        } else {
          return { error: 'Invalid login credentials. User not found locally (offline mode).', session: null, appUser: null };
        }
      }

      let isValid = false;
      if (localUser.local_password_hash) {
        isValid = bcrypt.compareSync(password, localUser.local_password_hash);
      }
      
      if (!isValid) {
        // If local hash fails (or is missing), it might be because the password was updated
        // remotely (e.g. via setup script or another device). Let's attempt cloud auth if online.
        if (typeof window !== 'undefined' && navigator.onLine) {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error || !data.session) {
            return { error: 'Invalid login credentials.', session: null, appUser: null };
          }
          // Cloud auth succeeded! The user changed their password remotely.
          // Let's auto-heal the local database to keep them in sync.
          const newHash = bcrypt.hashSync(password, 10);
          await authRepository.updateUser(localUser.id, { local_password_hash: newHash });
          localUser.local_password_hash = newHash;
          isValid = true;
          
          // Sign out immediately because the main flow below will sign them back in
          // to establish the proper cloudSession variable for sync sharing.
          await supabase.auth.signOut();
        } else {
          return { error: 'Invalid login credentials (offline mode).', session: null, appUser: null };
        }
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

      const { data, error: cloudError } = await supabase.auth.signInWithPassword({ email, password });
      if (cloudError || !data.session) {
        if (typeof window !== 'undefined' && !navigator.onLine) {
          console.info('[Auth] Offline local sign-in succeeded; cloud sync will wait for a connection.');
          return { error: null, session: localSession, appUser: localUser };
        }
        return { error: cloudError?.message || 'Supabase sign-in did not return a session.', session: null, appUser: null };
      }

      await this.shareSyncSession(data.session);

      if (window.electronAPI?.storeCredentials) {
        window.electronAPI.storeCredentials({ email, password }).catch(() => {});
      }

      return { error: null, session: localSession, appUser: localUser };
    } catch (err: any) {
      console.error('Local sign in error:', err);
      return { error: err.message, session: null, appUser: null };
    }
  }

  static async signOut(): Promise<void> {
    await this.shareSyncSession(null);
    await supabase.auth.signOut();
    if (typeof window !== 'undefined' && window.electronAPI?.clearStoredCredentials) {
      window.electronAPI.clearStoredCredentials().catch(() => {});
    }
    localStorage.removeItem('offline_user_id');
  }

  static async initializeAuth(): Promise<{ session: Session | null; appUser: AppUser | null }> {
    this.setupListeners();
    const cloudSession = await this.getFreshCloudSession();
    await this.shareSyncSession(cloudSession);

    if (!this.isElectron()) {
      const cloudUser = cloudSession ? await this.getCloudAppUser(cloudSession.user.id) : null;
      return { session: cloudSession, appUser: cloudUser };
    }

    await this.bootstrapOwnerIfNeeded();

    const offlineUserId = typeof localStorage !== 'undefined' ? localStorage.getItem('offline_user_id') : null;
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

        if (!cloudSession && typeof window !== 'undefined' && navigator.onLine && window.electronAPI?.getStoredCredentials) {
          window.electronAPI.getStoredCredentials()
            .then(async (creds: { email: string; password: string } | null) => {
              if (!creds) return;
              console.info('[Auth] Auto-authenticating to Supabase with stored credentials...');
              const { data, error } = await supabase.auth.signInWithPassword({
                email: creds.email,
                password: creds.password,
              });
              if (error || !data.session) {
                console.warn('[Auth] Auto cloud sign-in failed:', error?.message);
                return;
              }
              console.info('[Auth] Auto cloud sign-in succeeded — forwarding session to worker.');
              await this.shareSyncSession(data.session);
            })
            .catch((err: unknown) => console.warn('[Auth] Auto cloud sign-in error:', err));
        }

        return { session: mockSession, appUser: localUser };
      }
    }

    return { session: null, appUser: null };
  }
}
