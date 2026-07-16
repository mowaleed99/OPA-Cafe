import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import type { AppUser } from '../../domain/entities/user';
import bcrypt from 'bcryptjs';
import { authRepository } from '../../infrastructure/repositories/index';
import { supabase } from '../../infrastructure/api/supabase';

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

function isElectron(): boolean {
  return typeof window !== 'undefined' && window.electronAPI?.isElectron === true;
}

async function getCloudAppUser(userId: string): Promise<AppUser | null> {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as AppUser | null;
}

async function shareSyncSession(session: Session | null): Promise<void> {
  if (!window.electronAPI?.setSyncSession) return;

  // Never forward the in-memory token used for an offline-only login.  It is
  // useful to the UI, but it is not a Supabase JWT and would make the worker
  // discard an otherwise valid cloud session.
  if (session?.access_token === 'local_offline_token') return;

  const result = await window.electronAPI.setSyncSession(session ? {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
  } : null);

  // The Electron worker validates the session against Supabase.  If the
  // token was rejected, log it but do NOT call signOut() — destroying the
  // stored refresh token prevents a subsequent refreshSession() from
  // recovering the session automatically.
  if (session && result?.success === false) {
    console.warn('[Auth] Sync worker rejected the forwarded session. It will retry on next auth event.');
  }
}

/**
 * Obtain a fresh cloud session before handing it to Electron. `getSession()`
 * only reads browser storage, so after a long desktop restart it can return
 * an expired access token even though its refresh token is still valid.
 */
async function getFreshCloudSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session) {
    // Do NOT call signOut() here — it permanently destroys the stored
    // refresh token.  The next explicit signIn() will create a brand-new
    // session anyway, and a later online event may still succeed.
    console.warn('[Auth] Stored Supabase session could not be refreshed:', error?.message);
    return null;
  }

  return data.session;
}

// Supabase refreshes access tokens in the renderer. Forward every auth state
// change so the Electron main-process worker never keeps an expired token.
// BUT skip the INITIAL_SESSION event — it often carries a stale token that the
// worker will reject, which then races with the valid session from initialize().
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'INITIAL_SESSION') {
    // initialize() handles the first session explicitly with refreshSession().
    return;
  }
  void shareSyncSession(session);
});

// The renderer can regain network access while an offline user remains
// logged in locally. Refresh and forward the cloud session at that point so
// the worker can drain its preserved queue without waiting for another app
// restart.
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    void getFreshCloudSession().then(shareSyncSession).catch((error) => {
      console.warn('[Auth] Unable to restore cloud session after reconnect:', error);
    });
  });
}

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
      // The Vercel deployment runs in a browser and has no Electron IPC or
      // local SQLite database. Authenticate it directly with Supabase.
      if (!isElectron()) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.session) return { error: error?.message || 'Unable to start a Supabase session.' };

        const cloudUser = await getCloudAppUser(data.session.user.id);
        if (!cloudUser) {
          await supabase.auth.signOut();
          return { error: 'Your account is not assigned to an OPA Cafe profile.' };
        }

        set({ session: data.session, appUser: cloudUser });
        return { error: null };
      }

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

      // Keep local login available offline, but hand a real Supabase session to
      // the main-process worker whenever the credentials are valid online.
      // RLS protects cloud data, so the worker must never sync as `anon`.
      const { data, error: cloudError } = await supabase.auth.signInWithPassword({ email, password });
      if (cloudError || !data.session) {
        // A local password can be valid while the cloud account is missing or
        // has a different password. Do not pretend that sync is available.
        if (!navigator.onLine) {
          console.info('[Auth] Offline local sign-in succeeded; cloud sync will wait for a connection.');
          return { error: null };
        }
        return { error: cloudError?.message || 'Supabase sign-in did not return a session.' };
      }

      await shareSyncSession(data.session);

      // Store credentials securely so the app can auto-authenticate to
      // Supabase on restart without requiring the user to sign in again.
      if (window.electronAPI?.storeCredentials) {
        window.electronAPI.storeCredentials({ email, password }).catch(() => {});
      }

      return { error: null };
    } catch (err: any) {
      console.error('Local sign in error:', err);
      return { error: err.message };
    }
  },

  signOut: async () => {
    await shareSyncSession(null);
    await supabase.auth.signOut();
    if (window.electronAPI?.clearStoredCredentials) {
      window.electronAPI.clearStoredCredentials().catch(() => {});
    }
    localStorage.removeItem('offline_user_id');
    set({ session: null, appUser: null });
  },

  initialize: async () => {
    set({ isLoading: true });
    try {
      // Restore a persisted Supabase session before the worker starts flushing
      // queued work after an Electron restart.
      const cloudSession = await getFreshCloudSession();
      await shareSyncSession(cloudSession);

      // Browser sessions use Supabase directly; never call Electron-only
      // repositories from the Vercel deployment.
      if (!isElectron()) {
        const cloudUser = cloudSession ? await getCloudAppUser(cloudSession.user.id) : null;
        set({ session: cloudSession, appUser: cloudUser, isLoading: false });
        return;
      }

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

          // The cloud session was already attempted above via
          // getFreshCloudSession().  If it failed (e.g. expired refresh token)
          // but we have stored credentials and internet, sign in automatically
          // so the worker gets a real Supabase JWT without the user re-entering
          // their password.
          if (!cloudSession && navigator.onLine && window.electronAPI?.getStoredCredentials) {
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
                await shareSyncSession(data.session);
              })
              .catch((err: unknown) => console.warn('[Auth] Auto cloud sign-in error:', err));
          } else if (cloudSession) {
            // Cloud session was refreshed successfully — already shared above.
          }
        } else {
          set({ session: null, appUser: null, isLoading: false });
        }
      } else {
        set({ session: null, appUser: null, isLoading: false });
      }

    } catch (e) {
      console.error('[Auth] Initialize error:', e);
      set({ isLoading: false });
    }
  },
}));
