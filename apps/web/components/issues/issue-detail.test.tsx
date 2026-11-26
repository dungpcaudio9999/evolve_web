// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SAMPLE_ISSUES, SAMPLE_LABELS, SAMPLE_PROJECTS, SAMPLE_USERS } from '@/lib/sample-data';
import { useIssuesStore } from '@/store/issues-store';
import { useProjectsStore } from '@/store/projects-store';
import { IssueDetail } from './issue-detail';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const updateIssue = vi.fn();
const deleteIssue = vi.fn();
const fetchIssue = vi.fn();

beforeEach(() => {
  for (const fn of [updateIssue, deleteIssue, fetchIssue, push]) fn.mockReset();
  deleteIssue.mockResolvedValue(undefined);
  useIssuesStore.setState({
    issues: SAMPLE_ISSUES,
    users: SAMPLE_USERS,
    labels: SAMPLE_LABELS,
    fetchIssue,
    fetchMeta: vi.fn().mockResolvedValue(undefined),
    updateIssue,
    deleteIssue,
  });
  useProjectsStore.setState({ projects: SAMPLE_PROJECTS, status: 'ready' });
});

describe('IssueDetail', () => {
  it('hiện tiêu đề, mô tả trống, thuộc tính và project; sửa trạng thái gọi updateIssue', async () => {
    fetchIssue.mockResolvedValue(SAMPLE_ISSUES[0]);
    render(<IssueDetail issueId="i-evo-1" />);

    expect(await screen.findByLabelText('Tiêu đề issue')).toHaveValue('Thiết kế trang đăng nhập');
    expect(screen.getByRole('link', { name: /Evolve Web/ })).toHaveAttribute(
      'href',
      '/projects/p-evo',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Trạng thái: Done' }));
    await userEvent.click(screen.getByRole('option', { name: 'Todo' }));
    expect(updateIssue).toHaveBeenCalledWith('i-evo-1', { status: 'TODO' });
  });

  it('mô tả lưu khi rời ô; không đổi thì không lưu', async () => {
    fetchIssue.mockResolvedValue(SAMPLE_ISSUES[0]);
    render(<IssueDetail issueId="i-evo-1" />);
    const desc = await screen.findByLabelText('Mô tả');

    await userEvent.click(desc);
    await userEvent.tab();
    expect(updateIssue).not.toHaveBeenCalled();

    await userEvent.type(desc, 'Mô tả mới');
    await userEvent.tab();
    expect(updateIssue).toHaveBeenCalledWith('i-evo-1', { description: 'Mô tả mới' });
  });

  it('không tìm thấy (404 hoặc của người khác) → thông báo', async () => {
    fetchIssue.mockResolvedValue(null);
    render(<IssueDetail issueId="khong-co" />);
    expect(await screen.findByText(/Không tìm thấy issue/)).toBeInTheDocument();
  });

  it('xóa có xác nhận rồi quay về /issues', async () => {
    fetchIssue.mockResolvedValue(SAMPLE_ISSUES[0]);
    render(<IssueDetail issueId="i-evo-1" />);
    await userEvent.click(await screen.findByRole('button', { name: 'Xóa issue' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Xóa issue' }));
    await waitFor(() => expect(deleteIssue).toHaveBeenCalledWith('i-evo-1'));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/issues'));
  });
});
