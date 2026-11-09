import { STATUS_BY_ID, type Status } from '@evolve/shared';
import { cn } from '@/lib/utils';

interface StatusIconProps {
  status: Status;
  /** Kích thước (px). Mặc định 14. */
  size?: number;
  className?: string;
  /** Icon chỉ để trang trí (đã có chữ bên cạnh): ẩn khỏi trình đọc màn hình, không có <title>. */
  decorative?: boolean;
}

/**
 * Icon trạng thái kiểu Linear, màu lấy từ contract (`STATUS_BY_ID`):
 * Backlog = vòng nét đứt, Todo = vòng rỗng, In Progress = vòng nửa,
 * Done = tròn đầy có dấu tích, Canceled = tròn đầy có dấu x.
 */
export function StatusIcon({ status, size = 14, className, decorative }: StatusIconProps) {
  const { color, name } = STATUS_BY_ID[status];

  return (
    <svg
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative || undefined}
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      className={cn('shrink-0', className)}
      style={{ color }}
    >
      {!decorative && <title>{name}</title>}
      {status === 'BACKLOG' && (
        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
      )}
      {status === 'TODO' && <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />}
      {status === 'IN_PROGRESS' && (
        <>
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 3.5a3.5 3.5 0 0 1 0 7z" fill="currentColor" />
        </>
      )}
      {status === 'DONE' && (
        <>
          <circle cx="7" cy="7" r="7" fill="currentColor" />
          <path
            d="M4.2 7.2l1.9 1.9 3.7-3.9"
            stroke="var(--background)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {status === 'CANCELED' && (
        <>
          <circle cx="7" cy="7" r="7" fill="currentColor" />
          <path
            d="M4.9 4.9l4.2 4.2M9.1 4.9L4.9 9.1"
            stroke="var(--background)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}
