import { FolderKanban, ListTodo, type LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Mục điều hướng chính. Thêm trang mới vào đây để hiện trên sidebar và thanh mobile. */
export const NAV_ITEMS: NavItem[] = [
  { href: '/issues', label: 'Issues', icon: ListTodo },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
];

/** Mục đang mở: khớp chính xác hoặc là trang con (vd. /issues/abc). */
export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
