// @vitest-environment jsdom
import type { User } from '@evolve/shared';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AssigneeSelector } from './assignee-selector';
import { PrioritySelector } from './priority-selector';
import { StatusSelector } from './status-selector';

const users: User[] = [
  { id: 'u-an', name: 'Nguyễn Văn An', email: 'an@evolve.dev', avatarUrl: null, createdAt: '' },
  { id: 'u-chi', name: 'Lê Minh Chi', email: 'chi@evolve.dev', avatarUrl: null, createdAt: '' },
];

describe('StatusSelector', () => {
  it('mở popover, liệt kê 5 trạng thái, chọn thì gọi onChange và đóng', async () => {
    const onChange = vi.fn();
    render(<StatusSelector value="TODO" onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Trạng thái: Todo' }));
    const options = screen.getAllByRole('option');
    expect(options.map((o) => o.textContent)).toEqual([
      'Backlog',
      'Todo',
      'In Progress',
      'Done',
      'Canceled',
    ]);

    await userEvent.click(screen.getByRole('option', { name: /Done/ }));
    expect(onChange).toHaveBeenCalledWith('DONE');
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
  });

  it('chọn lại giá trị hiện tại thì không gọi onChange', async () => {
    const onChange = vi.fn();
    render(<StatusSelector value="TODO" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /Trạng thái/ }));
    await userEvent.click(screen.getByRole('option', { name: /Todo/ }));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('PrioritySelector', () => {
  it('gõ để lọc rồi chọn bằng bàn phím', async () => {
    const onChange = vi.fn();
    render(<PrioritySelector value="NO_PRIORITY" onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Độ ưu tiên: No priority' }));
    await userEvent.type(screen.getByPlaceholderText('Đổi độ ưu tiên…'), 'urg');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Urgent']);

    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('URGENT');
  });
});

describe('AssigneeSelector', () => {
  it('có lựa chọn "Chưa giao", tìm được tên tiếng Việt', async () => {
    const onChange = vi.fn();
    render(<AssigneeSelector value="u-an" users={users} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Người được giao: Nguyễn Văn An' }));
    // Avatar là trang trí (aria-hidden): tên truy cập của lựa chọn chỉ còn chữ.
    for (const name of ['Chưa giao', 'Nguyễn Văn An', 'Lê Minh Chi']) {
      expect(screen.getByRole('option', { name })).toBeInTheDocument();
    }
    expect(screen.getAllByRole('option')).toHaveLength(3);

    await userEvent.type(screen.getByPlaceholderText('Giao cho…'), 'chi');
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('u-chi');
  });

  it('chọn "Chưa giao" trả về null', async () => {
    const onChange = vi.fn();
    render(<AssigneeSelector value="u-an" users={users} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /Người được giao/ }));
    await userEvent.click(screen.getByRole('option', { name: /Chưa giao/ }));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
