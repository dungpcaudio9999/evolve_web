import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { AuthResponse, Issue, Project } from '@evolve/shared';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

const describeDb = process.env.DATABASE_URL ? describe : describe.skip;

describeDb('PATCH /issues/:id/move (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let owner: AuthResponse;
  let other: AuthResponse;
  let project: Project;
  const stamp = Date.now();

  const http = () => request(app.getHttpServer());
  const as = (a: AuthResponse) => ({ Authorization: `Bearer ${a.accessToken}` });

  async function signUp(name: string): Promise<AuthResponse> {
    const res = await http()
      .post('/auth/register')
      .send({ name, email: `mov-${name}-${stamp}@evolve.test`, password: 'password123' })
      .expect(201);
    return res.body as AuthResponse;
  }
  const createIssue = async (title: string, status = 'TODO') =>
    (
      await http()
        .post('/issues')
        .set(as(owner))
        .send({ projectId: project.id, title, status })
        .expect(201)
    ).body as Issue;
  const column = async (status: string) =>
    (
      (await http().get('/issues').query({ projectId: project.id, status }).set(as(owner)))
        .body as Issue[]
    ).map((i) => i.title);
  const move = (id: string, body: Record<string, unknown>, who = owner) =>
    http().patch(`/issues/${id}/move`).set(as(who)).send(body);

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
        .send({ name: 'Move E2E', key: 'MOV' })
        .expect(201)
    ).body as Project;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { startsWith: 'mov-' } } });
    await app.close();
  });

  it('đặt giữa hai issue cùng cột; thứ tự giữ nguyên khi tải lại', async () => {
    const a = await createIssue('A');
    const b = await createIssue('B');
    const c = await createIssue('C');
    await move(c.id, { status: 'TODO', afterId: a.id, beforeId: b.id }).expect(200);
    expect(await column('TODO')).toEqual(['A', 'C', 'B']);
    await move(b.id, { status: 'TODO', beforeId: a.id }).expect(200); // lên đầu cột
    expect(await column('TODO')).toEqual(['B', 'A', 'C']);
  });

  it('sang cột khác: không có lân cận → cuối cột; có lân cận → đúng vị trí', async () => {
    const x = await createIssue('X', 'DONE');
    const y = await createIssue('Y', 'BACKLOG');
    const z = await createIssue('Z', 'BACKLOG');
    const res = await move(y.id, { status: 'DONE' }).expect(200);
    expect((res.body as Issue).status).toBe('DONE');
    expect(await column('DONE')).toEqual(['X', 'Y']);
    await move(z.id, { status: 'DONE', afterId: x.id, beforeId: y.id }).expect(200);
    expect(await column('DONE')).toEqual(['X', 'Z', 'Y']);
  });

  it('dữ liệu sai → 400', async () => {
    const p = await createIssue('P', 'IN_PROGRESS');
    const q = await createIssue('Q', 'IN_PROGRESS');
    const r = await createIssue('R', 'CANCELED');
    await move(p.id, { status: 'WRONG' }).expect(400);
    await move(p.id, { status: 'IN_PROGRESS', afterId: p.id }).expect(400); // cạnh chính nó
    await move(p.id, { status: 'IN_PROGRESS', afterId: r.id }).expect(400); // khác cột
    await move(r.id, { status: 'IN_PROGRESS', afterId: q.id, beforeId: p.id }).expect(400); // ngược
  });

  it('issue hoặc lân cận của người khác → 404', async () => {
    const mine = await createIssue('Của tôi');
    await move(mine.id, { status: 'DONE' }, other).expect(404);
    const otherProject = (
      await http().post('/projects').set(as(other)).send({ name: 'Khác', key: 'OTH' }).expect(201)
    ).body as Project;
    const theirs = (
      await http()
        .post('/issues')
        .set(as(other))
        .send({ projectId: otherProject.id, title: 'Của người khác', status: 'TODO' })
        .expect(201)
    ).body as Issue;
    await move(mine.id, { status: 'TODO', afterId: theirs.id }).expect(404);
  });
});
