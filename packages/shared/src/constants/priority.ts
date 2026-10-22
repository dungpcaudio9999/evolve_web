export const PRIORITY_IDS = ['NO_PRIORITY', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'] as const;

export type Priority = (typeof PRIORITY_IDS)[number];

export interface PriorityMeta {
  id: Priority;
  name: string;
  /** Thứ tự hiển thị trong selector (tăng dần) */
  order: number;
}

export const PRIORITIES: readonly PriorityMeta[] = [
  { id: 'NO_PRIORITY', name: 'No priority', order: 0 },
  { id: 'URGENT', name: 'Urgent', order: 1 },
  { id: 'HIGH', name: 'High', order: 2 },
  { id: 'MEDIUM', name: 'Medium', order: 3 },
  { id: 'LOW', name: 'Low', order: 4 },
];

export const PRIORITY_BY_ID = Object.fromEntries(PRIORITIES.map((p) => [p.id, p])) as Record<
  Priority,
  PriorityMeta
>;

export const DEFAULT_PRIORITY: Priority = 'NO_PRIORITY';
