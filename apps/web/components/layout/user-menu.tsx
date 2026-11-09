'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserAvatar } from '@/components/common/user-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

interface UserMenuProps {
  /** Hiện tên bên cạnh avatar (sidebar). Mặc định chỉ avatar (header mobile). */
  showName?: boolean;
  className?: string;
}

export function UserMenu({ showName, className }: UserMenuProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Tài khoản: ${user.name}`}
        className={cn(
          'flex min-w-0 items-center gap-2 rounded-md p-1.5 text-sm outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
      >
        <UserAvatar user={user} size={24} decorative />
        {showName && <span className="truncate">{user.name}</span>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="grid">
          <span className="truncate">{user.name}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            logout();
            router.replace('/login');
          }}
        >
          <LogOut />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
