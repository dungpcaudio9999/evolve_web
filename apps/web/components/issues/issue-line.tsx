import type { Issue, User } from '@evolve/shared';
import { PriorityIcon } from '@/components/common/priority-icon';
import { StatusIcon } from '@/components/common/status-icon';
import { UserAvatar } from '@/components/common/user-avatar';
import { formatShortDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { LabelBadge } from './label-badge';

interface IssueLineProps {
  issue: Issue;
  /** Người được giao (component cha tra theo `issue.assigneeId`); null = chưa giao. */
  assignee: User | null;
  className?: string;
}

/**
 * Một dòng issue trong danh sách:
 * [priority] [EVO-12] [status] Tiêu đề ……… [labels] [ngày] [avatar]
 * Trên màn hình nhỏ ẩn labels và ngày để tiêu đề còn chỗ.
 */
export function IssueLine({ issue, assignee, className }: IssueLineProps) {
  return (
    <div
      className={cn(
        'group flex h-11 items-center gap-3 border-b border-border/60 px-4 text-sm transition-colors hover:bg-accent/40 md:px-6',
        className,
      )}
    >
      <PriorityIcon priority={issue.priority} className="text-muted-foreground" />
      <span className="w-16 shrink-0 font-mono text-xs text-muted-foreground">
        {issue.identifier}
      </span>
      <StatusIcon status={issue.status} />
      <span className="min-w-0 flex-1 truncate">{issue.title}</span>
      {issue.labels.length > 0 && (
        <span className="hidden items-center gap-1 lg:flex">
          {issue.labels.map((label) => (
            <LabelBadge key={label.id} label={label} />
          ))}
        </span>
      )}
      <time
        dateTime={issue.createdAt}
        className="hidden w-14 shrink-0 text-right text-xs text-muted-foreground sm:block"
      >
        {formatShortDate(issue.createdAt)}
      </time>
      <UserAvatar user={assignee} size={22} />
    </div>
  );
}
