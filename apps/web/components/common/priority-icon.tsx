import { PRIORITY_BY_ID, type Priority } from '@evolve/shared';
import { cn } from '@/lib/utils';

interface PriorityIconProps {
  priority: Priority;
  /** Kích thước (px). Mặc định 14. */
  size?: number;
  className?: string;
}

/** Số cột được tô đậm cho từng mức (trên tổng 3 cột). */
const FILLED_BARS: Partial<Record<Priority, number>> = { HIGH: 3, MEDIUM: 2, LOW: 1 };

/**
 * Icon độ ưu tiên kiểu Linear: No priority = 3 gạch ngang, Urgent = ô vuông có dấu "!",
 * High/Medium/Low = 3 cột với 3/2/1 cột tô đậm. Contract không có màu cho priority
 * nên icon dùng `currentColor` (màu chữ hiện tại); Urgent luôn dùng màu destructive (kể cả khi truyền className màu).
 */
export function PriorityIcon({ priority, size = 14, className }: PriorityIconProps) {
  const { name } = PRIORITY_BY_ID[priority];
  const filled = FILLED_BARS[priority];

  return (
    <svg
      role="img"
      aria-label={name}
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      className={cn('shrink-0', className, priority === 'URGENT' && 'text-destructive')}
    >
      <title>{name}</title>
      {priority === 'NO_PRIORITY' && (
        <g fill="currentColor" opacity="0.6">
          <rect x="1.5" y="6.25" width="2.5" height="1.5" rx="0.5" />
          <rect x="5.75" y="6.25" width="2.5" height="1.5" rx="0.5" />
          <rect x="10" y="6.25" width="2.5" height="1.5" rx="0.5" />
        </g>
      )}
      {priority === 'URGENT' && (
        <>
          <rect x="1" y="1" width="12" height="12" rx="3" fill="currentColor" />
          <path
            d="M7 3.75v4M7 10.25v.01"
            stroke="var(--background)"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </>
      )}
      {filled !== undefined &&
        [0, 1, 2].map((i) => (
          <rect
            key={i}
            x={1.5 + i * 4.25}
            y={9 - i * 3}
            width="2.5"
            height={3.5 + i * 3}
            rx="0.5"
            fill="currentColor"
            opacity={i < filled ? 1 : 0.3}
          />
        ))}
    </svg>
  );
}
