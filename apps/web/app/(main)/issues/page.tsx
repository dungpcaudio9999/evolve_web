import { IssueList } from '@/components/issues/issue-list';
import { NewIssueButton } from '@/components/issues/new-issue-button';
import { Header } from '@/components/layout/header';

export default function IssuesPage() {
  return (
    <>
      <Header title="Issues" actions={<NewIssueButton />} />
      <main className="flex-1 overflow-auto">
        <IssueList />
      </main>
    </>
  );
}
