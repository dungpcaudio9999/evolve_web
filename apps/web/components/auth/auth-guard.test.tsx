// @vitest-environment jsdom
import type { User } from '@evolve/shared';
import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UNAUTHORIZED_EVENT } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { AuthGuard, GuestGuard } from './auth-guard';

const replace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => '/issues',
}));

const user: User = { id: 'u1', name: 'An', email: 'an@evolve.dev', avatarUrl: null, createdAt: '' };
const initial = useAuthStore.getState();

beforeEach(() => {
  replace.mockClear();
  useAuthStore.setState(initial, true);
  window.localStorage.clear();
});

describe('AuthGuard', () => {
  it('chưa đăng nhập → chuyển /login?next=/issues, không hiện nội dung', async () => {
    render(<AuthGuard>Nội dung bí mật</AuthGuard>);
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login?next=%2Fissues'));
    expect(screen.queryByText('Nội dung bí mật')).not.toBeInTheDocument();
  });

  it('đã đăng nhập → hiện nội dung', () => {
    useAuthStore.setState({ status: 'authenticated', user });
    render(<AuthGuard>Nội dung bí mật</AuthGuard>);
    expect(screen.getByText('Nội dung bí mật')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it('API báo 401 giữa chừng → đăng xuất và chuyển /login', async () => {
    useAuthStore.setState({ status: 'authenticated', user });
    render(<AuthGuard>Nội dung bí mật</AuthGuard>);
    act(() => void window.dispatchEvent(new Event(UNAUTHORIZED_EVENT)));
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login?next=%2Fissues'));
    expect(useAuthStore.getState().status).toBe('guest');
  });
});

describe('GuestGuard', () => {
  it('đã đăng nhập → chuyển vào /issues', async () => {
    useAuthStore.setState({ status: 'authenticated', user });
    render(<GuestGuard>Form đăng nhập</GuestGuard>);
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/issues'));
  });

  it('chưa đăng nhập → hiện form', async () => {
    render(<GuestGuard>Form đăng nhập</GuestGuard>);
    expect(await screen.findByText('Form đăng nhập')).toBeInTheDocument();
  });
});
