// @vitest-environment jsdom
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SAMPLE_ISSUES, SAMPLE_PROJECTS } from '@/lib/sample-data';
import { useIssuesStore } from '@/store/issues-store';
import { useProjectsStore } from '@/store/projects-store';
import { ProjectDetail } from './project-detail';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const fetchProject = vi.fn();
const deleteProject = vi.fn();
const fetchIssues = vi.fn();

beforeEach(() => {
  for (const fn of [fetchProject, deleteProject, fetchIssues, push]) fn.mockReset();
  useProjectsStore.setState({ projects: SAMPLE_PROJECTS, fetchProject, deleteProject });
  useIssuesStore.setState({
    issues: SAMPLE_ISSUES,
    users: [{ id: 'u', name: 'U', email: 'u@x.dev', avatarUrl: null, createdAt: '' }],
    status: 'ready',
    fetchIssues,
    fetchMeta: vi.fn().mockResolvedValue(undefined),
  });
});

describe('ProjectDetail', () => {
  it('hiện tên, key, số issue; danh sách lọc theo project', async () => {
    fetchProject.mockResolvedValue(SAMPLE_PROJECTS[0]);
    render(<ProjectDetail projectId="p-evo" />);
    expect(await screen.findByRole('heading', { name: 'Evolve Web' })).toBeInTheDocument();
    expect(screen.getByText(/15 issue/)).toBeInTheDocument();
    expect(fetchIssues).toHaveBeenCalledWith({ projectId: 'p-evo' });
  });

  it('xóa project: cảnh báo xóa cả issue, xác nhận thì xóa và về /projects', async () => {
    fetchProject.mockResolvedValue(SAMPLE_PROJECTS[0]);
    deleteProject.mockResolvedValue(undefined);
    render(<ProjectDetail projectId="p-evo" />);
    await userEvent.click(await screen.findByRole('button', { name: 'Xóa' }));

    const dialog = await screen.findByRole('alertdialog', { name: 'Xóa project EVO?' });
    expect(dialog).toHaveTextContent('toàn bộ 15 issue');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Xóa project' }));
    await waitFor(() => expect(deleteProject).toHaveBeenCalledWith('p-evo'));
    expect(push).toHaveBeenCalledWith('/projects');
  });

  it('không tìm thấy → thông báo', async () => {
    useProjectsStore.setState({ projects: [] });
    fetchProject.mockResolvedValue(null);
    render(<ProjectDetail projectId="khong-co" />);
    expect(await screen.findByText(/Không tìm thấy project/)).toBeInTheDocument();
  });
});
