export interface GoogleLoginRequest {
  idToken: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  timezone?: string;
  picture?: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: AuthenticatedUser;
}

export type AuthErrorCode =
  | 'ACCESS_TOKEN_EXPIRED'
  | 'ACCESS_TOKEN_INVALID'
  | 'REFRESH_TOKEN_MISSING'
  | 'REFRESH_TOKEN_INVALID'
  | 'REFRESH_TOKEN_REUSED';

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
  code?: AuthErrorCode;
}
