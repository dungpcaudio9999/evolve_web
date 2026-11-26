import { clearToken, getToken } from './token';

/** Địa chỉ API, đọc từ EXPO_PUBLIC_API_URL (xem .env.example). */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000').replace(
  /\/$/,
  '',
);

/** Lỗi từ API, cùng dạng body lỗi `{ statusCode, message, errors? }` như apps/web. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** auth-store đăng ký hàm này để tự đăng xuất khi API trả 401. */
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  onUnauthorized = fn;
};

type Query = Record<string, string | number | boolean | undefined | null>;

async function request<T>(method: string, path: string, body?: unknown, query?: Query): Promise<T> {
  const qs = Object.entries(query ?? {})
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  const url = `${API_URL}${path}${qs ? `?${qs}` : ''}`;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, `Không kết nối được máy chủ (${API_URL})`);
  }

  const data: unknown = res.status === 204 ? undefined : await res.json().catch(() => undefined);
  if (res.ok) return data as T;

  const payload = (data ?? {}) as { message?: string; errors?: Record<string, string[]> };
  if (res.status === 401 && token) {
    await clearToken();
    onUnauthorized?.();
  }
  throw new ApiError(res.status, payload.message || `Lỗi ${res.status}`, payload.errors);
}

/** Gọi REST API của apps/api. Chỉ store gọi `api`; component không gọi trực tiếp. */
export const api = {
  get: <T>(path: string, query?: Query) => request<T>('GET', path, undefined, query),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body ?? {}),
  delete: <T = void>(path: string) => request<T>('DELETE', path),
};
