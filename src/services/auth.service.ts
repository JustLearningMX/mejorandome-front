import { apiRequest } from './api.client';
import type {
  AuthResponse,
  AuthenticatedUser,
  GoogleLoginRequest,
} from '../types/auth';

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

export const authService = {
  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    const payload: GoogleLoginRequest = { idToken };
    const response = await apiRequest<AuthResponse>('auth/google', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

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
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
  },

  saveUser(user: AuthenticatedUser): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
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
