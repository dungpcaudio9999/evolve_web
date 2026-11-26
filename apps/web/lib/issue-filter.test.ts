import { describe, expect, it } from 'vitest';
import { SAMPLE_ISSUES } from '@/lib/sample-data';
import { EMPTY_FILTER, applyFilter, parseFilter, parseView, toSearch } from './issue-filter';

describe('issue-filter', () => {
  it('đọc URL, bỏ giá trị không hợp lệ', () => {
    const p = new URLSearchParams('status=TODO,SAI,DONE&priority=HIGH&assignee=none&view=board');
    expect(parseFilter(p)).toEqual({
      status: ['TODO', 'DONE'],
      priority: ['HIGH'],
      assignee: ['none'],
      project: [],
    });
    expect(parseView(p)).toBe('board');
    expect(parseView(new URLSearchParams())).toBe('list');
  });

  it('ghi URL: bỏ khóa rỗng, giữ tham số khác; đọc lại ra như cũ', () => {
    const f = { ...EMPTY_FILTER, status: ['TODO' as const], project: ['p1', 'p2'] };
    const s = toSearch(new URLSearchParams('x=1&priority=LOW'), f, 'board');
    const back = new URLSearchParams(s);
    expect(back.get('x')).toBe('1');
    expect(back.get('priority')).toBeNull();
    expect(parseFilter(back)).toEqual(f);
    expect(toSearch(new URLSearchParams(), EMPTY_FILTER, 'list')).toBe('');
  });

  it('lọc: "hoặc" trong một tiêu chí, "và" giữa các tiêu chí; none = chưa giao', () => {
    expect(applyFilter(SAMPLE_ISSUES, EMPTY_FILTER)).toHaveLength(SAMPLE_ISSUES.length);
    const r = applyFilter(SAMPLE_ISSUES, { ...EMPTY_FILTER, status: ['TODO', 'DONE'] });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((i) => i.status === 'TODO' || i.status === 'DONE')).toBe(true);
    const un = applyFilter(SAMPLE_ISSUES, { ...EMPTY_FILTER, assignee: ['none'] });
    expect(un.every((i) => i.assigneeId === null)).toBe(true);
    const both = applyFilter(SAMPLE_ISSUES, {
      ...EMPTY_FILTER,
      status: ['TODO'],
      priority: ['URGENT'],
    });
    expect(both.every((i) => i.status === 'TODO' && i.priority === 'URGENT')).toBe(true);
  });
});
