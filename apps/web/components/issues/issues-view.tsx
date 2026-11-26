'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import {
  parseFilter,
  parseView,
  toSearch,
  type IssueFilterState,
  type IssueView,
} from '@/lib/issue-filter';
import { useProjectsStore } from '@/store/projects-store';
import { FilterBar } from './filter-bar';
import { IssueBoard } from './issue-board';
import { IssueList } from './issue-list';

/**
 * Thanh lọc + List/Board. Bộ lọc và chế độ xem nằm trên URL nên tải lại trang vẫn giữ nguyên
 * (thay cho nuqs: dùng useSearchParams của Next, không cần thêm thư viện).
 */
export function IssuesView({ projectId }: { projectId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const key = params.toString();
  const filter = useMemo(() => parseFilter(new URLSearchParams(key)), [key]);
  const view = parseView(params);

  const projects = useProjectsStore((s) => s.projects);
  const fetchProjects = useProjectsStore((s) => s.fetchProjects);
  useEffect(() => {
    if (!projectId && projects.length === 0) void fetchProjects();
  }, [fetchProjects, projectId, projects.length]);

  const update = (f: IssueFilterState, v: IssueView) =>
    router.replace(`${pathname}${toSearch(new URLSearchParams(key), f, v)}`, { scroll: false });

  return (
    <div className="flex h-full flex-col">
      <FilterBar
        filter={filter}
        onFilterChange={(f) => update(f, view)}
        view={view}
        onViewChange={(v) => update(filter, v)}
        hideProject={!!projectId}
      />
      <div className="min-h-0 flex-1 overflow-auto">
        {view === 'board' ? (
          <IssueBoard projectId={projectId} filter={filter} />
        ) : (
          <IssueList projectId={projectId} filter={filter} />
        )}
      </div>
    </div>
  );
}
