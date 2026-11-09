import { create } from 'zustand';

/** Trạng thái giao diện dùng chung (không phải dữ liệu): modal đang mở… */
interface UiState {
  createIssueOpen: boolean;
  openCreateIssue: () => void;
  closeCreateIssue: () => void;
  setCreateIssueOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  createIssueOpen: false,
  openCreateIssue: () => set({ createIssueOpen: true }),
  closeCreateIssue: () => set({ createIssueOpen: false }),
  setCreateIssueOpen: (open) => set({ createIssueOpen: open }),
}));
