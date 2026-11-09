import { toast } from 'sonner';
import { clearToken, getToken } from './token';

/** Địa chỉ API, đọc từ NEXT_PUBLIC_API_URL (xem .env.example). */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(
  /\/$/,
  '',
);

/** Sự kiện phát ra khi API trả 401 (token hết hạn/sai). auth-store lắng nghe để đăng xuất. */
export const UNAUTHORIZED_EVENT = 'evolve:unauthorized';

/** Lỗi từ API, giữ nguyên dạng body lỗi chuẩn `{ statusCode, message, errors? }` của apps/api. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    /** Lỗi theo từng trường, ví dụ `{ email: ['Email không hợp lệ'] }`. */
    readonly errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface RequestOptions {
  /** Query string, bỏ qua giá trị undefined/null. */
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Hiện toast khi lỗi (mặc định true). Tắt khi form tự hiển thị lỗi. */
  toastOnError?: boolean;
  signal?: AbortSignal;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const { query, toastOnError = true, signal } = options;
  const url = new URL(`${API_URL}${path}`);
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  }

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
      signal,
    });
  } catch (cause) {
    if ((cause as Error).name === 'AbortError') throw cause;
    const error = new ApiError(0, 'Không kết nối được máy chủ');
    if (toastOnError) toast.error(error.message);
    throw error;
  }

  const data: unknown = res.status === 204 ? undefined : await res.json().catch(() => undefined);
  if (res.ok) return data as T;

  const payload = (data ?? {}) as { message?: string; errors?: Record<string, string[]> };
  const error = new ApiError(res.status, payload.message || `Lỗi ${res.status}`, payload.errors);
  if (res.status === 401 && token) {
    // Token không còn hợp lệ: xóa và báo cho auth-store.
    clearToken();
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }
  if (toastOnError) toast.error(error.message);
  throw error;
}

/** Gọi REST API của apps/api. Chỉ store gọi `api`; component không gọi trực tiếp. */
export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, body ?? {}, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, body ?? {}, options),
  delete: <T = void>(path: string, options?: RequestOptions) =>
    request<T>('DELETE', path, undefined, options),
};
