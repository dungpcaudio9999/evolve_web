import type { Project } from '@evolve/shared';
import Link from 'next/link';
import { formatShortDate } from '@/lib/format';
import { ProjectIcon } from './project-icon';

/** Một dòng project; bấm để mở trang chi tiết. */
export function ProjectLine({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="flex h-14 items-center gap-3 border-b border-border/60 px-4 text-sm transition-colors hover:bg-accent/40 focus-visible:bg-accent/40 focus-visible:outline-none md:px-6"
    >
      <ProjectIcon project={project} />
      <span className="min-w-0 flex-1 truncate font-medium">{project.name}</span>
      <span className="w-14 font-mono text-xs text-muted-foreground">{project.key}</span>
      <time
        dateTime={project.createdAt}
        className="hidden w-14 text-right text-xs text-muted-foreground sm:block"
      >
        {formatShortDate(project.createdAt)}
      </time>
    </Link>
  );
}
