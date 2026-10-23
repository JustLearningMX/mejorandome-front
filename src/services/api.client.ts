import type { ApiErrorResponse } from '../types/auth';

const API_BASE_URL =
  import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

export class ApiClientError extends Error {
  statusCode: number;
  details?: string | string[];

  constructor(statusCode: number, message: string, details?: string | string[]) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}`;
    let details: string | string[] | undefined;

    try {
      const errorData = (await response.json()) as ApiErrorResponse;
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

    throw new ApiClientError(response.status, errorMessage, details);
  }

  return response.json() as Promise<T>;
}
