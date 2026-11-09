'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { UNAUTHORIZED_EVENT } from '@/lib/api-client';
import { safeNextPath, useAuthStore } from '@/store/auth-store';

/** Màn hình chờ trong lúc kiểm tra đăng nhập. */
export function AuthLoading() {
  return (
    <div
      role="status"
      aria-label="Đang tải"
      className="flex min-h-dvh flex-1 items-center justify-center"
    >
      <span className="size-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
    </div>
  );
}

/**
 * Bọc các trang cần đăng nhập (layout `(main)`).
 * Chưa đăng nhập → /login?next=<trang hiện tại>. API trả 401 bất kỳ lúc nào → đăng xuất.
 * Lưu ý: guard chạy ở trình duyệt (token nằm trong localStorage); API vẫn tự kiểm tra JWT.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const init = useAuthStore((s) => s.init);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'idle') void init();
  }, [status, init]);

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout);
  }, [logout]);

  useEffect(() => {
    if (status === 'guest') router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [status, pathname, router]);

  return status === 'authenticated' ? children : <AuthLoading />;
}

/** Bọc trang đăng nhập/đăng ký: đã đăng nhập thì chuyển thẳng vào app. */
export function GuestGuard({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const init = useAuthStore((s) => s.init);
  const router = useRouter();

  useEffect(() => {
    if (status === 'idle') void init();
  }, [status, init]);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(safeNextPath(new URLSearchParams(window.location.search).get('next')));
    }
  }, [status, router]);

  return status === 'guest' ? children : <AuthLoading />;
}
