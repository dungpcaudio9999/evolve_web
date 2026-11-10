'use client';

import { PRIORITIES, STATUSES, type Issue, type UpdateIssueInput } from '@evolve/shared';
import { Check, ExternalLink, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { PriorityIcon } from '@/components/common/priority-icon';
import { StatusIcon } from '@/components/common/status-icon';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface IssueContextMenuProps {
  issue: Issue;
  onChange: (patch: UpdateIssueInput) => void;
  /** Mở hộp thoại xác nhận xóa (component cha giữ một hộp thoại dùng chung). */
  onRequestDelete: (issue: Issue) => void;
  children: ReactNode;
}

/** Menu chuột phải cho một dòng issue: mở, đổi trạng thái/độ ưu tiên, xóa. */
export function IssueContextMenu({
  issue,
  onChange,
  onRequestDelete,
  children,
}: IssueContextMenuProps) {
  const router = useRouter();

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem onSelect={() => router.push(`/issues/${issue.id}`)}>
          <ExternalLink />
          Mở {issue.identifier}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <StatusIcon status={issue.status} decorative />
            Trạng thái
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-44">
            {STATUSES.map((s) => (
              <ContextMenuItem
                key={s.id}
                onSelect={() => s.id !== issue.status && onChange({ status: s.id })}
              >
                <StatusIcon status={s.id} decorative />
                <span className="flex-1">{s.name}</span>
                {s.id === issue.status && <Check className="text-primary" />}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <PriorityIcon priority={issue.priority} className="text-muted-foreground" decorative />
            Độ ưu tiên
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-44">
            {PRIORITIES.map((p) => (
              <ContextMenuItem
                key={p.id}
                onSelect={() => p.id !== issue.priority && onChange({ priority: p.id })}
              >
                <PriorityIcon priority={p.id} className="text-muted-foreground" decorative />
                <span className="flex-1">{p.name}</span>
                {p.id === issue.priority && <Check className="text-primary" />}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" onSelect={() => onRequestDelete(issue)}>
          <Trash2 />
          Xóa issue…
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
