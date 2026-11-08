import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';

/** Layout cho các trang chính: sidebar bên trái, nội dung bên phải (mỗi trang tự render Header). */
export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
