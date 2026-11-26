'use client';

import type { Project } from '@evolve/shared';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { IssueList } from '@/components/issues/issue-list';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useIssuesStore } from '@/store/issues-store';
import { useProjectsStore } from '@/store/projects-store';
import { ProjectFormModal } from './project-form-modal';
import { ProjectIcon } from './project-icon';

/** Nội dung trang /projects/[id]: thông tin project, sửa, xóa, và danh sách issue của project. */
export function ProjectDetail({ projectId }: { projectId: string }) {
  const router = useRouter();
  const project = useProjectsStore((s) => s.projects.find((p) => p.id === projectId));
  const fetchProject = useProjectsStore((s) => s.fetchProject);
  const deleteProject = useProjectsStore((s) => s.deleteProject);
  const issueCount = useIssuesStore(
    (s) => s.issues.filter((i) => i.projectId === projectId).length,
  );
  const [state, setState] = useState<'loading' | 'ready' | 'not-found'>('loading');
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    void fetchProject(projectId).then(
      (found) => !cancelled && setState(found ? 'ready' : 'not-found'),
    );
    return () => {
      cancelled = true;
    };
  }, [projectId, fetchProject]);

  if (state === 'not-found') {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-24 text-sm text-muted-foreground">
        Không tìm thấy project (có thể đã bị xóa hoặc thuộc người khác).
        <Button variant="outline" size="sm" asChild>
          <Link href="/projects">Về danh sách project</Link>
        </Button>
      </div>
    );
  }
  if (!project) {
    return (
      <p className="px-6 py-24 text-center text-sm text-muted-foreground">Đang tải project…</p>
    );
  }

  const remove = async (p: Project) => {
    setConfirming(false);
    try {
      await deleteProject(p.id);
      toast.success(`Đã xóa project ${p.key}`);
      router.push('/projects');
    } catch {
      // api-client đã hiện toast lỗi
    }
  };

  return (
    <>
      <section className="space-y-3 border-b px-4 py-5 md:px-6">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Projects
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <ProjectIcon project={project} size={36} />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-semibold">{project.name}</h2>
            <p className="text-sm text-muted-foreground">
              Key <span className="font-mono">{project.key}</span> · {issueCount} issue
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil /> Sửa
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirming(true)}
          >
            <Trash2 /> Xóa
          </Button>
        </div>
      </section>

      <IssueList projectId={project.id} />

      <ProjectFormModal open={editing} onOpenChange={setEditing} project={project} />
      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans">Xóa project {project.key}?</AlertDialogTitle>
            <AlertDialogDescription>
              Project “{project.name}” và <strong>toàn bộ {issueCount} issue</strong> của nó sẽ bị
              xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => void remove(project)}>
              Xóa project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
