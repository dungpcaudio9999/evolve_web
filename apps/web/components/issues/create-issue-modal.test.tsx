// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useIssuesStore } from '@/store/issues-store';
import { useUiStore } from '@/store/ui-store';
import { CreateIssueModal } from './create-issue-modal';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
const { toast } = await import('sonner');

const initialIssues = useIssuesStore.getState();

beforeEach(() => {
  useIssuesStore.setState(initialIssues, true);
  useUiStore.setState({ createIssueOpen: false });
  vi.mocked(toast.success).mockClear();
});

describe('CreateIssueModal', () => {
  it('phím C mở modal', async () => {
    render(<CreateIssueModal />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.keyboard('c');
    expect(screen.getByRole('dialog', { name: 'Tạo issue' })).toBeInTheDocument();
  });

  it('tiêu đề trống → báo lỗi, không tạo issue', async () => {
    useUiStore.setState({ createIssueOpen: true });
    render(<CreateIssueModal />);
    const before = useIssuesStore.getState().issues.length;

    await userEvent.click(screen.getByRole('button', { name: 'Tạo issue' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Vui lòng nhập tiêu đề');
    expect(useIssuesStore.getState().issues).toHaveLength(before);
  });

  it('nhập tiêu đề, đổi độ ưu tiên rồi tạo → issue mới trong store, toast, modal đóng', async () => {
    useUiStore.setState({ createIssueOpen: true });
    render(<CreateIssueModal />);

    await userEvent.type(screen.getByLabelText('Tiêu đề'), 'Viết test cho modal');
    await userEvent.click(screen.getByRole('button', { name: 'Độ ưu tiên: No priority' }));
    await userEvent.click(screen.getByRole('option', { name: 'High' }));
    await userEvent.click(screen.getByRole('button', { name: 'Tạo issue' }));

    const created = useIssuesStore.getState().issues.at(-1);
    expect(created).toMatchObject({
      title: 'Viết test cho modal',
      priority: 'HIGH',
      status: 'BACKLOG',
      projectId: 'p-evo',
      description: null,
    });
    expect(toast.success).toHaveBeenCalledWith(`Đã tạo ${created?.identifier}`, expect.anything());
    expect(useUiStore.getState().createIssueOpen).toBe(false);
  });
});
