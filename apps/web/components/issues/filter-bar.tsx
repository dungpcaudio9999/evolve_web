'use client';

import { PRIORITIES, STATUSES } from '@evolve/shared';
import { ChevronDown, Kanban, List, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { PriorityIcon } from '@/components/common/priority-icon';
import { StatusIcon } from '@/components/common/status-icon';
import { UserAvatar } from '@/components/common/user-avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  EMPTY_FILTER,
  UNASSIGNED,
  isFilterEmpty,
  type FilterKey,
  type IssueFilterState,
  type IssueView,
} from '@/lib/issue-filter';
import { cn } from '@/lib/utils';
import { useIssuesStore } from '@/store/issues-store';
import { useProjectsStore } from '@/store/projects-store';

interface Option {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface FilterBarProps {
  filter: IssueFilterState;
  onFilterChange: (filter: IssueFilterState) => void;
  view: IssueView;
  onViewChange: (view: IssueView) => void;
  /** Ẩn bộ lọc project (trang /projects/[id]). */
  hideProject?: boolean;
}

/** Thanh lọc theo status/priority/assignee/project và nút chuyển List/Board (W5-A3). */
export function FilterBar({
  filter,
  onFilterChange,
  view,
  onViewChange,
  hideProject,
}: FilterBarProps) {
  const users = useIssuesStore((s) => s.users);
  const projects = useProjectsStore((s) => s.projects);

  const toggle = (key: FilterKey, value: string) => {
    const current = filter[key] as string[];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onFilterChange({ ...filter, [key]: next });
  };

  const groups: { key: FilterKey; label: string; options: Option[] }[] = [
    {
      key: 'status',
      label: 'Trạng thái',
      options: STATUSES.map((s) => ({
        value: s.id,
        label: s.name,
        icon: <StatusIcon status={s.id} decorative />,
      })),
    },
    {
      key: 'priority',
      label: 'Độ ưu tiên',
      options: PRIORITIES.map((p) => ({
        value: p.id,
        label: p.name,
        icon: <PriorityIcon priority={p.id} className="text-muted-foreground" decorative />,
      })),
    },
    {
      key: 'assignee',
      label: 'Người được giao',
      options: [
        {
          value: UNASSIGNED,
          label: 'Chưa giao',
          icon: <UserAvatar user={null} size={18} decorative />,
        },
        ...users.map((u) => ({
          value: u.id,
          label: u.name,
          icon: <UserAvatar user={u} size={18} decorative />,
        })),
      ],
    },
    ...(hideProject
      ? []
      : [
          {
            key: 'project' as const,
            label: 'Project',
            options: projects.map((p) => ({ value: p.id, label: p.name })),
          },
        ]),
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 border-b px-4 py-2 md:px-6">
      {groups.map((g) => {
        const count = filter[g.key].length;
        return (
          <DropdownMenu key={g.key}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'h-7 gap-1 px-2.5 text-xs',
                  count > 0 && 'border-primary text-primary',
                )}
              >
                {g.label}
                {count > 0 && <span>({count})</span>}
                <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
              {g.options.length === 0 && (
                <p className="px-2 py-1.5 text-xs text-muted-foreground">Không có lựa chọn</p>
              )}
              {g.options.map((o) => (
                <DropdownMenuCheckboxItem
                  key={o.value}
                  checked={(filter[g.key] as string[]).includes(o.value)}
                  onCheckedChange={() => toggle(g.key, o.value)}
                  onSelect={(e: Event) => e.preventDefault()}
                >
                  {o.icon}
                  {o.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}
      {!isFilterEmpty(filter) && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => onFilterChange(EMPTY_FILTER)}
        >
          <X className="size-3" />
          Xóa lọc
        </Button>
      )}
      <div role="group" aria-label="Chế độ xem" className="ml-auto flex rounded-full border p-0.5">
        {(
          [
            ['list', 'List', List],
            ['board', 'Board', Kanban],
          ] as const
        ).map(([v, label, Icon]) => (
          <button
            key={v}
            type="button"
            aria-pressed={view === v}
            onClick={() => onViewChange(v)}
            className={cn(
              'flex h-6 items-center gap-1 rounded-full px-2.5 text-xs text-muted-foreground transition-colors',
              view === v && 'bg-primary/15 text-primary',
            )}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
