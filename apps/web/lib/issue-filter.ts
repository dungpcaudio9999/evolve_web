import { PRIORITY_IDS, STATUS_IDS, type Issue, type Priority, type Status } from '@evolve/shared';

/** Bộ lọc của trang Issues, lưu trên URL (`?status=TODO,DONE&priority=HIGH&assignee=…&project=…&view=board`). */
export interface IssueFilterState {
  status: Status[];
  priority: Priority[];
  /** id người được giao; `'none'` = chưa giao. */
  assignee: string[];
  project: string[];
}

export type IssueView = 'list' | 'board';

export const EMPTY_FILTER: IssueFilterState = {
  status: [],
  priority: [],
  assignee: [],
  project: [],
};
export const FILTER_KEYS = ['status', 'priority', 'assignee', 'project'] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];
export const UNASSIGNED = 'none';

type Params = Pick<URLSearchParams, 'get'>;

const list = (params: Params, key: string) =>
  (params.get(key) ?? '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

/** Đọc bộ lọc từ URL; giá trị status/priority không hợp lệ bị bỏ qua. */
export function parseFilter(params: Params): IssueFilterState {
  return {
    status: list(params, 'status').filter((v): v is Status => STATUS_IDS.includes(v as Status)),
    priority: list(params, 'priority').filter((v): v is Priority =>
      PRIORITY_IDS.includes(v as Priority),
    ),
    assignee: list(params, 'assignee'),
    project: list(params, 'project'),
  };
}

export function parseView(params: Params): IssueView {
  return params.get('view') === 'board' ? 'board' : 'list';
}

/** Ghi bộ lọc + chế độ xem vào query string (giữ nguyên các tham số khác). */
export function toSearch(
  current: URLSearchParams,
  filter: IssueFilterState,
  view: IssueView,
): string {
  const next = new URLSearchParams(current);
  for (const key of FILTER_KEYS) {
    if (filter[key].length) next.set(key, filter[key].join(','));
    else next.delete(key);
  }
  if (view === 'board') next.set('view', 'board');
  else next.delete('view');
  const s = next.toString();
  return s ? `?${s}` : '';
}

export const isFilterEmpty = (f: IssueFilterState) => FILTER_KEYS.every((k) => f[k].length === 0);

/** Lọc trên trình duyệt: trong cùng một tiêu chí là "hoặc", giữa các tiêu chí là "và". */
export function applyFilter(issues: Issue[], f: IssueFilterState): Issue[] {
  return issues.filter(
    (i) =>
      (!f.status.length || f.status.includes(i.status)) &&
      (!f.priority.length || f.priority.includes(i.priority)) &&
      (!f.project.length || f.project.includes(i.projectId)) &&
      (!f.assignee.length || f.assignee.includes(i.assigneeId ?? UNASSIGNED)),
  );
}
