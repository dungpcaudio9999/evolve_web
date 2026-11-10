import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { AuthResponse, Issue, Project } from '@evolve/shared';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

const describeDb = process.env.DATABASE_URL ? describe : describe.skip;

/**
 * W4-A3: hai người dùng, mỗi người một project + issue. Không ai đọc/sửa/xóa được dữ liệu người kia,
 * và người kia không bị ảnh hưởng (dữ liệu vẫn nguyên sau mọi lần thử).
 */
describeDb('Cô lập dữ liệu giữa người dùng (e2e)', () => {
  let app: INestApplication<App>;
  const stamp = Date.now();
  const users: Record<'an' | 'binh', { auth: AuthResponse; project: Project; issue: Issue }> =
    {} as never;

  const http = () => request(app.getHttpServer());
  const as = (who: 'an' | 'binh') => ({ Authorization: `Bearer ${users[who].auth.accessToken}` });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    for (const who of ['an', 'binh'] as const) {
      const auth = (
        await http()
          .post('/auth/register')
          .send({ name: who, email: `iso-${who}-${stamp}@evolve.test`, password: 'password123' })
          .expect(201)
      ).body as AuthResponse;
      const headers = { Authorization: `Bearer ${auth.accessToken}` };
      const project = (
        await http().post('/projects').set(headers).send({ name: who, key: 'ISO' }).expect(201)
      ).body as Project;
      const issue = (
        await http()
          .post('/issues')
          .set(headers)
          .send({ title: `Việc của ${who}`, projectId: project.id })
          .expect(201)
      ).body as Issue;
      users[who] = { auth, project, issue };
    }
  });

  afterAll(async () => {
    await app.get(PrismaService).user.deleteMany({ where: { email: { startsWith: 'iso-' } } });
    await app.close();
  });

  it('cùng key ISO nhưng mỗi người có ISO-1 riêng', () => {
    expect(users.an.issue.identifier).toBe('ISO-1');
    expect(users.binh.issue.identifier).toBe('ISO-1');
    expect(users.an.issue.id).not.toBe(users.binh.issue.id);
  });

  it('danh sách chỉ có dữ liệu của mình', async () => {
    for (const [me, other] of [
      ['an', 'binh'],
      ['binh', 'an'],
    ] as const) {
      const projects = (await http().get('/projects').set(as(me)).expect(200)).body as Project[];
      const issues = (await http().get('/issues').set(as(me)).expect(200)).body as Issue[];
      expect(projects.map((p) => p.id)).toEqual([users[me].project.id]);
      expect(issues.map((i) => i.id)).toEqual([users[me].issue.id]);
      // Lọc theo project của người khác cũng không lộ gì.
      expect(
        (await http().get('/issues').query({ projectId: users[other].project.id }).set(as(me)))
          .body,
      ).toEqual([]);
    }
  });

  it('đọc/sửa/xóa dữ liệu người khác → 404; tạo issue vào project người khác → 404', async () => {
    const { project, issue } = users.binh;
    await http().get(`/projects/${project.id}`).set(as('an')).expect(404);
    await http().patch(`/projects/${project.id}`).set(as('an')).send({ name: 'X' }).expect(404);
    await http().delete(`/projects/${project.id}`).set(as('an')).expect(404);
    await http().get(`/issues/${issue.id}`).set(as('an')).expect(404);
    await http().patch(`/issues/${issue.id}`).set(as('an')).send({ title: 'X' }).expect(404);
    await http().delete(`/issues/${issue.id}`).set(as('an')).expect(404);
    await http()
      .post('/issues')
      .set(as('an'))
      .send({ title: 'X', projectId: project.id })
      .expect(404);
  });

  it('dữ liệu của người kia vẫn nguyên sau các lần thử', async () => {
    const issue = (await http().get(`/issues/${users.binh.issue.id}`).set(as('binh')).expect(200))
      .body as Issue;
    expect(issue.title).toBe('Việc của binh');
    const project = (
      await http().get(`/projects/${users.binh.project.id}`).set(as('binh')).expect(200)
    ).body as Project;
    expect(project.name).toBe('binh');
    expect(((await http().get('/issues').set(as('binh'))).body as Issue[]).length).toBe(1);
  });
});
