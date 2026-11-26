import type { Issue } from '@evolve/shared';
import { describe, expect, it } from 'vitest';
import { dropTarget } from './board-drop';

const col = (...ids: string[]) => ids.map((id) => ({ id }) as Issue);

describe('dropTarget', () => {
  it('cột khác: đặt giữa hai issue, đầu cột, cuối cột, cột rỗng', () => {
    const c = col('a', 'b', 'c');
    expect(dropTarget(c, 'x', 'TODO', 1)).toEqual({ status: 'TODO', afterId: 'a', beforeId: 'b' });
    expect(dropTarget(c, 'x', 'TODO', 0)).toEqual({ status: 'TODO', afterId: null, beforeId: 'a' });
    expect(dropTarget(c, 'x', 'TODO', 3)).toEqual({ status: 'TODO', afterId: 'c', beforeId: null });
    expect(dropTarget([], 'x', 'DONE', 0)).toEqual({
      status: 'DONE',
      afterId: null,
      beforeId: null,
    });
  });

  it('cùng cột: bỏ qua chính nó; thả tại chỗ cũ → null', () => {
    const c = col('a', 'b', 'c', 'd');
    expect(dropTarget(c, 'b', 'TODO', 1)).toBeNull();
    expect(dropTarget(c, 'b', 'TODO', 2)).toBeNull();
    // b xuống giữa c và d
    expect(dropTarget(c, 'b', 'TODO', 3)).toEqual({ status: 'TODO', afterId: 'c', beforeId: 'd' });
    // d lên đầu
    expect(dropTarget(c, 'd', 'TODO', 0)).toEqual({ status: 'TODO', afterId: null, beforeId: 'a' });
    // a xuống cuối
    expect(dropTarget(c, 'a', 'TODO', 4)).toEqual({ status: 'TODO', afterId: 'd', beforeId: null });
  });
});
