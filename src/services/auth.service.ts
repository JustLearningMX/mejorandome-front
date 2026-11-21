import { apiRequest, ApiClientError } from './api.client';
import type {
  AuthResponse,
  AuthenticatedUser,
  GoogleLoginRequest,
} from '../types/auth';

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

let refreshInFlight: Promise<string | null> | null = null;

function extractGooglePicture(idToken: string): string | undefined {
  try {
    const parts = idToken.split('.');
    if (parts.length < 2) return undefined;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload) as { picture?: string };
    return typeof parsed.picture === 'string' && parsed.picture ? parsed.picture : undefined;
  } catch {
    return undefined;
  }
}

export const authService = {
  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    const payload: GoogleLoginRequest = { idToken };
    const response = await apiRequest<AuthResponse>('auth/google', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const googlePicture = extractGooglePicture(idToken);
    if (googlePicture && !response.user.picture) {
      response.user.picture = googlePicture;
    }

    this.saveSession(response);
    return response;
  },

  refreshAccessToken(): Promise<string | null> {
    refreshInFlight ??= this.requestRefresh().finally(() => {
      refreshInFlight = null;
    });
    return refreshInFlight;
  },

  async requestRefresh(): Promise<string | null> {
    try {
      const response = await apiRequest<AuthResponse>('auth/refresh', { method: 'POST' });
      this.saveSession(response);
      return response.accessToken;
    } catch (error) {
      if (error instanceof ApiClientError) return null;
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await apiRequest<void>('auth/logout', { method: 'POST' });
    } catch (error) {
      console.warn('No se pudo revocar la sesión en el servidor:', error);
    } finally {
      this.clearSession();
    }
  },

  async getMe(token?: string | null): Promise<AuthenticatedUser> {
    const activeToken = token ?? this.getStoredToken();
    if (!activeToken) {
      throw new Error('No hay sesión activa');
    }

    const user = await apiRequest<AuthenticatedUser>(
      'auth/me',
      { method: 'GET' },
      activeToken
    );

    this.saveUser(user);
    return user;
  },

  saveSession(auth: AuthResponse): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, auth.accessToken);
    this.saveUser(auth.user);
  },

  saveUser(user: AuthenticatedUser): void {
    if (typeof window === 'undefined') return;
    const current = this.getStoredUser();
    const mergedUser: AuthenticatedUser = {
      ...user,
      picture: user.picture || current?.picture,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(mergedUser));
  },

  getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredUser(): AuthenticatedUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthenticatedUser;
    } catch {
      return null;
    }
  },

  clearSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated(): boolean {
    return Boolean(this.getStoredToken());
  },
};
