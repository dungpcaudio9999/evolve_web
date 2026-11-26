// @vitest-environment jsdom
import type { Project } from '@evolve/shared';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api-client';
import { useProjectsStore } from '@/store/projects-store';
import { ProjectFormModal } from './project-form-modal';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const saved: Project = {
  id: 'p1',
  name: 'Evolve Web',
  key: 'EVO',
  icon: null,
  color: '#3E6C76',
  ownerId: 'u1',
  createdAt: '2026-11-10',
  updatedAt: '2026-11-10',
};
const addProject = vi.fn();
const updateProject = vi.fn();

beforeEach(() => {
  addProject.mockReset();
  updateProject.mockReset();
  useProjectsStore.setState({ addProject, updateProject });
});

describe('ProjectFormModal', () => {
  it('tạo project: key tự viết hoa, chọn màu, icon trống → null', async () => {
    addProject.mockResolvedValue(saved);
    const onSaved = vi.fn();
    const onOpenChange = vi.fn();
    render(<ProjectFormModal open onOpenChange={onOpenChange} onSaved={onSaved} />);

    await userEvent.type(screen.getByLabelText('Tên project'), 'Evolve Web');
    await userEvent.type(screen.getByLabelText('Key'), 'evo');
    await userEvent.click(screen.getByRole('radio', { name: 'Teal' }));
    await userEvent.click(screen.getByRole('button', { name: 'Tạo project' }));

    await waitFor(() =>
      expect(addProject).toHaveBeenCalledWith({
        name: 'Evolve Web',
        key: 'EVO',
        icon: null,
        color: '#3E6C76',
      }),
    );
    expect(onSaved).toHaveBeenCalledWith(saved);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('key trùng (409) → lỗi hiện tại ô key, modal vẫn mở', async () => {
    addProject.mockRejectedValue(new ApiError(409, 'Key đã được dùng cho project khác của bạn'));
    const onOpenChange = vi.fn();
    render(<ProjectFormModal open onOpenChange={onOpenChange} />);

    await userEvent.type(screen.getByLabelText('Tên project'), 'X');
    await userEvent.type(screen.getByLabelText('Key'), 'EVO');
    await userEvent.click(screen.getByRole('button', { name: 'Tạo project' }));

    expect(
      await screen.findByText('Key đã được dùng cho project khác của bạn'),
    ).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it('sửa project: key bị khóa, chỉ gửi tên/màu/icon', async () => {
    updateProject.mockResolvedValue({ ...saved, name: 'Tên mới' });
    render(<ProjectFormModal open onOpenChange={vi.fn()} project={saved} />);

    expect(screen.getByLabelText('Key')).toBeDisabled();
    const name = screen.getByLabelText('Tên project');
    await userEvent.clear(name);
    await userEvent.type(name, 'Tên mới');
    await userEvent.click(screen.getByRole('button', { name: 'Lưu' }));

    await waitFor(() =>
      expect(updateProject).toHaveBeenCalledWith('p1', {
        name: 'Tên mới',
        color: '#3E6C76',
        icon: null,
      }),
    );
  });
});
