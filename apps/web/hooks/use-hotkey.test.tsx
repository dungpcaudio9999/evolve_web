// @vitest-environment jsdom
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useHotkey } from './use-hotkey';

function Harness({ onHit }: { onHit: () => void }) {
  useHotkey('c', onHit);
  return (
    <div>
      <input aria-label="ô nhập" />
      <div contentEditable aria-label="soạn thảo" suppressContentEditableWarning />
    </div>
  );
}

describe('useHotkey', () => {
  it('nhấn C (thường hoặc hoa) thì gọi handler', async () => {
    const onHit = vi.fn();
    render(<Harness onHit={onHit} />);
    await userEvent.keyboard('c');
    await userEvent.keyboard('C');
    expect(onHit).toHaveBeenCalledTimes(2);
  });

  it('bỏ qua khi đang gõ trong ô nhập hoặc vùng soạn thảo', async () => {
    const onHit = vi.fn();
    const { getByLabelText } = render(<Harness onHit={onHit} />);
    await userEvent.type(getByLabelText('ô nhập'), 'c');
    expect(onHit).not.toHaveBeenCalled();
  });

  it('bỏ qua khi kèm Ctrl/Meta (vd. Ctrl+C để copy)', async () => {
    const onHit = vi.fn();
    render(<Harness onHit={onHit} />);
    await userEvent.keyboard('{Control>}c{/Control}');
    await userEvent.keyboard('{Meta>}c{/Meta}');
    expect(onHit).not.toHaveBeenCalled();
  });
});
