import type { INestApplication } from '@nestjs/common';
import { StandardSchemaValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * These tests boot the real app, so they need a reachable database. To keep
 * them off the development database they only run when a test database is
 * provided explicitly:
 *
 *   E2E_DATABASE_URL=postgresql://localhost:5432/yinphone_test pnpm --filter api test:e2e
 *
 * `E2E_DATABASE_URL` is read before `AppModule` (and its `ConfigModule`, which
 * loads `.env`) is imported, so the overridden `DATABASE_URL` wins.
 */
const testDatabaseUrl = process.env.E2E_DATABASE_URL;

describe.skipIf(!testDatabaseUrl)('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    if (testDatabaseUrl) {
      process.env.DATABASE_URL = testDatabaseUrl;
    }

    const { AppModule } = await import('./../src/app.module.js');

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new StandardSchemaValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health', async () => {
    await request(app.getHttpServer()).get('/api/health').expect(200);
  });

  it('GET /api/products', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/products')
      .expect(200);

    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body).toMatchObject({ limit: 20, offset: 0 });
  });

  it('GET /api/products/:slug returns 404 for unknown products', async () => {
    await request(app.getHttpServer())
      .get('/api/products/not-a-real-product')
      .expect(404);
  });

  it('POST /api/orders rejects a payload without items', async () => {
    await request(app.getHttpServer())
      .post('/api/orders')
      .send({
        customerName: 'Ma Thida',
        customerPhone: '09400000001',
        channel: 'messenger',
        items: [],
      })
      .expect(400);
  });
});
