import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { STATUS_IDS } from '@evolve/shared';
import { AppModule } from './../src/app.module';
import { setupSwagger } from './../src/swagger';
import type { ApiErrorBody } from './../src/common/filters/all-exceptions.filter';
import type { HealthResponse } from './../src/modules/health/health.controller';

describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupSwagger(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /health trả về status ok', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    const body = res.body as HealthResponse;
    expect(body.status).toBe('ok');
    expect(['up', 'down']).toContain(body.db);
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });

  it('route không tồn tại trả lỗi đúng dạng ApiErrorBody', async () => {
    const res = await request(app.getHttpServer()).get('/khong-ton-tai').expect(404);
    const body = res.body as ApiErrorBody;
    expect(body.statusCode).toBe(404);
    expect(typeof body.message).toBe('string');
    expect(body.path).toBe('/khong-ton-tai');
  });

  it('GET /docs-json trả tài liệu OpenAPI', async () => {
    const res = await request(app.getHttpServer()).get('/docs-json').expect(200);
    const doc = res.body as { openapi: string; info: { title: string } };
    expect(doc.openapi).toMatch(/^3\./);
    expect(doc.info.title).toBe('Evolve API');
  });

  it('import được contract từ @evolve/shared', () => {
    expect(STATUS_IDS).toEqual(['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE', 'CANCELED']);
  });
});
