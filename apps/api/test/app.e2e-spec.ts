import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { STATUS_IDS } from '@evolve/shared';
import { AppModule } from './../src/app.module';
import type { HealthResponse } from './../src/modules/health/health.controller';

describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /health trả về status ok', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    const body = res.body as HealthResponse;
    expect(body.status).toBe('ok');
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });

  it('import được contract từ @evolve/shared', () => {
    expect(STATUS_IDS).toEqual(['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE', 'CANCELED']);
  });
});
