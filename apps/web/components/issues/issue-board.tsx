'use client';

import { STATUSES, type Issue, type Status, type User } from '@evolve/shared';
import Link from 'next/link';
import { useEffect, useMemo, useState, type ComponentProps, type DragEvent } from 'react';
import { PriorityIcon } from '@/components/common/priority-icon';
import { StatusIcon } from '@/components/common/status-icon';
import { UserAvatar } from '@/components/common/user-avatar';
import { dropTarget } from '@/lib/board-drop';
import { applyFilter, type IssueFilterState } from '@/lib/issue-filter';
import { cn } from '@/lib/utils';
import { groupByStatus, useIssuesStore } from '@/store/issues-store';
import { DeleteIssueDialog } from './delete-issue-dialog';
import { IssueContextMenu } from './issue-context-menu';
import { LabelBadge } from './label-badge';

/** Kiểu dữ liệu riêng khi kéo, để không nhận nhầm văn bản/file kéo từ nơi khác vào. */
export const DRAG_TYPE = 'application/x-evolve-issue';

interface IssueBoardProps {
  projectId?: string;
  filter?: IssueFilterState;
}

interface DropSlot {
  status: Status;
  index: number;
}

/**
 * Bảng Kanban 5 cột theo trạng thái (W5-C1). Kéo thả bằng HTML5 Drag and Drop:
 * thả lên nửa trên/nửa dưới của thẻ để đặt trước/sau thẻ đó; thả vào khoảng trống → cuối cột.
 * Giao diện đổi ngay; store gọi PATCH /issues/:id/move, lỗi thì trả về chỗ cũ (W5-C2).
 */
export function IssueBoard({ projectId, filter }: IssueBoardProps) {
  const allIssues = useIssuesStore((s) => s.issues);
  const users = useIssuesStore((s) => s.users);
  const status = useIssuesStore((s) => s.status);
  const fetchIssues = useIssuesStore((s) => s.fetchIssues);
  const fetchMeta = useIssuesStore((s) => s.fetchMeta);
  const moveIssue = useIssuesStore((s) => s.moveIssue);
  const updateIssue = useIssuesStore((s) => s.updateIssue);
  const deleteIssue = useIssuesStore((s) => s.deleteIssue);

  useEffect(() => {
    void fetchIssues(projectId ? { projectId } : undefined);
  }, [fetchIssues, projectId]);
  useEffect(() => {
    if (users.length === 0) void fetchMeta().catch(() => undefined);
  }, [fetchMeta, users.length]);

  const [dragId, setDragId] = useState<string | null>(null);
  const [slot, setSlot] = useState<DropSlot | null>(null);
  const [deleting, setDeleting] = useState<Issue | null>(null);

  const issues = useMemo(() => {
    const own = projectId ? allIssues.filter((i) => i.projectId === projectId) : allIssues;
    return filter ? applyFilter(own, filter) : own;
  }, [allIssues, projectId, filter]);
  const groups = useMemo(() => groupByStatus(issues), [issues]);
  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  if (status === 'loading' && issues.length === 0) {
    return <p className="px-6 py-16 text-center text-sm text-muted-foreground">Đang tải issue…</p>;
  }

  const endDrag = () => {
    setDragId(null);
    setSlot(null);
  };

  const drop = (e: DragEvent, target: DropSlot) => {
    e.preventDefault();
    const id = e.dataTransfer.getData(DRAG_TYPE) || dragId;
    endDrag();
    if (!id) return;
    const input = dropTarget(groups[target.status], id, target.status, target.index);
    if (input) void moveIssue(id, input);
  };

  const accepts = (e: DragEvent) => e.dataTransfer.types.includes(DRAG_TYPE);

  return (
    <div className="flex h-full gap-3 overflow-x-auto p-4 md:px-6">
      {STATUSES.map((s) => {
        const column = groups[s.id];
        return (
          <section
            key={s.id}
            aria-label={s.name}
            data-testid={`board-column-${s.id}`}
            className={cn(
              'flex w-72 shrink-0 flex-col rounded-[0.8rem] border bg-card/60',
              slot?.status === s.id && 'border-primary/50',
            )}
            onDragOver={(e) => {
              if (!accepts(e)) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (slot?.status !== s.id || slot.index !== column.length)
                setSlot({ status: s.id, index: column.length });
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setSlot(null);
            }}
            onDrop={(e) => drop(e, { status: s.id, index: column.length })}
          >
            <header className="flex h-10 items-center gap-2 px-3 text-sm font-medium">
              <StatusIcon status={s.id} />
              {s.name}
              <span className="text-muted-foreground">{column.length}</span>
            </header>
            <ol className="flex min-h-16 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
              {column.map((issue, index) => (
                <li
                  key={issue.id}
                  draggable
                  data-testid={`board-card-${issue.identifier}`}
                  onDragStart={(e) => {
                    e.dataTransfer.setData(DRAG_TYPE, issue.id);
                    e.dataTransfer.effectAllowed = 'move';
                    setDragId(issue.id);
                  }}
                  onDragEnd={endDrag}
                  onDragOver={(e) => {
                    if (!accepts(e)) return;
                    e.preventDefault();
                    e.stopPropagation();
                    const box = e.currentTarget.getBoundingClientRect();
                    const at = e.clientY < box.top + box.height / 2 ? index : index + 1;
                    if (slot?.status !== s.id || slot.index !== at)
                      setSlot({ status: s.id, index: at });
                  }}
                  onDrop={(e) => {
                    e.stopPropagation();
                    drop(e, slot?.status === s.id ? slot : { status: s.id, index });
                  }}
                  className={cn(
                    'relative',
                    dragId === issue.id && 'opacity-40',
                    slot?.status === s.id &&
                      slot.index === index &&
                      'before:absolute before:inset-x-1 before:-top-1.5 before:h-0.5 before:rounded before:bg-primary',
                    slot?.status === s.id &&
                      slot.index === column.length &&
                      index === column.length - 1 &&
                      'after:absolute after:inset-x-1 after:-bottom-1.5 after:h-0.5 after:rounded after:bg-primary',
                  )}
                >
                  <IssueContextMenu
                    issue={issue}
                    onChange={(patch) => void updateIssue(issue.id, patch)}
                    onRequestDelete={setDeleting}
                  >
                    <BoardCard
                      issue={issue}
                      assignee={(issue.assigneeId && userById.get(issue.assigneeId)) || null}
                    />
                  </IssueContextMenu>
                </li>
              ))}
            </ol>
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

/** Thuộc tính thừa (ref, onContextMenu…) chuyển xuống thẻ a để bọc được bằng ContextMenuTrigger asChild. */
function BoardCard({
  issue,
  assignee,
  ...rest
}: { issue: Issue; assignee: User | null } & Omit<ComponentProps<'a'>, 'href'>) {
  return (
    <Link
      {...rest}
      href={`/issues/${issue.id}`}
      draggable={false}
      className="flex cursor-grab flex-col gap-2 rounded-[0.8rem] border bg-card p-3 text-sm transition-colors hover:border-primary/40 active:cursor-grabbing"
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-mono">{issue.identifier}</span>
        <span className="ml-auto">
          <UserAvatar user={assignee} size={20} />
        </span>
      </div>
      <p className="line-clamp-2 font-medium">{issue.title}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <PriorityIcon priority={issue.priority} className="text-muted-foreground" />
        {issue.labels.map((label) => (
          <LabelBadge key={label.id} label={label} />
        ))}
      </div>
    </Link>
  );
}
