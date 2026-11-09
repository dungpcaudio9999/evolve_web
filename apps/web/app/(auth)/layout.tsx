import type { ReactNode } from 'react';
import { GuestGuard } from '@/components/auth/auth-guard';
import { Logo } from '@/components/layout/logo';

/** Layout cho đăng nhập / đăng ký: căn giữa, không có sidebar. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <GuestGuard>
      <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-10">
        <Logo className="text-3xl" />
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </GuestGuard>
  );
}
