import {
  STATUS_IDS,
  createIssueSchema,
  moveIssueSchema,
  updateIssueSchema,
  type CreateIssueInput,
  type Issue,
  type IssueFilter,
  type Label,
  type MoveIssueInput,
  type Status,
  type UpdateIssueInput,
  type User,
} from '@evolve/shared';
import { create } from 'zustand';
import { api } from '@/lib/api-client';
import { compareRank, rankBetween } from '@/lib/rank';
import type { LoadStatus } from './projects-store';

/**
 * Store issue, gọi REST API qua `lib/api-client` (W4-C1). Tên và tham số các hàm giữ như W2–W3.
 * - Sửa/xóa: cập nhật giao diện ngay, gọi API sau; API lỗi thì hoàn tác (api-client đã hiện toast).
 * - Thêm: chờ API vì `identifier` và `rank` do server sinh.
 * Input được validate bằng zod schema của @evolve/shared trước khi gửi (giống API).
 */
export interface IssuesState {
  issues: Issue[];
  /** Dữ liệu tham chiếu để hiển thị và chọn (người được giao, nhãn). */
  users: User[];
  labels: Label[];
  status: LoadStatus;

  /** Tải danh sách issue (GET /issues), có thể lọc theo project… */
  fetchIssues: (filter?: IssueFilter) => Promise<void>;
  /** Tải users và labels (GET /users, /labels). Gọi một lần, gọi lại nếu cần làm mới. */
  fetchMeta: () => Promise<void>;
  /** Tải một issue (trang chi tiết) và cập nhật vào danh sách. Không thấy → null. */
  fetchIssue: (id: string) => Promise<Issue | null>;
  /** Tạo issue, trả về issue do API tạo. Ném lỗi nếu input sai hoặc API lỗi. */
  addIssue: (input: CreateIssueInput) => Promise<Issue>;
  updateIssue: (id: string, patch: UpdateIssueInput) => Promise<void>;
  deleteIssue: (id: string) => Promise<void>;
  setStatus: (id: string, status: Status) => Promise<void>;
  /** Kéo thả (chỉ cập nhật trên trình duyệt; API /move ở W5). */
  moveIssue: (id: string, input: MoveIssueInput) => void;
  /** Xóa dữ liệu khi đăng xuất. */
  reset: () => void;
}

const EMPTY = {
  issues: [] as Issue[],
  users: [] as User[],
  labels: [] as Label[],
  status: 'idle' as LoadStatus,
};

/** Thay (hoặc thêm) một issue trong danh sách. */
const upsert = (issues: Issue[], issue: Issue) =>
  issues.some((i) => i.id === issue.id)
    ? issues.map((i) => (i.id === issue.id ? issue : i))
    : [...issues, issue];

export const useIssuesStore = create<IssuesState>()((set, get) => ({
  ...EMPTY,

  fetchIssues: async (filter) => {
    set({ status: 'loading' });
    try {
      const issues = await api.get<Issue[]>('/issues', { query: { ...filter } });
      set({ issues, status: 'ready' });
    } catch {
      set({ status: 'error' });
    }
  },

  fetchMeta: async () => {
    const [users, labels] = await Promise.all([
      api.get<User[]>('/users'),
      api.get<Label[]>('/labels'),
    ]);
    set({ users, labels });
  },

  fetchIssue: async (id) => {
    try {
      const issue = await api.get<Issue>(`/issues/${id}`, { toastOnError: false });
      set({ issues: upsert(get().issues, issue) });
      return issue;
    } catch {
      return null;
    }
  },

  addIssue: async (input) => {
    const data = createIssueSchema.parse(input);
    const issue = await api.post<Issue>('/issues', data);
    set({ issues: upsert(get().issues, issue) });
    return issue;
  },

  updateIssue: async (id, patch) => {
    const data = updateIssueSchema.parse(patch);
    const before = get().issues.find((i) => i.id === id);
    if (!before) return;

    // Cập nhật tạm ngay để giao diện phản hồi tức thì.
    const { labelIds, ...fields } = data;
    const optimistic: Issue = {
      ...before,
      ...Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined)),
      ...(labelIds && { labels: get().labels.filter((l) => labelIds.includes(l.id)) }),
    };
    set({ issues: upsert(get().issues, optimistic) });

    try {
      const saved = await api.patch<Issue>(`/issues/${id}`, data);
      set({ issues: upsert(get().issues, saved) });
    } catch {
      set({ issues: upsert(get().issues, before) });
    }
  },

  deleteIssue: async (id) => {
    const before = get().issues;
    set({ issues: before.filter((i) => i.id !== id) });
    try {
      await api.delete(`/issues/${id}`);
    } catch {
      set({ issues: before });
    }
  },

  setStatus: (id, status) => get().updateIssue(id, { status }),

  moveIssue: (id, input) => {
    const { status, afterId, beforeId } = moveIssueSchema.parse(input);
    set(({ issues }) => {
      const rankOf = (otherId: string | null | undefined) =>
        (otherId && issues.find((i) => i.id === otherId)?.rank) || null;
      const after = rankOf(afterId);
      const before = rankOf(beforeId);
      const lastInColumn = issues
        .filter((i) => i.status === status && i.id !== id)
        .sort(compareRank)
        .at(-1)?.rank;
      const rank =
        after || before ? rankBetween(after, before) : rankBetween(lastInColumn ?? null, null);
      return { issues: issues.map((i) => (i.id === id ? { ...i, status, rank } : i)) };
    });
  },

  reset: () => set(EMPTY),
}));

/** Nhóm issue theo trạng thái, mỗi nhóm sắp theo rank. Luôn có đủ 5 key. */
export function groupByStatus(issues: Issue[]): Record<Status, Issue[]> {
  const groups = Object.fromEntries(STATUS_IDS.map((s) => [s, [] as Issue[]])) as Record<
    Status,
    Issue[]
  >;
  for (const issue of issues) groups[issue.status].push(issue);
  for (const s of STATUS_IDS) groups[s].sort(compareRank);
  return groups;
}
