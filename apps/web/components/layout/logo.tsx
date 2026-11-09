import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/issues"
      className={cn('text-gradient font-heading text-lg font-bold tracking-tight', className)}
    >
      Evolve
    </Link>
  );
}
