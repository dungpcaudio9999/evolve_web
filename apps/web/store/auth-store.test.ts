import type { AuthResponse, User } from '@evolve/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const token = { value: null as string | null };
vi.mock('@/lib/token', () => ({
  getToken: () => token.value,
  setToken: (t: string) => void (token.value = t),
  clearToken: () => void (token.value = null),
}));
vi.mock('@/lib/api-client', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/api-client')>();
  return { ...real, api: { get: vi.fn(), post: vi.fn() } };
});

const { api, ApiError } = await import('@/lib/api-client');
const { safeNextPath, useAuthStore } = await import('./auth-store');

const user: User = { id: 'u1', name: 'An', email: 'an@evolve.dev', avatarUrl: null, createdAt: '' };
const initial = useAuthStore.getState();
const state = () => useAuthStore.getState();

beforeEach(() => {
  useAuthStore.setState(initial, true);
  token.value = null;
  vi.mocked(api.get).mockReset();
  vi.mocked(api.post).mockReset();
});

describe('auth-store', () => {
  it('init không có token → guest, không gọi API', async () => {
    await state().init();
    expect(state().status).toBe('guest');
    expect(api.get).not.toHaveBeenCalled();
  });

  it('init có token hợp lệ → authenticated với user từ /auth/me', async () => {
    token.value = 'ok';
    vi.mocked(api.get).mockResolvedValue(user);
    await state().init();
    expect(api.get).toHaveBeenCalledWith('/auth/me', { toastOnError: false });
    expect(state()).toMatchObject({ status: 'authenticated', user });
  });

  it('init token hết hạn (401) → guest và xóa token', async () => {
    token.value = 'expired';
    vi.mocked(api.get).mockRejectedValue(new ApiError(401, 'Unauthorized'));
    await state().init();
    expect(state().status).toBe('guest');
    expect(token.value).toBeNull();
  });

  it('init mất kết nối (status 0) → guest nhưng giữ token để thử lại sau', async () => {
    token.value = 'ok';
    vi.mocked(api.get).mockRejectedValue(new ApiError(0, 'Không kết nối được máy chủ'));
    await state().init();
    expect(state().status).toBe('guest');
    expect(token.value).toBe('ok');
  });

  it('login lưu token và user; logout xóa hết', async () => {
    const res: AuthResponse = { accessToken: 'jwt', user };
    vi.mocked(api.post).mockResolvedValue(res);
    await state().login({ email: 'an@evolve.dev', password: 'password123' });
    expect(api.post).toHaveBeenCalledWith(
      '/auth/login',
      { email: 'an@evolve.dev', password: 'password123' },
      { toastOnError: false },
    );
    expect(token.value).toBe('jwt');
    expect(state()).toMatchObject({ status: 'authenticated', user });

    state().logout();
    expect(token.value).toBeNull();
    expect(state()).toMatchObject({ status: 'guest', user: null });
  });

  it('login sai → ném ApiError, trạng thái không đổi', async () => {
    vi.mocked(api.post).mockRejectedValue(new ApiError(401, 'Sai email hoặc mật khẩu'));
    await expect(state().login({ email: 'a@b.cc', password: 'x' })).rejects.toThrow('Sai email');
    expect(state().status).toBe('idle');
    expect(token.value).toBeNull();
  });
});

describe('safeNextPath', () => {
  it('chỉ cho đường dẫn nội bộ', () => {
    expect(safeNextPath('/projects')).toBe('/projects');
    expect(safeNextPath(null)).toBe('/issues');
    expect(safeNextPath('//evil.com')).toBe('/issues');
    expect(safeNextPath('https://evil.com')).toBe('/issues');
  });
});
