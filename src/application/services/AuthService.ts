
import type { AppUser } from '../../domain/entities/user';
import bcrypt from 'bcryptjs';
import { authRepository } from '../../infrastructure/repositories/index';

const DEFAULT_CAFE_ID = '00000000-0000-0000-0000-000000000000';

export class AuthService {
  static isElectron(): boolean {
    return typeof window !== 'undefined' && window.electronAPI?.isElectron === true;
  }

  static async bootstrapOwnerIfNeeded(): Promise<void> {
    if (!this.isElectron()) return;
    const count = await authRepository.countUsers();
    if (count === 0) {
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
    }
  }

  static async signIn(email: string, password: string): Promise<{ error: string | null; session: any | null; appUser: AppUser | null }> {
    console.log('[AuthService] signIn entry. Email:', email);
    try {
      console.log('[AuthService] Calling authRepository.findByEmail...');
      const localUser = await authRepository.findByEmail(email);
      console.log('[AuthService] SQLite user query result:', localUser);

      if (!localUser) {
        console.log('[AuthService] Returning error: User not found locally');
        return { error: 'Invalid login credentials. User not found locally.', session: null, appUser: null };
      }

      let isValid = false;
      if (localUser.local_password_hash) {
        console.log('[AuthService] Calling bcrypt.compareSync...');
        isValid = bcrypt.compareSync(password, localUser.local_password_hash);
        console.log('[AuthService] bcrypt.compare result:', isValid);
      } else {
        console.log('[AuthService] local_password_hash is empty or missing');
      }
      
      if (!isValid) {
        console.log('[AuthService] Returning error: Invalid login credentials');
        return { error: 'Invalid login credentials.', session: null, appUser: null };
      }

      const localany = {
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
      } as any;
      
      localStorage.setItem('offline_user_id', localUser.id);

      if (window.electronAPI?.storeCredentials) {
        console.log('[AuthService] Calling window.electronAPI.storeCredentials...');
        window.electronAPI.storeCredentials({ email, password }).catch((e) => {
          console.error('[AuthService] window.electronAPI.storeCredentials error:', e);
        });
      }

      console.log('[AuthService] Returning successful user/session object');
      return { error: null, session: localany, appUser: localUser };
    } catch (err: any) {
      console.error('[AuthService] Local sign in error:', err);
      return { error: err.message, session: null, appUser: null };
    }
  }

  static async signOut(): Promise<void> {
    if (typeof window !== 'undefined' && window.electronAPI?.clearStoredCredentials) {
      window.electronAPI.clearStoredCredentials().catch(() => {});
    }
    localStorage.removeItem('offline_user_id');
  }

  static async initializeAuth(): Promise<{ session: any | null; appUser: AppUser | null }> {
    await this.bootstrapOwnerIfNeeded();

    const offlineUserId = typeof localStorage !== 'undefined' ? localStorage.getItem('offline_user_id') : null;
    if (offlineUserId) {
      const localUser = await authRepository.findById(offlineUserId);
      if (localUser) {
        const mockany = {
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
        } as any;

        return { session: mockany, appUser: localUser };
      }
    }

    return { session: null, appUser: null };
  }
}
