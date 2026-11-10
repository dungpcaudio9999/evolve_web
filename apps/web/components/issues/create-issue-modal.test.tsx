// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SAMPLE_ISSUES, SAMPLE_PROJECTS, SAMPLE_USERS } from '@/lib/sample-data';
import { useIssuesStore } from '@/store/issues-store';
import { useProjectsStore } from '@/store/projects-store';
import { useUiStore } from '@/store/ui-store';
import { CreateIssueModal } from './create-issue-modal';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
const { toast } = await import('sonner');

const addIssue = vi.fn();

beforeEach(() => {
  addIssue.mockReset();
  useIssuesStore.setState({ users: SAMPLE_USERS, addIssue });
  useProjectsStore.setState({ projects: SAMPLE_PROJECTS, status: 'ready' });
  useUiStore.setState({ createIssueOpen: false });
  vi.mocked(toast.success).mockClear();
});

describe('CreateIssueModal', () => {
  it('API lỗi → modal vẫn mở để sửa và gửi lại', async () => {
    addIssue.mockRejectedValue(new Error('Lỗi máy chủ'));
    useUiStore.setState({ createIssueOpen: true });
    render(<CreateIssueModal />);
    await userEvent.type(screen.getByLabelText('Tiêu đề'), 'Sẽ lỗi');
    await userEvent.click(screen.getByRole('button', { name: 'Tạo issue' }));
    await waitFor(() => expect(addIssue).toHaveBeenCalled());
    expect(useUiStore.getState().createIssueOpen).toBe(true);
    expect(screen.getByLabelText('Tiêu đề')).toHaveValue('Sẽ lỗi');
  });

  it('phím C mở modal', async () => {
    render(<CreateIssueModal />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.keyboard('c');
    expect(screen.getByRole('dialog', { name: 'Tạo issue' })).toBeInTheDocument();
  });

  it('tiêu đề trống → báo lỗi, không tạo issue', async () => {
    useUiStore.setState({ createIssueOpen: true });
    render(<CreateIssueModal />);
    await userEvent.click(screen.getByRole('button', { name: 'Tạo issue' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Vui lòng nhập tiêu đề');
    expect(addIssue).not.toHaveBeenCalled();
  });

  it('nhập tiêu đề, đổi độ ưu tiên rồi tạo → gọi addIssue, toast mã từ API, modal đóng', async () => {
    addIssue.mockResolvedValue({
      ...SAMPLE_ISSUES[0],
      identifier: 'EVO-16',
      title: 'Viết test cho modal',
    });
    useUiStore.setState({ createIssueOpen: true });
    render(<CreateIssueModal />);

    await userEvent.type(screen.getByLabelText('Tiêu đề'), 'Viết test cho modal');
    await userEvent.click(screen.getByRole('button', { name: 'Độ ưu tiên: No priority' }));
    await userEvent.click(screen.getByRole('option', { name: 'High' }));
    await userEvent.click(screen.getByRole('button', { name: 'Tạo issue' }));

    await waitFor(() =>
      expect(addIssue).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Viết test cho modal',
          priority: 'HIGH',
          status: 'BACKLOG',
          projectId: 'p-evo',
          description: null,
        }),
      ),
    );
    expect(toast.success).toHaveBeenCalledWith('Đã tạo EVO-16', expect.anything());
    expect(useUiStore.getState().createIssueOpen).toBe(false);
  });
});
