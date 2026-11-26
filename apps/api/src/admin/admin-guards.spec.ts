import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { SESSION_COOKIE } from '../auth/session-token.js';

/**
 * Boots the real app with a mocked PrismaService, so the admin guard wiring
 * is verified in the unit suite without a database. The e2e suite repeats
 * these checks against a real one.
 */
process.env.DATABASE_URL ??= 'postgresql://unit-test-mock';

function sessionFor(role: 'OWNER' | 'STAFF') {
  return {
    id: 's1',
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    lastUsedAt: new Date(),
    adminUser: {
      id: 'a1',
      email: 'admin@yinphone.example',
      name: 'Admin',
      role,
      mustChangePassword: false,
    },
  };
}

/** Swapped per test; `resolveSession` reads it through `findUnique`. */
let currentSession: ReturnType<typeof sessionFor> | null = null;

const prismaStub = {
  $connect: async () => {},
  $disconnect: async () => {},
  adminSession: {
    findUnique: async () => currentSession,
    update: async () => ({}),
    deleteMany: async () => ({ count: 0 }),
  },
};

describe('admin guard wiring', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const { AppModule } = await import('../app.module.js');
    const { PrismaService } = await import('../prisma/prisma.service.js');

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaStub)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it.each([
    '/api/admin/dashboard',
    '/api/admin/orders',
    '/api/admin/products',
    '/api/admin/categories',
    '/api/admin/channels',
    '/api/admin/staff',
  ])('%s rejects an anonymous request', async (path) => {
    const response = await request(app.getHttpServer()).get(path).expect(401);
    expect(response.body).toMatchObject({ code: 'NOT_SIGNED_IN' });
  });

  it('lets STAFF reach admin orders but not the staff routes', async () => {
    currentSession = sessionFor('STAFF');
    const cookie = `${SESSION_COOKIE}=mock-token`;

    // 501 while handlers are setup stubs — the point is the guards passed.
    await request(app.getHttpServer())
      .get('/api/admin/orders')
      .set('Cookie', cookie)
      .expect(501);

    const response = await request(app.getHttpServer())
      .get('/api/admin/staff')
      .set('Cookie', cookie)
      .expect(403);
    expect(response.body).toMatchObject({ code: 'FORBIDDEN' });
  });

  it('lets OWNER reach the staff routes', async () => {
    currentSession = sessionFor('OWNER');

    await request(app.getHttpServer())
      .get('/api/admin/staff')
      .set('Cookie', `${SESSION_COOKIE}=mock-token`)
      .expect(501);
  });
});
