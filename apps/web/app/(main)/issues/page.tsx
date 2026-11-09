import { IssueList } from '@/components/issues/issue-list';
import { Header } from '@/components/layout/header';

export default function IssuesPage() {
  return (
    <>
      <Header title="Issues" />
      <main className="flex-1 overflow-auto">
        <IssueList />
      </main>
    </>
  );
}
