import type { CreateProjectInput, Project, UpdateProjectInput } from '@evolve/shared';
import { create } from 'zustand';
import { api } from '@/lib/api-client';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

interface ProjectsState {
  projects: Project[];
  status: LoadStatus;
  /** Tải danh sách project của người dùng hiện tại (GET /projects). */
  fetchProjects: () => Promise<void>;
  /** Ném ApiError (409 key trùng, 400 dữ liệu sai) để form hiển thị. */
  addProject: (input: CreateProjectInput) => Promise<Project>;
  updateProject: (id: string, patch: UpdateProjectInput) => Promise<Project>;
  /** Xóa project và toàn bộ issue của nó. */
  deleteProject: (id: string) => Promise<void>;
  /** Xóa dữ liệu khi đăng xuất. */
  reset: () => void;
}

const byCreatedAt = (a: Project, b: Project) => a.createdAt.localeCompare(b.createdAt);

export const useProjectsStore = create<ProjectsState>()((set, get) => ({
  projects: [],
  status: 'idle',

  fetchProjects: async () => {
    set({ status: 'loading' });
    try {
      const projects = await api.get<Project[]>('/projects');
      set({ projects: projects.sort(byCreatedAt), status: 'ready' });
    } catch {
      set({ status: 'error' });
    }
  },

  addProject: async (input) => {
    const project = await api.post<Project>('/projects', input, { toastOnError: false });
    set({ projects: [...get().projects, project].sort(byCreatedAt) });
    return project;
  },

  updateProject: async (id, patch) => {
    const project = await api.patch<Project>(`/projects/${id}`, patch, { toastOnError: false });
    set({ projects: get().projects.map((p) => (p.id === id ? project : p)) });
    return project;
  },

  deleteProject: async (id) => {
    await api.delete(`/projects/${id}`);
    set({ projects: get().projects.filter((p) => p.id !== id) });
  },

  reset: () => set({ projects: [], status: 'idle' }),
}));
