import type { AuthResponse, LoginInput, RegisterInput, User } from '@evolve/shared';
import { create } from 'zustand';
import { ApiError, api } from '@/lib/api-client';
import { clearToken, getToken, setToken } from '@/lib/token';

/**
 * - idle: chưa kiểm tra (lần đầu tải trang)
 * - loading: đang hỏi /auth/me
 * - authenticated / guest: đã biết kết quả
 */
export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'guest';

interface AuthState {
  status: AuthStatus;
  user: User | null;
  /** Kiểm tra token đã lưu bằng GET /auth/me. Gọi một lần khi vào app. */
  init: () => Promise<void>;
  /** Ném ApiError (401 sai mật khẩu, 400 dữ liệu sai…) để form hiển thị. */
  login: (input: LoginInput) => Promise<User>;
  /** Ném ApiError (409 email đã dùng…) để form hiển thị. */
  register: (input: RegisterInput) => Promise<User>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set, get) => {
  const signedIn = ({ accessToken, user }: AuthResponse) => {
    setToken(accessToken);
    set({ status: 'authenticated', user });
    return user;
  };

  return {
    status: 'idle',
    user: null,

    init: async () => {
      if (get().status === 'loading') return;
      if (!getToken()) {
        set({ status: 'guest', user: null });
        return;
      }
      set({ status: 'loading' });
      try {
        // Lỗi mạng (status 0) vẫn hiện toast; 401 thì api-client đã xóa token.
        const user = await api.get<User>('/auth/me', { toastOnError: false });
        set({ status: 'authenticated', user });
      } catch (error) {
        if (!(error instanceof ApiError && error.status === 0)) clearToken();
        set({ status: 'guest', user: null });
      }
    },

    login: async (input) =>
      signedIn(await api.post<AuthResponse>('/auth/login', input, { toastOnError: false })),

    register: async (input) =>
      signedIn(await api.post<AuthResponse>('/auth/register', input, { toastOnError: false })),

    logout: () => {
      clearToken();
      set({ status: 'guest', user: null });
    },
  };
});

/** Chỉ cho phép chuyển hướng tới đường dẫn nội bộ (chặn `//evil.com`, `https://…`). */
export function safeNextPath(next: string | null | undefined, fallback = '/issues'): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : fallback;
}
