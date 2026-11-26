import type { Issue, Status } from '@evolve/shared';
import { create } from 'zustand';
import { ApiError, api } from '../lib/api-client';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

interface IssuesState {
  issues: Issue[];
  status: LoadStatus;
  error: string | null;
  /** GET /issues */
  fetchIssues: () => Promise<void>;
  /** Đổi trạng thái: cập nhật ngay, gọi PATCH /issues/:id; lỗi thì hoàn tác. */
  setStatus: (id: string, status: Status) => Promise<void>;
  reset: () => void;
}

const EMPTY = { issues: [] as Issue[], status: 'idle' as LoadStatus, error: null };

export const useIssuesStore = create<IssuesState>()((set, get) => ({
  ...EMPTY,

  fetchIssues: async () => {
    set({ status: 'loading', error: null });
    try {
      const issues = await api.get<Issue[]>('/issues');
      set({ issues, status: 'ready' });
    } catch (e) {
      set({ status: 'error', error: e instanceof ApiError ? e.message : 'Lỗi không xác định' });
    }
  },

  setStatus: async (id, status) => {
    const before = get().issues;
    set({ issues: before.map((i) => (i.id === id ? { ...i, status } : i)) });
    try {
      const updated = await api.patch<Issue>(`/issues/${id}`, { status });
      set({ issues: get().issues.map((i) => (i.id === id ? updated : i)) });
    } catch (e) {
      set({ issues: before, error: e instanceof ApiError ? e.message : 'Lỗi không xác định' });
    }
  },

  reset: () => set(EMPTY),
}));
