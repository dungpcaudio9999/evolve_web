import type { Project } from '@evolve/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api-client', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/api-client')>();
  return { ...real, api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } };
});
const { api, ApiError } = await import('@/lib/api-client');
const { useProjectsStore } = await import('./projects-store');

const project = (id: string, createdAt: string): Project => ({
  id,
  name: id,
  key: id.toUpperCase(),
  icon: null,
  color: '#E8B07C',
  ownerId: 'u1',
  createdAt,
  updatedAt: createdAt,
});
const state = () => useProjectsStore.getState();

beforeEach(() => {
  state().reset();
  vi.mocked(api.get).mockReset();
  vi.mocked(api.post).mockReset();
  vi.mocked(api.patch).mockReset();
  vi.mocked(api.delete).mockReset();
});

describe('projects-store', () => {
  it('fetchProjects sắp theo ngày tạo và chuyển status sang ready', async () => {
    vi.mocked(api.get).mockResolvedValue([project('b', '2026-11-02'), project('a', '2026-11-01')]);
    const pending = state().fetchProjects();
    expect(state().status).toBe('loading');
    await pending;
    expect(state().status).toBe('ready');
    expect(state().projects.map((p) => p.id)).toEqual(['a', 'b']);
  });

  it('fetchProjects lỗi → status error', async () => {
    vi.mocked(api.get).mockRejectedValue(new ApiError(0, 'mất mạng'));
    await state().fetchProjects();
    expect(state().status).toBe('error');
  });

  it('addProject thêm project từ API (không tự toast để form hiện lỗi)', async () => {
    vi.mocked(api.post).mockResolvedValue(project('n', '2026-11-03'));
    await state().addProject({ name: 'n', key: 'NN' });
    expect(api.post).toHaveBeenCalledWith(
      '/projects',
      { name: 'n', key: 'NN' },
      { toastOnError: false },
    );
    expect(state().projects.map((p) => p.id)).toEqual(['n']);
  });

  it('updateProject thay bản cũ, deleteProject bỏ khỏi danh sách', async () => {
    useProjectsStore.setState({ projects: [project('a', '1'), project('b', '2')] });
    vi.mocked(api.patch).mockResolvedValue({ ...project('a', '1'), name: 'Mới' });
    await state().updateProject('a', { name: 'Mới' });
    expect(state().projects[0].name).toBe('Mới');

    vi.mocked(api.delete).mockResolvedValue(undefined);
    await state().deleteProject('a');
    expect(state().projects.map((p) => p.id)).toEqual(['b']);
  });

  it('fetchProject: thấy thì thêm/cập nhật vào danh sách; 404 → null', async () => {
    vi.mocked(api.get).mockResolvedValueOnce(project('x', '2026-11-05'));
    expect((await state().fetchProject('x'))?.id).toBe('x');
    expect(state().projects.map((p) => p.id)).toEqual(['x']);
    vi.mocked(api.get).mockRejectedValueOnce(new ApiError(404, 'Không tìm thấy project'));
    expect(await state().fetchProject('khong-co')).toBeNull();
  });

  it('reset xóa dữ liệu (dùng khi đăng xuất)', () => {
    useProjectsStore.setState({ projects: [project('a', '1')], status: 'ready' });
    state().reset();
    expect(state()).toMatchObject({ projects: [], status: 'idle' });
  });
});
