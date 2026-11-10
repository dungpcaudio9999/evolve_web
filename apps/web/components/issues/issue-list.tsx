'use client';

import { STATUSES, type Issue, type Status } from '@evolve/shared';
import { ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { StatusIcon } from '@/components/common/status-icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { groupByStatus, useIssuesStore } from '@/store/issues-store';
import { DeleteIssueDialog } from './delete-issue-dialog';
import { IssueContextMenu } from './issue-context-menu';
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
  const updateIssue = useIssuesStore((s) => s.updateIssue);
  const status = useIssuesStore((s) => s.status);
  const fetchIssues = useIssuesStore((s) => s.fetchIssues);
  const fetchMeta = useIssuesStore((s) => s.fetchMeta);

  // Tải issue mỗi khi mở danh sách (dữ liệu luôn mới từ DB); users/labels chỉ cần tải một lần.
  useEffect(() => {
    void fetchIssues(projectId ? { projectId } : undefined);
  }, [fetchIssues, projectId]);
  useEffect(() => {
    if (users.length === 0) void fetchMeta().catch(() => undefined);
  }, [fetchMeta, users.length]);
  const [collapsed, setCollapsed] = useState<Set<Status>>(() => new Set());
  const [deleting, setDeleting] = useState<Issue | null>(null);
  const deleteIssue = useIssuesStore((s) => s.deleteIssue);

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

  if (status === 'loading' && issues.length === 0) {
    return <p className="px-6 py-16 text-center text-sm text-muted-foreground">Đang tải issue…</p>;
  }
  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-sm text-muted-foreground">
        Không tải được danh sách issue.
        <Button
          variant="outline"
          size="sm"
          onClick={() => void fetchIssues(projectId ? { projectId } : undefined)}
        >
          Thử lại
        </Button>
      </div>
    );
  }
  if (issues.length === 0) {
    return (
      <p className="px-6 py-16 text-center text-sm text-muted-foreground">
        Chưa có issue nào. Nhấn <kbd className="rounded border px-1 font-mono text-xs">C</kbd> để
        tạo.
      </p>
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
                  <IssueContextMenu
                    key={issue.id}
                    issue={issue}
                    onChange={(patch) => void updateIssue(issue.id, patch)}
                    onRequestDelete={setDeleting}
                  >
                    <IssueLine
                      issue={issue}
                      assignee={(issue.assigneeId && userById.get(issue.assigneeId)) || null}
                      users={users}
                      onChange={(patch) => void updateIssue(issue.id, patch)}
                    />
                  </IssueContextMenu>
                ))}
              </div>
            )}
          </section>
        );
      })}
      <DeleteIssueDialog
        issue={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={() => {
          if (deleting) void deleteIssue(deleting.id);
          setDeleting(null);
        }}
      />
    </div>
  );
}
