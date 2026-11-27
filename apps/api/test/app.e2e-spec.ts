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

  it('GET /api/auth/me rejects an anonymous request', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/auth/me')
      .expect(401);

    expect(response.body).toMatchObject({ code: 'NOT_SIGNED_IN' });
  });

  it('POST /api/auth/login rejects bad credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'nobody@yinphone.shop', password: 'wrong-password' })
      .expect(401);

    expect(response.body).toMatchObject({ code: 'INVALID_CREDENTIALS' });
  });

  it('POST /api/auth/login validates the payload', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'nobody@yinphone.shop', password: 'short' })
      .expect(400);
  });

  it('POST /api/auth/logout clears the session cookie', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/logout')
      .expect(204);

    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('yp_session=')]),
    );
  });

  describe('password reset', () => {
    it('answers 204 for an email with no account', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/password-reset/request')
        .send({ email: 'e2e-nobody@yinphone.example' })
        .expect(204);
    });

    it('validates the request payload', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/password-reset/request')
        .send({ email: 'not-an-email' })
        .expect(400);
    });

    it('rejects a code for an unknown account without revealing it', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/password-reset/verify')
        .send({ email: 'e2e-nobody@yinphone.example', code: '123456' })
        .expect(400);

      expect(response.body).toMatchObject({ code: 'INVALID_RESET_CODE' });
    });

    it('rejects a complete call with an unknown ticket', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/password-reset/complete')
        .send({ ticket: 'e2e-not-a-real-ticket', password: 'whatever-123' })
        .expect(400);

      expect(response.body).toMatchObject({ code: 'RESET_TICKET_EXPIRED' });
    });
  });

  it('GET /api/admin/orders rejects an anonymous request', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/admin/orders')
      .expect(401);

    expect(response.body).toMatchObject({ code: 'NOT_SIGNED_IN' });
  });

  describe('admin routes with a STAFF session', () => {
    const staffEmail = 'e2e-staff@yinphone.example';
    let sessionCookie: string;
    let staffId: string;

    beforeAll(async () => {
      const { PrismaService } = await import('../src/prisma/prisma.service.js');
      const { SESSION_COOKIE, createSessionToken, hashSessionToken } =
        await import('../src/auth/session-token.js');
      const prisma = app.get(PrismaService);

      // The session row is created directly, so no password verify is needed;
      // the hash placeholder is never used to sign in.
      await prisma.adminUser.deleteMany({ where: { email: staffEmail } });
      const token = createSessionToken();
      const staff = await prisma.adminUser.create({
        data: {
          email: staffEmail,
          name: 'E2E Staff',
          role: 'STAFF',
          passwordHash: 'e2e-placeholder-hash',
        },
      });
      staffId = staff.id;
      await prisma.adminSession.create({
        data: {
          tokenHash: hashSessionToken(token),
          adminUserId: staff.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });
      sessionCookie = `${SESSION_COOKIE}=${token}`;
    });

    afterAll(async () => {
      const { PrismaService } = await import('../src/prisma/prisma.service.js');
      const prisma = app.get(PrismaService);
      // Sessions cascade with the user.
      await prisma.adminUser.deleteMany({ where: { id: staffId } });
    });

    it('lets STAFF past the guards on admin orders', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/orders')
        .set('Cookie', sessionCookie)
        .expect((response) => {
          // The point is that the guards passed, so neither 401 nor 403 is
          // acceptable.
          if (response.status === 401 || response.status === 403) {
            throw new Error(
              `STAFF was blocked from /api/admin/orders: ${response.status}`,
            );
          }
        });
    });

    it('lets STAFF record a manual order', async () => {
      // An empty item list fails validation before the database is touched, so
      // a 400 proves the route exists and the session got through the guards.
      const response = await request(app.getHttpServer())
        .post('/api/admin/orders')
        .set('Cookie', sessionCookie)
        .send({
          customerName: 'Ma Thida',
          customerPhone: '09400000001',
          channel: 'messenger',
          items: [],
        })
        .expect(400);

      expect(response.body).toMatchObject({ statusCode: 400 });
    });

    it('blocks STAFF from the owner-only staff routes', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/staff')
        .set('Cookie', sessionCookie)
        .expect(403);

      expect(response.body).toMatchObject({ code: 'FORBIDDEN' });
    });
  });
});
