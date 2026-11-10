'use client';

import type { Issue, UpdateIssueInput, User } from '@evolve/shared';
import Link from 'next/link';
import type { ComponentProps } from 'react';
import { PriorityIcon } from '@/components/common/priority-icon';
import { StatusIcon } from '@/components/common/status-icon';
import { UserAvatar } from '@/components/common/user-avatar';
import { formatShortDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { AssigneeSelector } from './assignee-selector';
import { LabelBadge } from './label-badge';
import { PrioritySelector } from './priority-selector';
import { StatusSelector } from './status-selector';

interface IssueLineProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  issue: Issue;
  /** Người được giao (component cha tra theo `issue.assigneeId`); null = chưa giao. */
  assignee: User | null;
  /** Danh sách người có thể giao (cần khi có `onChange`). */
  users?: User[];
  /** Có thì icon priority/status/avatar thành nút đổi giá trị; không có thì chỉ hiển thị. */
  onChange?: (patch: UpdateIssueInput) => void;
  className?: string;
}

/**
 * Một dòng issue trong danh sách:
 * [priority] [EVO-12] [status] Tiêu đề ……… [labels] [ngày] [avatar]
 * Trên màn hình nhỏ ẩn labels và ngày để tiêu đề còn chỗ.
 */
/** Thuộc tính thừa (ref, onContextMenu…) chuyển xuống thẻ div để bọc được bằng ContextMenuTrigger asChild. */
export function IssueLine({
  issue,
  assignee,
  users = [],
  onChange,
  className,
  ...rest
}: IssueLineProps) {
  return (
    <div
      {...rest}
      className={cn(
        'group flex h-11 items-center gap-3 border-b border-border/60 px-4 text-sm transition-colors hover:bg-accent/40 md:px-6',
        onChange && 'gap-2',
        className,
      )}
    >
      {onChange ? (
        <PrioritySelector value={issue.priority} onChange={(priority) => onChange({ priority })} />
      ) : (
        <PriorityIcon priority={issue.priority} className="text-muted-foreground" />
      )}
      <span className="w-16 shrink-0 font-mono text-xs text-muted-foreground">
        {issue.identifier}
      </span>
      {onChange ? (
        <StatusSelector value={issue.status} onChange={(status) => onChange({ status })} />
      ) : (
        <StatusIcon status={issue.status} />
      )}
      <Link
        href={`/issues/${issue.id}`}
        className="min-w-0 flex-1 truncate outline-none hover:underline focus-visible:underline"
      >
        {issue.title}
      </Link>
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
      {onChange ? (
        <AssigneeSelector
          value={issue.assigneeId}
          users={users}
          onChange={(assigneeId) => onChange({ assigneeId })}
        />
      ) : (
        <UserAvatar user={assignee} size={22} />
      )}
    </div>
  );
}
