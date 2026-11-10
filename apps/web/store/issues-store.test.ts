import { STATUS_IDS, type Issue } from '@evolve/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SAMPLE_ISSUES, SAMPLE_LABELS, SAMPLE_USERS } from '@/lib/sample-data';

vi.mock('@/lib/api-client', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/api-client')>();
  return { ...real, api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } };
});
const { api, ApiError } = await import('@/lib/api-client');
const { groupByStatus, useIssuesStore } = await import('./issues-store');

const store = () => useIssuesStore.getState();
const byId = (id: string) => store().issues.find((i) => i.id === id)!;
const column = (status: (typeof STATUS_IDS)[number]) => groupByStatus(store().issues)[status];

beforeEach(() => {
  store().reset();
  useIssuesStore.setState({
    issues: SAMPLE_ISSUES,
    users: SAMPLE_USERS,
    labels: SAMPLE_LABELS,
    status: 'ready',
  });
  for (const fn of [api.get, api.post, api.patch, api.delete]) vi.mocked(fn).mockReset();
});

describe('issues-store (API)', () => {
  it('fetchIssues gọi GET /issues kèm bộ lọc, đổi status loading → ready', async () => {
    store().reset();
    vi.mocked(api.get).mockResolvedValue(SAMPLE_ISSUES.slice(0, 2));
    const pending = store().fetchIssues({ projectId: 'p-evo' });
    expect(store().status).toBe('loading');
    await pending;
    expect(api.get).toHaveBeenCalledWith('/issues', { query: { projectId: 'p-evo' } });
    expect(store()).toMatchObject({ status: 'ready' });
    expect(store().issues).toHaveLength(2);
  });

  it('fetchIssues lỗi → status error', async () => {
    vi.mocked(api.get).mockRejectedValue(new ApiError(0, 'mất mạng'));
    await store().fetchIssues();
    expect(store().status).toBe('error');
  });

  it('fetchMeta tải users và labels', async () => {
    store().reset();
    vi.mocked(api.get).mockImplementation(
      (path: string) => Promise.resolve(path === '/users' ? SAMPLE_USERS : SAMPLE_LABELS) as never,
    );
    await store().fetchMeta();
    expect(store().users).toHaveLength(3);
    expect(store().labels).toHaveLength(5);
  });

  it('addIssue validate trước, gửi POST, thêm issue do API trả về (có identifier của server)', async () => {
    const fromApi: Issue = {
      ...SAMPLE_ISSUES[0],
      id: 'new',
      identifier: 'EVO-16',
      title: 'Việc mới',
    };
    vi.mocked(api.post).mockResolvedValue(fromApi);
    const created = await store().addIssue({ title: ' Việc mới ', projectId: 'p-evo' });

    expect(api.post).toHaveBeenCalledWith('/issues', {
      title: 'Việc mới',
      projectId: 'p-evo',
      status: 'BACKLOG',
      priority: 'NO_PRIORITY',
      labelIds: [],
    });
    expect(created.identifier).toBe('EVO-16');
    expect(byId('new')).toEqual(fromApi);
    await expect(store().addIssue({ title: ' ', projectId: 'p-evo' })).rejects.toThrow();
  });

  it('updateIssue cập nhật ngay, rồi thay bằng bản API trả về', async () => {
    let resolve!: (v: Issue) => void;
    vi.mocked(api.patch).mockReturnValue(new Promise((r) => (resolve = r)) as never);
    const pending = store().updateIssue('i-evo-1', { title: 'Tiêu đề mới', labelIds: ['l-bug'] });

    expect(byId('i-evo-1').title).toBe('Tiêu đề mới');
    expect(byId('i-evo-1').labels.map((l) => l.name)).toEqual(['Bug']);
    resolve({ ...byId('i-evo-1'), rank: '0|z' });
    await pending;
    expect(byId('i-evo-1').rank).toBe('0|z');
  });

  it('updateIssue lỗi → hoàn tác về giá trị cũ', async () => {
    const before = byId('i-evo-1');
    vi.mocked(api.patch).mockRejectedValue(new ApiError(500, 'Lỗi máy chủ'));
    await store().setStatus('i-evo-1', 'CANCELED');
    expect(byId('i-evo-1')).toEqual(before);
  });

  it('deleteIssue xóa ngay; API lỗi thì khôi phục', async () => {
    vi.mocked(api.delete).mockResolvedValue(undefined);
    await store().deleteIssue('i-evo-1');
    expect(store().issues.find((i) => i.id === 'i-evo-1')).toBeUndefined();
    expect(api.delete).toHaveBeenCalledWith('/issues/i-evo-1');

    vi.mocked(api.delete).mockRejectedValue(new ApiError(404, 'Không tìm thấy issue'));
    await store().deleteIssue('i-evo-2');
    expect(byId('i-evo-2')).toBeDefined();
  });

  it('fetchIssue: tìm thấy thì cập nhật vào danh sách; không thấy → null', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ ...SAMPLE_ISSUES[0], title: 'Từ API' });
    expect((await store().fetchIssue('i-evo-1'))?.title).toBe('Từ API');
    expect(byId('i-evo-1').title).toBe('Từ API');

    vi.mocked(api.get).mockRejectedValueOnce(new ApiError(404, 'Không tìm thấy issue'));
    expect(await store().fetchIssue('khong-co')).toBeNull();
  });

  it('moveIssue (chỉ trên trình duyệt) đặt issue giữa hai issue lân cận', () => {
    const [first, second] = column('TODO');
    store().moveIssue('i-evo-7', { status: 'TODO', afterId: first.id, beforeId: second.id });
    expect(
      column('TODO')
        .map((i) => i.id)
        .slice(0, 3),
    ).toEqual([first.id, 'i-evo-7', second.id]);
  });

  it('reset xóa hết (dùng khi đăng xuất)', () => {
    store().reset();
    expect(store()).toMatchObject({ issues: [], users: [], labels: [], status: 'idle' });
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
