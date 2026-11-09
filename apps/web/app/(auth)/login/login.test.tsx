// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import LoginPage from './page';

const replace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams('next=/projects'),
}));

const login = vi.fn();
beforeEach(() => {
  replace.mockClear();
  login.mockReset();
  useAuthStore.setState({ login });
});

async function fill(email: string, password: string) {
  render(<LoginPage />);
  await userEvent.type(screen.getByLabelText('Email'), email);
  await userEvent.type(screen.getByLabelText('Mật khẩu'), password);
  await userEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
}

describe('Trang đăng nhập', () => {
  it('đúng → gọi login (email đã chuẩn hóa) rồi về trang trong ?next', async () => {
    login.mockResolvedValue({});
    await fill(' AN@Evolve.dev ', 'password123');
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/projects'));
    expect(login).toHaveBeenCalledWith({ email: 'an@evolve.dev', password: 'password123' });
  });

  it('sai mật khẩu (401) → lỗi hiện dưới ô mật khẩu, không chuyển trang', async () => {
    login.mockRejectedValue(new ApiError(401, 'Sai email hoặc mật khẩu'));
    await fill('an@evolve.dev', 'sai');
    expect(await screen.findByRole('alert')).toHaveTextContent('Sai email hoặc mật khẩu');
    expect(screen.getByLabelText('Mật khẩu')).toHaveAttribute('aria-invalid', 'true');
    expect(replace).not.toHaveBeenCalled();
  });

  it('email sai định dạng → báo lỗi tại chỗ, không gọi API', async () => {
    await fill('khong-phai-email', 'x');
    expect(await screen.findByText('Email không hợp lệ')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });
});
