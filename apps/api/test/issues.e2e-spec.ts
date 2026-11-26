import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { AuthResponse, Issue, Project, User } from '@evolve/shared';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import type { ApiErrorBody } from './../src/common/filters/all-exceptions.filter';
import { PrismaService } from './../src/prisma/prisma.service';

const describeDb = process.env.DATABASE_URL ? describe : describe.skip;

describeDb('Issues (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let owner: AuthResponse;
  let other: AuthResponse;
  let project: Project;
  let labelId: string;
  const stamp = Date.now();

  const http = () => request(app.getHttpServer());
  const as = (a: AuthResponse) => ({ Authorization: `Bearer ${a.accessToken}` });

  async function signUp(name: string): Promise<AuthResponse> {
    const res = await http()
      .post('/auth/register')
      .send({ name, email: `iss-${name}-${stamp}@evolve.test`, password: 'password123' })
      .expect(201);
    return res.body as AuthResponse;
  }
  const createIssue = async (body: Record<string, unknown>) =>
    (
      await http()
        .post('/issues')
        .set(as(owner))
        .send({ projectId: project.id, ...body })
        .expect(201)
    ).body as Issue;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
    owner = await signUp('owner');
    other = await signUp('other');
    project = (
      await http()
        .post('/projects')
        .set(as(owner))
        .send({ name: 'Issues E2E', key: 'ISE' })
        .expect(201)
    ).body as Project;
    labelId = (
      await prisma.label.create({ data: { name: `e2e-label-${stamp}`, color: '#E8B07C' } })
    ).id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { startsWith: 'iss-' } } }); // xóa luôn project, issue
    await prisma.label.deleteMany({ where: { id: labelId } });
    await app.close();
  });

  it('không có token → 401', async () => {
    await http().get('/issues').expect(401);
  });

  it('tạo issue: mặc định BACKLOG/NO_PRIORITY, identifier tăng dần, rank tăng dần', async () => {
    const a = await createIssue({ title: 'Việc thứ nhất' });
    const b = await createIssue({
      title: 'Việc thứ hai',
      labelIds: [labelId],
      assigneeId: owner.user.id,
    });
    expect(a).toMatchObject({
      identifier: 'ISE-1',
      status: 'BACKLOG',
      priority: 'NO_PRIORITY',
      labels: [],
    });
    expect(a).not.toHaveProperty('number');
    expect(b.identifier).toBe('ISE-2');
    expect(b.rank > a.rank).toBe(true);
    expect(b.labels.map((l) => l.id)).toEqual([labelId]);
    expect(b.assigneeId).toBe(owner.user.id);
  });

  it('dữ liệu sai → 400; project của người khác → 404; assignee không tồn tại → 400', async () => {
    const bad = await http()
      .post('/issues')
      .set(as(owner))
      .send({ title: '', projectId: '' })
      .expect(400);
    expect(Object.keys((bad.body as ApiErrorBody).errors ?? {}).sort()).toEqual([
      'projectId',
      'title',
    ]);
    await http()
      .post('/issues')
      .set(as(other))
      .send({ title: 'x', projectId: project.id })
      .expect(404);
    const res = await http()
      .post('/issues')
      .set(as(owner))
      .send({ title: 'x', projectId: project.id, assigneeId: 'khong-ton-tai' })
      .expect(400);
    expect((res.body as ApiErrorBody).message).toBe('Người được giao không tồn tại');
  });

  it('lọc theo status, priority, q (không phân biệt hoa thường, cả identifier)', async () => {
    await createIssue({ title: 'Sửa lỗi đăng nhập', status: 'TODO', priority: 'URGENT' });
    const list = async (query: Record<string, string>) =>
      ((await http().get('/issues').query(query).set(as(owner)).expect(200)).body as Issue[]).map(
        (i) => i.title,
      );
    expect(await list({ projectId: project.id, status: 'TODO' })).toEqual(['Sửa lỗi đăng nhập']);
    expect(await list({ projectId: project.id, priority: 'URGENT' })).toEqual([
      'Sửa lỗi đăng nhập',
    ]);
    expect(await list({ q: 'ĐĂNG NHẬP' })).toEqual(['Sửa lỗi đăng nhập']);
    expect(await list({ q: 'ise-2' })).toEqual(['Việc thứ hai']);
    await http().get('/issues').query({ status: 'SAI' }).set(as(owner)).expect(400);
  });

  it('người khác không thấy issue: danh sách rỗng, chi tiết/sửa/xóa → 404', async () => {
    const [first] = (await http().get('/issues').set(as(owner)).expect(200)).body as Issue[];
    expect((await http().get('/issues').set(as(other)).expect(200)).body).toEqual([]);
    await http().get(`/issues/${first.id}`).set(as(other)).expect(404);
    await http().patch(`/issues/${first.id}`).set(as(other)).send({ title: 'X' }).expect(404);
    await http().delete(`/issues/${first.id}`).set(as(other)).expect(404);
  });

  it('PATCH: đổi status → cuối cột mới; labelIds thay toàn bộ; projectId bị bỏ qua', async () => {
    const issue = await createIssue({ title: 'Sẽ chuyển cột', labelIds: [labelId] });
    const todo = (
      await http().get('/issues').query({ projectId: project.id, status: 'TODO' }).set(as(owner))
    ).body as Issue[];
    const res = await http()
      .patch(`/issues/${issue.id}`)
      .set(as(owner))
      .send({ status: 'TODO', labelIds: [], projectId: 'khac', title: 'Đã chuyển cột' })
      .expect(200);
    const updated = res.body as Issue;
    expect(updated).toMatchObject({
      status: 'TODO',
      title: 'Đã chuyển cột',
      labels: [],
      projectId: project.id,
    });
    expect(todo.every((i) => updated.rank > i.rank)).toBe(true);
  });

  it('bỏ người được giao bằng assigneeId: null', async () => {
    const issue = await createIssue({ title: 'Có người làm', assigneeId: owner.user.id });
    const res = await http()
      .patch(`/issues/${issue.id}`)
      .set(as(owner))
      .send({ assigneeId: null })
      .expect(200);
    expect((res.body as Issue).assigneeId).toBeNull();
  });

  it('xóa → 204, sau đó 404; identifier không bị dùng lại', async () => {
    const issue = await createIssue({ title: 'Sẽ xóa' });
    await http().delete(`/issues/${issue.id}`).set(as(owner)).expect(204);
    await http().get(`/issues/${issue.id}`).set(as(owner)).expect(404);
    const next = await createIssue({ title: 'Sau khi xóa' });
    expect(Number(next.identifier.split('-')[1])).toBe(Number(issue.identifier.split('-')[1]) + 1);
  });

  it('tạo 5 issue cùng lúc → identifier không trùng, liên tiếp', async () => {
    const created = await Promise.all(
      Array.from({ length: 5 }, (_, i) => createIssue({ title: `Song song ${i}` })),
    );
    const numbers = created.map((i) => Number(i.identifier.split('-')[1])).sort((a, b) => a - b);
    expect(new Set(numbers).size).toBe(5);
    expect(numbers[4] - numbers[0]).toBe(4);
  });

  it('GET /users dùng được để chọn người được giao', async () => {
    const users = (await http().get('/users').set(as(owner)).expect(200)).body as User[];
    expect(users.some((u) => u.id === other.user.id)).toBe(true);
  });
});
