'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_ITEMS, isActive } from './nav-items';

/** Thanh điều hướng ngang cho màn hình nhỏ (< md), thay cho sidebar. */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Điều hướng chính" className="flex gap-1 md:hidden">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex size-8 items-center justify-center rounded-md',
              active ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-accent/60',
            )}
          >
            <Icon className="size-4" />
          </Link>
        );
      })}
    </nav>
  );
}
