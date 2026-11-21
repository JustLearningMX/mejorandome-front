import { apiRequest } from './api.client';
import { isJwtExpired } from '../utils/jwt';
import type {
  AuthResponse,
  AuthenticatedUser,
  GoogleLoginRequest,
} from '../types/auth';

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';
const SESSION_EXPIRED_FLAG = 'sessionExpired';

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
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    if (isJwtExpired(token)) {
      this.expireSession();
      return null;
    }
    return token;
  },

  expireSession(): void {
    this.clearSession();
    try {
      sessionStorage.setItem(SESSION_EXPIRED_FLAG, 'true');
    } catch {
      // sessionStorage no disponible: se pierde solo el aviso
    }
  },

  consumeSessionExpiredNotice(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const expired = sessionStorage.getItem(SESSION_EXPIRED_FLAG) === 'true';
      sessionStorage.removeItem(SESSION_EXPIRED_FLAG);
      return expired;
    } catch {
      return false;
    }
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
