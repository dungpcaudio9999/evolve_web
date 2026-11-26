import { create } from 'zustand';

/** Trạng thái giao diện dùng chung (không phải dữ liệu): modal đang mở… */
interface UiState {
  createIssueOpen: boolean;
  /** Project chọn sẵn trong modal tạo issue (vd. đang ở trang của project đó). */
  createIssueProjectId: string | null;
  openCreateIssue: (projectId?: string) => void;
  closeCreateIssue: () => void;
  setCreateIssueOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  createIssueOpen: false,
  createIssueProjectId: null,
  openCreateIssue: (projectId) =>
    set({ createIssueOpen: true, createIssueProjectId: projectId ?? null }),
  closeCreateIssue: () => set({ createIssueOpen: false }),
  setCreateIssueOpen: (open) => set({ createIssueOpen: open }),
}));
