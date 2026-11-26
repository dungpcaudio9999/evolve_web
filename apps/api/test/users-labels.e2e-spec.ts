import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { AuthResponse, Label, User } from '@evolve/shared';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

const describeDb = process.env.DATABASE_URL ? describe : describe.skip;

describeDb('Users & Labels (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;
  const email = `ul-${Date.now()}@evolve.test`;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'UL', email, password: 'password123' })
      .expect(201);
    token = (res.body as AuthResponse).accessToken;
  });

  afterAll(async () => {
    await app.get(PrismaService).user.deleteMany({ where: { email } });
    await app.close();
  });

  it('không có token → 401', async () => {
    await request(app.getHttpServer()).get('/users').expect(401);
    await request(app.getHttpServer()).get('/labels').expect(401);
  });

  it('GET /users có người vừa đăng ký, không lộ passwordHash', async () => {
    const res = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const users = res.body as User[];
    const me = users.find((u) => u.email === email);
    expect(me).toMatchObject({ name: 'UL', email });
    expect(users.every((u) => !('passwordHash' in u))).toBe(true);
  });

  it('GET /labels trả đúng dạng Label', async () => {
    const res = await request(app.getHttpServer())
      .get('/labels')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    for (const label of res.body as Label[]) {
      expect(Object.keys(label).sort()).toEqual(['color', 'id', 'name']);
    }
  });
});
