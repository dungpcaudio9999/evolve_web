// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EditableTitle } from './editable-title';

const setup = () => {
  const onSave = vi.fn();
  render(
    <>
      <EditableTitle value="Tiêu đề cũ" onSave={onSave} />
      <button>khác</button>
    </>,
  );
  return { onSave, input: screen.getByLabelText('Tiêu đề issue') };
};

describe('EditableTitle', () => {
  it('Enter lưu tiêu đề đã bỏ khoảng trắng', async () => {
    const { onSave, input } = setup();
    await userEvent.clear(input);
    await userEvent.type(input, '  Tiêu đề mới  {Enter}');
    expect(onSave).toHaveBeenCalledWith('Tiêu đề mới');
  });

  it('bấm ra ngoài cũng lưu', async () => {
    const { onSave, input } = setup();
    await userEvent.type(input, ' 2');
    await userEvent.click(screen.getByRole('button', { name: 'khác' }));
    expect(onSave).toHaveBeenCalledWith('Tiêu đề cũ 2');
  });

  it('Esc hủy: trả về tiêu đề cũ, không lưu', async () => {
    const { onSave, input } = setup();
    await userEvent.type(input, ' nháp{Escape}');
    await new Promise((r) => requestAnimationFrame(r));
    expect(input).toHaveValue('Tiêu đề cũ');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('xóa trống rồi rời ô: giữ tiêu đề cũ, không lưu', async () => {
    const { onSave, input } = setup();
    await userEvent.clear(input);
    await userEvent.click(screen.getByRole('button', { name: 'khác' }));
    expect(input).toHaveValue('Tiêu đề cũ');
    expect(onSave).not.toHaveBeenCalled();
  });
});
