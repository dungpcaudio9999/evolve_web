import { STATUSES } from '@evolve/shared';

/** Trang tạm thời. W2-C2 sẽ chuyển hướng sang /issues. */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-semibold tracking-tight">Evolve Web</h1>
      <p className="text-sm text-neutral-500">Quản lý dự án tối giản</p>
      <ul className="flex flex-wrap justify-center gap-2 text-xs">
        {STATUSES.map((s) => (
          <li
            key={s.id}
            className="rounded-full border px-3 py-1"
            style={{ borderColor: s.color, color: s.color }}
          >
            {s.name}
          </li>
        ))}
      </ul>
    </main>
  );
}
