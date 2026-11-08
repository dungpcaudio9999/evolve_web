'use client';

import { STATUSES, type Status } from '@evolve/shared';
import { ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { StatusIcon } from '@/components/common/status-icon';
import { cn } from '@/lib/utils';
import { groupByStatus, useIssuesStore } from '@/store/issues-store';
import { IssueLine } from './issue-line';

interface IssueListProps {
  /** Chỉ hiện issue của project này (W4: trang /projects/[id]). Bỏ trống = tất cả. */
  projectId?: string;
}

/**
 * Danh sách issue nhóm theo trạng thái (thứ tự Backlog → Canceled), mỗi nhóm sắp theo rank.
 * Header nhóm có icon, tên, số lượng; bấm để thu gọn/mở. Nhóm rỗng không hiển thị.
 */
export function IssueList({ projectId }: IssueListProps) {
  const allIssues = useIssuesStore((s) => s.issues);
  const users = useIssuesStore((s) => s.users);
  const [collapsed, setCollapsed] = useState<Set<Status>>(() => new Set());

  const issues = useMemo(
    () => (projectId ? allIssues.filter((i) => i.projectId === projectId) : allIssues),
    [allIssues, projectId],
  );
  const groups = useMemo(() => groupByStatus(issues), [issues]);
  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  const toggle = (status: Status) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });

  if (issues.length === 0) {
    return (
      <p className="px-6 py-16 text-center text-sm text-muted-foreground">Chưa có issue nào.</p>
    );
  }

  return (
    <div>
      {STATUSES.filter((s) => groups[s.id].length > 0).map((status) => {
        const isCollapsed = collapsed.has(status.id);
        const contentId = `issue-group-${status.id}`;
        return (
          <section key={status.id} aria-label={status.name}>
            <button
              type="button"
              onClick={() => toggle(status.id)}
              aria-expanded={!isCollapsed}
              aria-controls={contentId}
              className="sticky top-0 z-10 flex h-10 w-full items-center gap-2 border-b bg-card px-4 text-sm font-medium hover:bg-accent/50 md:px-6"
            >
              <ChevronRight
                className={cn(
                  'size-3.5 text-muted-foreground transition-transform',
                  !isCollapsed && 'rotate-90',
                )}
              />
              <StatusIcon status={status.id} />
              {status.name}
              <span className="text-muted-foreground">{groups[status.id].length}</span>
            </button>
            {!isCollapsed && (
              <div id={contentId}>
                {groups[status.id].map((issue) => (
                  <IssueLine
                    key={issue.id}
                    issue={issue}
                    assignee={(issue.assigneeId && userById.get(issue.assigneeId)) || null}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
