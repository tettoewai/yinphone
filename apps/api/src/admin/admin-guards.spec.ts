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
  $transaction: async (argument: unknown) =>
    typeof argument === 'function'
      ? argument(prismaStub)
      : Promise.all(argument as Promise<unknown>[]),
  adminSession: {
    findUnique: async () => currentSession,
    update: async () => ({}),
    deleteMany: async () => ({ count: 0 }),
  },
  // The orders handler is implemented, so it needs a (empty) result to return.
  order: {
    findMany: async () => [],
    count: async () => 0,
    findUnique: async () => null,
    update: async () => ({}),
  },
  // The dashboard reads the channel list for its split.
  channel: {
    findMany: async () => [],
  },
  // The staff list needs a (empty) roster once the guards let the call through.
  adminUser: {
    findMany: async () => [],
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

    // Orders is implemented, so passing the guards means an empty page, not 501.
    const orders = await request(app.getHttpServer())
      .get('/api/admin/orders')
      .set('Cookie', cookie)
      .expect(200);
    expect(orders.body).toMatchObject({ items: [], total: 0 });

    const response = await request(app.getHttpServer())
      .get('/api/admin/staff')
      .set('Cookie', cookie)
      .expect(403);
    expect(response.body).toMatchObject({ code: 'FORBIDDEN' });
  });

  it('lets STAFF read the admin channels', async () => {
    currentSession = sessionFor('STAFF');

    // Channels is implemented, so passing the guards means an empty list, not 501.
    const response = await request(app.getHttpServer())
      .get('/api/admin/channels')
      .set('Cookie', `${SESSION_COOKIE}=mock-token`)
      .expect(200);
    expect(response.body).toEqual([]);
  });

  it('lets OWNER reach the staff routes', async () => {
    currentSession = sessionFor('OWNER');

    // Staff is implemented, so passing the guards means an empty roster, not 501.
    const response = await request(app.getHttpServer())
      .get('/api/admin/staff')
      .set('Cookie', `${SESSION_COOKIE}=mock-token`)
      .expect(200);
    expect(response.body).toEqual([]);
  });
});
