import { Header } from '@/components/layout/header';

/** Khung tạm (W2-A4). W2-C3 thay bằng danh sách issue. */
export default function IssuesPage() {
  return (
    <>
      <Header title="Issues" />
      <main className="flex-1 overflow-auto p-6 text-sm text-muted-foreground">
        Danh sách issue sẽ hiển thị ở đây.
      </main>
    </>
  );
}
