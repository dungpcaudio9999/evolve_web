import type { Label } from '@evolve/shared';
import { cn } from '@/lib/utils';

/** Nhãn dạng viên thuốc có chấm màu, giống Linear. */
export function LabelBadge({ label, className }: { label: Label; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 shrink-0 items-center gap-1.5 rounded-full border px-2 text-xs text-muted-foreground',
        className,
      )}
    >
      <span className="size-2 rounded-full" style={{ backgroundColor: label.color }} />
      {label.name}
    </span>
  );
}
