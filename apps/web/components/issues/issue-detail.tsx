'use client';

import type { Issue } from '@evolve/shared';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { ProjectIcon } from '@/components/projects/project-icon';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatShortDate } from '@/lib/format';
import { useIssuesStore } from '@/store/issues-store';
import { useProjectsStore } from '@/store/projects-store';
import { AssigneeSelector } from './assignee-selector';
import { DeleteIssueDialog } from './delete-issue-dialog';
import { EditableTitle } from './editable-title';
import { LabelSelector } from './label-selector';
import { PrioritySelector } from './priority-selector';
import { StatusSelector } from './status-selector';

function Property({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] items-center gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Nội dung trang /issues/[id]: sửa tiêu đề, mô tả và thuộc tính; mọi thay đổi lưu thẳng vào API. */
export function IssueDetail({ issueId }: { issueId: string }) {
  const router = useRouter();
  const issue = useIssuesStore((s) => s.issues.find((i) => i.id === issueId));
  const users = useIssuesStore((s) => s.users);
  const labels = useIssuesStore((s) => s.labels);
  const fetchIssue = useIssuesStore((s) => s.fetchIssue);
  const fetchMeta = useIssuesStore((s) => s.fetchMeta);
  const updateIssue = useIssuesStore((s) => s.updateIssue);
  const deleteIssue = useIssuesStore((s) => s.deleteIssue);
  const project = useProjectsStore((s) => s.projects.find((p) => p.id === issue?.projectId));
  const projectsStatus = useProjectsStore((s) => s.status);
  const fetchProjects = useProjectsStore((s) => s.fetchProjects);

  const [state, setState] = useState<'loading' | 'ready' | 'not-found'>('loading');
  const [description, setDescription] = useState('');
  const [deleting, setDeleting] = useState<Issue | null>(null);

  // Luôn tải lại issue từ API khi mở trang (dữ liệu mới nhất).
  useEffect(() => {
    let cancelled = false;
    setState('loading');
    void fetchIssue(issueId).then((found) => !cancelled && setState(found ? 'ready' : 'not-found'));
    return () => {
      cancelled = true;
    };
  }, [issueId, fetchIssue]);
  useEffect(() => {
    if (users.length === 0) void fetchMeta().catch(() => undefined);
    if (projectsStatus === 'idle') void fetchProjects();
  }, [users.length, fetchMeta, projectsStatus, fetchProjects]);
  useEffect(() => setDescription(issue?.description ?? ''), [issue?.description]);

  if (state === 'not-found') {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-24 text-sm text-muted-foreground">
        Không tìm thấy issue (có thể đã bị xóa hoặc thuộc project của người khác).
        <Button variant="outline" size="sm" asChild>
          <Link href="/issues">Về danh sách issue</Link>
        </Button>
      </div>
    );
  }
  if (!issue) {
    return <p className="px-6 py-24 text-center text-sm text-muted-foreground">Đang tải issue…</p>;
  }

  const save = (patch: Parameters<typeof updateIssue>[1]) => void updateIssue(issue.id, patch);

  return (
    <div className="mx-auto grid max-w-5xl gap-8 p-4 md:grid-cols-[1fr_16rem] md:p-8">
      <article className="min-w-0 space-y-4">
        <Link
          href="/issues"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Issues
        </Link>
        <EditableTitle value={issue.title} onSave={(title) => save({ title })} />
        <Textarea
          aria-label="Mô tả"
          placeholder="Thêm mô tả…"
          rows={10}
          className="min-h-48"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => {
            const next = description.trim() ? description : null;
            if (next !== issue.description) save({ description: next });
          }}
        />
      </article>

      <aside aria-label="Thuộc tính" className="space-y-3 rounded-lg border bg-card p-4">
        <Property label="Trạng thái">
          <StatusSelector value={issue.status} onChange={(status) => save({ status })} showLabel />
        </Property>
        <Property label="Độ ưu tiên">
          <PrioritySelector
            value={issue.priority}
            onChange={(priority) => save({ priority })}
            showLabel
          />
        </Property>
        <Property label="Người làm">
          <AssigneeSelector
            value={issue.assigneeId}
            users={users}
            onChange={(assigneeId) => save({ assigneeId })}
            showLabel
          />
        </Property>
        <Property label="Nhãn">
          <LabelSelector
            value={issue.labels.map((l) => l.id)}
            labels={labels}
            onChange={(labelIds) => save({ labelIds })}
          />
        </Property>
        <Property label="Project">
          {project ? (
            <Link
              href={`/projects/${project.id}`}
              className="flex items-center gap-2 hover:underline"
            >
              <ProjectIcon project={project} size={20} />
              <span className="truncate">{project.name}</span>
            </Link>
          ) : (
            <span className="text-muted-foreground">…</span>
          )}
        </Property>
        <Property label="Tạo lúc">
          <time dateTime={issue.createdAt}>{formatShortDate(issue.createdAt)}</time>
        </Property>
        <Property label="Cập nhật">
          <time dateTime={issue.updatedAt}>{formatShortDate(issue.updatedAt)}</time>
        </Property>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={() => setDeleting(issue)}
        >
          <Trash2 /> Xóa issue
        </Button>
      </aside>

      <DeleteIssueDialog
        issue={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={() => {
          setDeleting(null);
          void deleteIssue(issue.id).then(() => router.push('/issues'));
        }}
      />
    </div>
  );
}
