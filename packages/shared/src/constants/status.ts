export const STATUS_IDS = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE', 'CANCELED'] as const;

export type Status = (typeof STATUS_IDS)[number];

export interface StatusMeta {
  id: Status;
  name: string;
  /** Màu hex dùng cho icon và cột board */
  color: string;
  /** Thứ tự hiển thị trong list và board (tăng dần) */
  order: number;
}

export const STATUSES: readonly StatusMeta[] = [
  { id: 'BACKLOG', name: 'Backlog', color: '#8B8FA3', order: 0 },
  { id: 'TODO', name: 'Todo', color: '#E2E2E2', order: 1 },
  { id: 'IN_PROGRESS', name: 'In Progress', color: '#E8B07C', order: 2 },
  { id: 'DONE', name: 'Done', color: '#5E9E6E', order: 3 },
  { id: 'CANCELED', name: 'Canceled', color: '#6B6F80', order: 4 },
];

export const STATUS_BY_ID = Object.fromEntries(STATUSES.map((s) => [s.id, s])) as Record<
  Status,
  StatusMeta
>;

export const DEFAULT_STATUS: Status = 'BACKLOG';
