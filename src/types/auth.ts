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

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}
