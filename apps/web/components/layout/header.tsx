import type { ReactNode } from 'react';
import { Logo } from './logo';
import { MobileNav } from './mobile-nav';

interface HeaderProps {
  /** Tiêu đề trang (tiếng Anh, vì font tiêu đề không có chữ Việt có dấu). */
  title: string;
  /** Nút hành động bên phải, ví dụ "New issue". */
  actions?: ReactNode;
}

export function Header({ title, actions }: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4 md:px-6">
      <Logo className="md:hidden" />
      <h1 className="font-heading text-base font-semibold tracking-tight">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        {actions}
        <MobileNav />
      </div>
    </header>
  );
}
