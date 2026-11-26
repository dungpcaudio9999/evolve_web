import type { AuthResponse, LoginInput, RegisterInput, User } from '@evolve/shared';
import { create } from 'zustand';
import { ApiError, api, setUnauthorizedHandler } from '../lib/api-client';
import { clearToken, loadToken, setToken } from '../lib/token';
import { useIssuesStore } from './issues-store';

/** idle: chưa kiểm tra · loading: đang hỏi /auth/me · authenticated / guest: đã biết. */
export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'guest';

interface AuthState {
  status: AuthStatus;
  user: User | null;
  /** Đọc token trong SecureStore rồi kiểm tra bằng GET /auth/me. Gọi một lần khi mở app. */
  init: () => Promise<void>;
  /** Ném ApiError để màn hình hiển thị lỗi. */
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => {
  const signedIn = async ({ accessToken, user }: AuthResponse) => {
    useIssuesStore.getState().reset();
    await setToken(accessToken);
    set({ status: 'authenticated', user });
    return user;
  };

  setUnauthorizedHandler(() => {
    useIssuesStore.getState().reset();
    set({ status: 'guest', user: null });
  });

  return {
    status: 'idle',
    user: null,

    init: async () => {
      if (get().status === 'loading') return;
      set({ status: 'loading' });
      if (!(await loadToken())) {
        set({ status: 'guest', user: null });
        return;
      }
      try {
        const user = await api.get<User>('/auth/me');
        set({ status: 'authenticated', user });
      } catch (error) {
        // Mất mạng thì giữ token để thử lại lần sau; lỗi khác thì xóa.
        if (!(error instanceof ApiError && error.status === 0)) await clearToken();
        set({ status: 'guest', user: null });
      }
    },

    login: async (input) => signedIn(await api.post<AuthResponse>('/auth/login', input)),
    register: async (input) => signedIn(await api.post<AuthResponse>('/auth/register', input)),

    logout: async () => {
      await clearToken();
      useIssuesStore.getState().reset();
      set({ status: 'guest', user: null });
    },
  };
});
