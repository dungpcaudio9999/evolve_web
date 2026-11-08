import { redirect } from 'next/navigation';

/** Trang chủ chuyển thẳng sang danh sách issue. */
export default function Home() {
  redirect('/issues');
}
