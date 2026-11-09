import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

const storage = new Map<string, string>();
const dispatched: string[] = [];
vi.stubGlobal('window', {
  localStorage: {
    getItem: (k: string) => storage.get(k) ?? null,
    setItem: (k: string, v: string) => void storage.set(k, v),
    removeItem: (k: string) => void storage.delete(k),
  },
  dispatchEvent: (e: Event) => {
    dispatched.push(e.type);
    return true;
  },
});

const { toast } = await import('sonner');
const { api, ApiError, API_URL, UNAUTHORIZED_EVENT } = await import('./api-client');
const { getToken, setToken } = await import('./token');

function mockFetch(status: number, body?: unknown) {
  const fn = vi
    .fn()
    .mockResolvedValue(new Response(body === undefined ? null : JSON.stringify(body), { status }));
  vi.stubGlobal('fetch', fn);
  return fn;
}

beforeEach(() => {
  storage.clear();
  dispatched.length = 0;
  vi.mocked(toast.error).mockClear();
});

describe('api-client', () => {
  it('gắn Bearer token, JSON body và query; trả về dữ liệu', async () => {
    setToken('abc');
    const fetchMock = mockFetch(200, { ok: true });
    const data = await api.post<{ ok: boolean }>(
      '/issues',
      { title: 'x' },
      { query: { q: 'a', skip: undefined } },
    );

    expect(data).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(String(url)).toBe(`${API_URL}/issues?q=a`);
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer abc');
    expect(init.body).toBe('{"title":"x"}');
  });

  it('lỗi API → ApiError có status, message, errors và hiện toast', async () => {
    mockFetch(400, {
      statusCode: 400,
      message: 'Dữ liệu không hợp lệ',
      errors: { email: ['Sai'] },
    });
    const err = await api.post('/auth/register', {}).catch((e: unknown) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({
      status: 400,
      message: 'Dữ liệu không hợp lệ',
      errors: { email: ['Sai'] },
    });
    expect(toast.error).toHaveBeenCalledWith('Dữ liệu không hợp lệ');
  });

  it('toastOnError: false thì không hiện toast', async () => {
    mockFetch(409, { message: 'Email đã được dùng' });
    await api.post('/auth/register', {}, { toastOnError: false }).catch(() => undefined);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('401 khi đang có token → xóa token và phát sự kiện đăng xuất', async () => {
    setToken('expired');
    mockFetch(401, { message: 'Unauthorized' });
    await api.get('/auth/me').catch(() => undefined);

    expect(getToken()).toBeNull();
    expect(dispatched).toEqual([UNAUTHORIZED_EVENT]);
  });

  it('không kết nối được → ApiError status 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));
    await expect(api.get('/health')).rejects.toMatchObject({
      status: 0,
      message: 'Không kết nối được máy chủ',
    });
  });

  it('204 trả về undefined', async () => {
    mockFetch(204);
    await expect(api.delete('/issues/1')).resolves.toBeUndefined();
  });
});
