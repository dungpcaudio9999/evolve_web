import { STATUS_IDS } from '@evolve/shared';
import { beforeEach, describe, expect, it } from 'vitest';
import { SAMPLE_ISSUES } from '@/lib/sample-data';
import { groupByStatus, useIssuesStore } from './issues-store';

const initial = useIssuesStore.getState();
const store = () => useIssuesStore.getState();
const byId = (id: string) => store().issues.find((i) => i.id === id)!;
const column = (status: (typeof STATUS_IDS)[number]) => groupByStatus(store().issues)[status];

beforeEach(() => useIssuesStore.setState(initial, true));

describe('issues-store', () => {
  it('khởi tạo với dữ liệu mẫu', () => {
    expect(store().issues).toHaveLength(SAMPLE_ISSUES.length);
  });

  it('addIssue áp giá trị mặc định, sinh identifier tiếp theo và đặt cuối cột', () => {
    const issue = store().addIssue({ title: '  Việc mới ', projectId: 'p-evo' });
    expect(issue).toMatchObject({
      title: 'Việc mới',
      status: 'BACKLOG',
      priority: 'NO_PRIORITY',
      identifier: `EVO-${SAMPLE_ISSUES.length + 1}`,
      assigneeId: null,
      labels: [],
    });
    expect(column('BACKLOG').at(-1)?.id).toBe(issue.id);
  });

  it('addIssue từ chối tiêu đề rỗng và project không tồn tại', () => {
    expect(() => store().addIssue({ title: ' ', projectId: 'p-evo' })).toThrow();
    expect(() => store().addIssue({ title: 'x', projectId: 'p-none' })).toThrow(/project/);
  });

  it('updateIssue chỉ sửa trường được truyền, gắn label theo id', () => {
    store().updateIssue('i-evo-1', { title: 'Tiêu đề mới', labelIds: ['l-bug'] });
    const i = byId('i-evo-1');
    expect(i.title).toBe('Tiêu đề mới');
    expect(i.status).toBe('DONE');
    expect(i.labels.map((l) => l.name)).toEqual(['Bug']);
  });

  it('setStatus chuyển issue xuống cuối cột mới', () => {
    store().setStatus('i-evo-7', 'TODO');
    expect(byId('i-evo-7').status).toBe('TODO');
    expect(column('TODO').at(-1)?.id).toBe('i-evo-7');
  });

  it('moveIssue đặt issue đúng giữa hai issue lân cận', () => {
    const [first, second] = column('TODO');
    store().moveIssue('i-evo-7', { status: 'TODO', afterId: first.id, beforeId: second.id });
    expect(
      column('TODO')
        .map((i) => i.id)
        .slice(0, 3),
    ).toEqual([first.id, 'i-evo-7', second.id]);
  });

  it('moveIssue lên đầu cột khi chỉ có beforeId', () => {
    const [first] = column('DONE');
    store().moveIssue('i-evo-7', { status: 'DONE', beforeId: first.id });
    expect(column('DONE')[0].id).toBe('i-evo-7');
  });

  it('deleteIssue xóa issue', () => {
    store().deleteIssue('i-evo-1');
    expect(store().issues.find((i) => i.id === 'i-evo-1')).toBeUndefined();
  });

  it('groupByStatus luôn đủ 5 nhóm, mỗi nhóm sắp theo rank', () => {
    const groups = groupByStatus(store().issues);
    expect(Object.keys(groups)).toEqual([...STATUS_IDS]);
    for (const s of STATUS_IDS) {
      const ranks = groups[s].map((i) => i.rank);
      expect(ranks).toEqual([...ranks].sort());
    }
  });
});
