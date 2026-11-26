import { Suspense } from 'react';
import { IssuesView } from '@/components/issues/issues-view';
import { NewIssueButton } from '@/components/issues/new-issue-button';
import { Header } from '@/components/layout/header';

export default function IssuesPage() {
  return (
    <>
      <Header title="Issues" actions={<NewIssueButton />} />
      <main className="min-h-0 flex-1 overflow-hidden">
        {/* useSearchParams cần Suspense khi build tĩnh */}
        <Suspense>
          <IssuesView />
        </Suspense>
      </main>
    </>
  );
}
