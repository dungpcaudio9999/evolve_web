import type { Project } from '@evolve/shared';
import { cn } from '@/lib/utils';

/** Ô vuông màu project, bên trong là icon (emoji) hoặc chữ cái đầu của key. */
export function ProjectIcon({
  project,
  size = 28,
  className,
}: {
  project: Pick<Project, 'icon' | 'color' | 'key'>;
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md font-semibold',
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.5),
        backgroundColor: `${project.color}26`,
        color: project.color,
        boxShadow: `inset 0 0 0 1px ${project.color}55`,
      }}
    >
      {project.icon || project.key[0]}
    </span>
  );
}
