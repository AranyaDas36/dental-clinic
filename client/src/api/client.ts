import type { ApiResponse } from '@dental/shared';
import { clientEnv } from '@/lib/env';

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

function getCsrfFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)dental_csrf=([^;]*)/);
  if (!match || !match[1]) return null;
  return decodeURIComponent(match[1]);
}

let cachedCsrfToken: string | null = null;

export function updateCsrfToken(token: string): void {
  cachedCsrfToken = token;
}

export function buildApiUrl(path: string): string {
  const base = clientEnv.VITE_API_BASE_URL.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (base.endsWith('/api/v1') && cleanPath.startsWith('/api/v1/')) {
    return `${base}${cleanPath.slice('/api/v1'.length)}`;
  }
  return `${base}${cleanPath}`;
}

export async function fetchCsrfToken(): Promise<string> {
  const cookieToken = getCsrfFromCookie();
  if (cookieToken) {
    cachedCsrfToken = cookieToken;
    return cookieToken;
  }
  const res = await fetch(buildApiUrl('/auth/csrf'), {
    credentials: 'include',
  });
  const data = (await res.json()) as ApiResponse<{ csrfToken: string }>;
  if (data.success && data.data?.csrfToken) {
    cachedCsrfToken = data.data.csrfToken;
    return data.data.csrfToken;
  }
  return '';
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const headers = new Headers(options.headers);
  const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  if (isMutating && !headers.has('x-csrf-token')) {
    const token = getCsrfFromCookie() || cachedCsrfToken || (await fetchCsrfToken());
    if (token) {
      headers.set('x-csrf-token', token);
    }
  }

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  if (options.body !== undefined && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const bodyInit: BodyInit | undefined =
    options.body === undefined
      ? undefined
      : isFormData
        ? (options.body as FormData)
        : JSON.stringify(options.body);

  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers,
    credentials: 'include',
    body: bodyInit,
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success) {
    if (!payload.success) {
      throw new ApiClientError(
        response.status,
        payload.error.code,
        payload.error.message,
        payload.error.details,
      );
    }
    throw new ApiClientError(response.status, 'UNKNOWN', 'Request failed');
  }

  return payload.data;
}
