import type { ApiErrorResponse, AuthErrorCode } from '../types/auth';

const API_BASE_URL =
  import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

export class ApiClientError extends Error {
  statusCode: number;
  details?: string | string[];
  code?: AuthErrorCode;

  constructor(
    statusCode: number,
    message: string,
    details?: string | string[],
    code?: AuthErrorCode
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.details = details;
    this.code = code;
  }
}

export interface SessionHandlers {
  getCurrentToken: () => string | null;
  refreshToken: (staleToken: string) => Promise<string | null>;
  expireSession: () => void;
}

let sessionHandlers: SessionHandlers | null = null;

export function setSessionHandlers(handlers: SessionHandlers): void {
  sessionHandlers = handlers;
}

function sendRequest(
  endpoint: string,
  options: RequestInit,
  token?: string | null
): Promise<Response> {
  const url = `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, { ...options, headers });
}

async function toApiError(response: Response): Promise<ApiClientError> {
  let errorMessage = `HTTP error ${response.status}`;
  let details: string | string[] | undefined;
  let code: AuthErrorCode | undefined;

  try {
    const errorData = (await response.json()) as ApiErrorResponse;
    code = errorData.code;
    if (Array.isArray(errorData.message)) {
      errorMessage = errorData.message.join(', ');
      details = errorData.message;
    } else if (typeof errorData.message === 'string') {
      errorMessage = errorData.message;
      details = errorData.message;
    }
  } catch {
    // Usar mensaje por defecto si la respuesta no es JSON
  }

  return new ApiClientError(response.status, errorMessage, details, code);
}

async function renewAccessToken(staleToken: string): Promise<string | null> {
  const currentToken = sessionHandlers?.getCurrentToken();
  if (currentToken && currentToken !== staleToken) return currentToken;
  return sessionHandlers?.refreshToken(staleToken) ?? null;
}

async function resendWithFreshToken(
  endpoint: string,
  options: RequestInit,
  staleToken: string
): Promise<Response | null> {
  const freshToken = await renewAccessToken(staleToken);
  return freshToken ? sendRequest(endpoint, options, freshToken) : null;
}

async function sendAuthenticated(
  endpoint: string,
  options: RequestInit,
  token: string
): Promise<Response> {
  const activeToken = sessionHandlers?.getCurrentToken() ?? token;
  const response = await sendRequest(endpoint, options, activeToken);
  if (response.status !== 401) return response;

  const { code } = await toApiError(response.clone());
  const retried =
    code === 'ACCESS_TOKEN_EXPIRED'
      ? await resendWithFreshToken(endpoint, options, activeToken)
      : null;

  if (retried && retried.status !== 401) return retried;

  sessionHandlers?.expireSession();
  return retried ?? response;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const response = token
    ? await sendAuthenticated(endpoint, options, token)
    : await sendRequest(endpoint, options);

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}
