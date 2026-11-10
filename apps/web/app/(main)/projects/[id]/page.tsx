'use client';

import { useParams } from 'next/navigation';
import { NewIssueButton } from '@/components/issues/new-issue-button';
import { Header } from '@/components/layout/header';
import { ProjectDetail } from '@/components/projects/project-detail';
import { useProjectsStore } from '@/store/projects-store';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  // Header dùng font Panchang (không có chữ Việt) nên hiện key, tên đầy đủ nằm trong nội dung.
  const key = useProjectsStore((s) => s.projects.find((p) => p.id === id)?.key);

  return (
    <>
      <Header title={key ?? 'Project'} actions={<NewIssueButton projectId={id} />} />
      <main className="flex-1 overflow-auto">
        <ProjectDetail projectId={id} />
      </main>
    </>
  );
}
