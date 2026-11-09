import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { AuthResponse, Project } from '@evolve/shared';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import type { ApiErrorBody } from './../src/common/filters/all-exceptions.filter';
import { PrismaService } from './../src/prisma/prisma.service';

/** Cần PostgreSQL thật (DATABASE_URL trong apps/api/.env hoặc biến môi trường của CI). */
const describeDb = process.env.DATABASE_URL ? describe : describe.skip;

describeDb('Projects (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let ownerToken: string;
  let otherToken: string;
  let project: Project;

  const http = () => request(app.getHttpServer());
  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

  async function signUp(name: string) {
    const res = await http()
      .post('/auth/register')
      .send({ name, email: `proj-${name}-${Date.now()}@evolve.test`, password: 'password123' })
      .expect(201);
    return (res.body as AuthResponse).accessToken;
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
    ownerToken = await signUp('owner');
    otherToken = await signUp('other');
  });

  afterAll(async () => {
    // Xóa user test → project của họ bị xóa theo (onDelete: Cascade).
    await prisma.user.deleteMany({ where: { email: { startsWith: 'proj-' } } });
    await app.close();
  });

  it('không có token → 401', async () => {
    await http().get('/projects').expect(401);
  });

  it('tạo project: key tự viết hoa, màu mặc định, không lộ issueCounter', async () => {
    const res = await http()
      .post('/projects')
      .set(auth(ownerToken))
      .send({ name: 'Dự án E2E', key: 'e2e' })
      .expect(201);
    project = res.body as Project;
    expect(project).toMatchObject({ name: 'Dự án E2E', key: 'E2E', color: '#E8B07C', icon: null });
    expect(project).not.toHaveProperty('issueCounter');
  });

  it('key trùng với project khác của mình → 409', async () => {
    const res = await http()
      .post('/projects')
      .set(auth(ownerToken))
      .send({ name: 'Trùng', key: 'E2E' })
      .expect(409);
    expect((res.body as ApiErrorBody).message).toMatch(/Key đã được dùng/);
  });

  it('người khác dùng cùng key được (key chỉ duy nhất theo chủ)', async () => {
    await http()
      .post('/projects')
      .set(auth(otherToken))
      .send({ name: 'Của B', key: 'E2E' })
      .expect(201);
  });

  it('danh sách chỉ có project của mình', async () => {
    const res = await http().get('/projects').set(auth(ownerToken)).expect(200);
    const list = res.body as Project[];
    expect(list.map((p) => p.id)).toEqual([project.id]);
  });

  it('người khác không xem/sửa/xóa được → 404', async () => {
    await http().get(`/projects/${project.id}`).set(auth(otherToken)).expect(404);
    await http()
      .patch(`/projects/${project.id}`)
      .set(auth(otherToken))
      .send({ name: 'X' })
      .expect(404);
    await http().delete(`/projects/${project.id}`).set(auth(otherToken)).expect(404);
  });

  it('sửa tên, màu; key gửi kèm bị bỏ qua', async () => {
    const res = await http()
      .patch(`/projects/${project.id}`)
      .set(auth(ownerToken))
      .send({ name: 'Đổi tên', color: '#3E6C76', key: 'NEW' })
      .expect(200);
    expect(res.body as Project).toMatchObject({ name: 'Đổi tên', color: '#3E6C76', key: 'E2E' });
  });

  it('dữ liệu sai → 400 kèm lỗi từng trường', async () => {
    const res = await http()
      .post('/projects')
      .set(auth(ownerToken))
      .send({ name: '', key: '1', color: 'cam' })
      .expect(400);
    expect(Object.keys((res.body as ApiErrorBody).errors ?? {}).sort()).toEqual([
      'color',
      'key',
      'name',
    ]);
  });

  it('xóa → 204, sau đó 404', async () => {
    await http().delete(`/projects/${project.id}`).set(auth(ownerToken)).expect(204);
    await http().get(`/projects/${project.id}`).set(auth(ownerToken)).expect(404);
  });
});
