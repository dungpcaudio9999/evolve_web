import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { AuthResponse, User } from '@evolve/shared';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import type { ApiErrorBody } from './../src/common/filters/all-exceptions.filter';
import { PrismaService } from './../src/prisma/prisma.service';

/** Cần PostgreSQL thật (DATABASE_URL trong apps/api/.env hoặc biến môi trường của CI). */
const describeDb = process.env.DATABASE_URL ? describe : describe.skip;
if (!process.env.DATABASE_URL) console.warn('Bỏ qua auth e2e: chưa có DATABASE_URL');

describeDb('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const email = `e2e-${Date.now()}@evolve.test`;
  const password = 'password123';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  const http = () => request(app.getHttpServer());

  it('register → 201, trả token và user (không có passwordHash)', async () => {
    const res = await http()
      .post('/auth/register')
      .send({ name: 'E2E', email: email.toUpperCase(), password })
      .expect(201);
    const body = res.body as AuthResponse;
    expect(body.accessToken).toEqual(expect.any(String));
    expect(body.user).toMatchObject({ name: 'E2E', email });
    expect(body.user).not.toHaveProperty('passwordHash');
  });

  it('register email trùng → 409', async () => {
    const res = await http()
      .post('/auth/register')
      .send({ name: 'X', email, password })
      .expect(409);
    expect((res.body as ApiErrorBody).message).toBe('Email đã được dùng');
  });

  it('register sai dữ liệu → 400 kèm lỗi từng trường', async () => {
    const res = await http()
      .post('/auth/register')
      .send({ name: '', email: 'khong-phai-email', password: '123' })
      .expect(400);
    const body = res.body as ApiErrorBody;
    expect(Object.keys(body.errors ?? {}).sort()).toEqual(['email', 'name', 'password']);
  });

  it('login → token dùng được cho /auth/me', async () => {
    const login = await http().post('/auth/login').send({ email, password }).expect(200);
    const { accessToken } = login.body as AuthResponse;
    const me = await http()
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect((me.body as User).email).toBe(email);
  });

  it('login sai mật khẩu → 401', async () => {
    const res = await http()
      .post('/auth/login')
      .send({ email, password: 'sai-mat-khau' })
      .expect(401);
    expect((res.body as ApiErrorBody).message).toBe('Sai email hoặc mật khẩu');
  });

  it('/auth/me không có token hoặc token sai → 401', async () => {
    await http().get('/auth/me').expect(401);
    await http().get('/auth/me').set('Authorization', 'Bearer abc.def.ghi').expect(401);
  });
});
