'use client';

import { useParams } from 'next/navigation';
import { IssueDetail } from '@/components/issues/issue-detail';
import { Header } from '@/components/layout/header';
import { useIssuesStore } from '@/store/issues-store';

export default function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const identifier = useIssuesStore((s) => s.issues.find((i) => i.id === id)?.identifier);

  return (
    <>
      <Header title={identifier ?? 'Issue'} />
      <main className="flex-1 overflow-auto">
        <IssueDetail issueId={id} />
      </main>
    </>
  );
}
