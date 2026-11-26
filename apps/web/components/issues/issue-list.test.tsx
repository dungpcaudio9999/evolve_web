// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SAMPLE_ISSUES, SAMPLE_LABELS, SAMPLE_USERS } from '@/lib/sample-data';
import { useIssuesStore } from '@/store/issues-store';
import { IssueList } from './issue-list';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

const deleteIssue = vi.fn();
const updateIssue = vi.fn();

beforeEach(() => {
  deleteIssue.mockReset();
  updateIssue.mockReset();
  useIssuesStore.setState({
    issues: SAMPLE_ISSUES,
    users: SAMPLE_USERS,
    labels: SAMPLE_LABELS,
    status: 'ready',
    fetchIssues: vi.fn().mockResolvedValue(undefined),
    fetchMeta: vi.fn().mockResolvedValue(undefined),
    deleteIssue,
    updateIssue,
  });
});

const rowOf = (identifier: string) => screen.getByText(identifier).closest('div')!;

describe('IssueList: menu chuột phải', () => {
  it('Xóa issue cần xác nhận; Hủy thì không xóa', async () => {
    render(<IssueList />);
    fireEvent.contextMenu(rowOf('EVO-1'));
    await userEvent.click(await screen.findByRole('menuitem', { name: /Xóa issue/ }));

    const dialog = await screen.findByRole('alertdialog', { name: 'Xóa EVO-1?' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Hủy' }));
    expect(deleteIssue).not.toHaveBeenCalled();

    fireEvent.contextMenu(rowOf('EVO-1'));
    await userEvent.click(await screen.findByRole('menuitem', { name: /Xóa issue/ }));
    await userEvent.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Xóa issue' }),
    );
    expect(deleteIssue).toHaveBeenCalledWith('i-evo-1');
  });

  it('đổi trạng thái qua menu con', async () => {
    render(<IssueList />);
    fireEvent.contextMenu(rowOf('EVO-4'));
    await userEvent.click(await screen.findByRole('menuitem', { name: /Trạng thái/ }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'In Progress' }));
    await waitFor(() =>
      expect(updateIssue).toHaveBeenCalledWith('i-evo-4', { status: 'IN_PROGRESS' }),
    );
  });
});
