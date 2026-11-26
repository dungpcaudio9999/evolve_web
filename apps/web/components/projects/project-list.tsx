'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useProjectsStore } from '@/store/projects-store';
import { ProjectLine } from './project-line';

/** Danh sách project của người dùng; tự tải khi hiển thị. */
export function ProjectList({ onCreate }: { onCreate: () => void }) {
  const projects = useProjectsStore((s) => s.projects);
  const status = useProjectsStore((s) => s.status);
  const fetchProjects = useProjectsStore((s) => s.fetchProjects);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  if (status === 'loading' && projects.length === 0) {
    return (
      <p className="px-6 py-16 text-center text-sm text-muted-foreground">Đang tải project…</p>
    );
  }
  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-sm text-muted-foreground">
        Không tải được danh sách project.
        <Button variant="outline" size="sm" onClick={() => void fetchProjects()}>
          Thử lại
        </Button>
      </div>
    );
  }
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-sm text-muted-foreground">
        Bạn chưa có project nào.
        <Button size="sm" onClick={onCreate}>
          Tạo project đầu tiên
        </Button>
      </div>
    );
  }
  return (
    <div>
      {projects.map((project) => (
        <ProjectLine key={project.id} project={project} />
      ))}
    </div>
  );
}
