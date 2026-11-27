import { BadRequestException, HttpException } from '@nestjs/common';
import { argon2id, hash } from 'argon2';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import type { ConfigService } from '@nestjs/config';

import type { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';
import { hashSessionToken } from './session-token.js';

/** Cheap argon2id settings: real hashing, but fast enough for unit tests. */
const CHEAP_ARGON2 = {
  type: argon2id,
  memoryCost: 1024,
  timeCost: 1,
  parallelism: 1,
} as const;

const PASSWORD = 'correct-horse-battery';
const EMAIL = 'staff@yinphone.shop';

let passwordHash: string;

beforeAll(async () => {
  passwordHash = await hash(PASSWORD, CHEAP_ARGON2);
});

afterAll(() => {
  vi.useRealTimers();
});

function createPrismaMock() {
  const prisma = {
    adminUser: { findUnique: vi.fn(), update: vi.fn() },
    adminSession: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  prisma.$transaction.mockImplementation((operations: Promise<unknown>[]) =>
    Promise.all(operations),
  );

  return prisma;
}

const env: Record<string, unknown> = {
  NODE_ENV: 'test',
  SESSION_TTL_HOURS: 12,
  SESSION_REMEMBER_DAYS: 30,
  LOGIN_MAX_ATTEMPTS: 3,
  LOGIN_LOCK_MINUTES: 5,
};

function createService(prisma: ReturnType<typeof createPrismaMock>) {
  const config = {
    getOrThrow: vi.fn((key: string) => env[key]),
    get: vi.fn((key: string) => env[key]),
  };

  return new AuthService(
    prisma as unknown as PrismaService,
    config as unknown as ConfigService,
  );
}

function adminRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'a1',
    email: EMAIL,
    name: 'YinPhone Staff',
    role: 'STAFF' as const,
    mustChangePassword: false,
    passwordHash,
    failedLoginAttempts: 0,
    lockedUntil: null as Date | null,
    lastLoginAt: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

async function captureError(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    return error as HttpException;
  }

  throw new Error('Expected the promise to reject');
}

describe('AuthService', () => {
  describe('login', () => {
    it('starts a session and never leaks the password hash', async () => {
      const prisma = createPrismaMock();
      prisma.adminUser.findUnique.mockResolvedValue(adminRow());

      const result = await createService(prisma).login({
        email: EMAIL,
        password: PASSWORD,
      });

      expect(result.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
      expect(result.user).toEqual({
        id: 'a1',
        email: EMAIL,
        name: 'YinPhone Staff',
        role: 'STAFF',
        mustChangePassword: false,
      });
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(prisma.$transaction).toHaveBeenCalledOnce();
    });

    it('stores only the hash of the session token', async () => {
      const prisma = createPrismaMock();
      prisma.adminUser.findUnique.mockResolvedValue(adminRow());

      const { token } = await createService(prisma).login({
        email: EMAIL,
        password: PASSWORD,
      });

      const created = prisma.adminSession.create.mock.calls[0]?.[0];
      const stored = created?.data as { tokenHash: string };

      expect(stored.tokenHash).toBe(hashSessionToken(token));
      expect(stored.tokenHash).not.toBe(token);
    });

    it('gives a remembering device the longer lifetime', async () => {
      vi.useFakeTimers({ now: new Date('2026-03-01T00:00:00.000Z') });

      const prisma = createPrismaMock();
      prisma.adminUser.findUnique.mockResolvedValue(adminRow());
      const service = createService(prisma);

      const short = await service.login({ email: EMAIL, password: PASSWORD });
      const remembered = await service.login({
        email: EMAIL,
        password: PASSWORD,
        rememberDevice: true,
      });

      const twelveHours = 12 * 60 * 60 * 1000;
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;

      expect(short.expiresAt.getTime()).toBe(Date.now() + twelveHours);
      expect(remembered.expiresAt.getTime()).toBe(Date.now() + thirtyDays);
    });

    it('clears the failure counter on a successful sign-in', async () => {
      const prisma = createPrismaMock();
      prisma.adminUser.findUnique.mockResolvedValue(adminRow());
      prisma.adminUser.update.mockResolvedValue(adminRow());

      await createService(prisma).login({ email: EMAIL, password: PASSWORD });

      expect(prisma.adminUser.update).toHaveBeenCalledWith({
        where: { id: 'a1' },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: expect.any(Date),
        },
      });
    });

    it('rejects unknown emails with the same generic message', async () => {
      const prisma = createPrismaMock();
      prisma.adminUser.findUnique.mockResolvedValue(null);

      const error = await captureError(
        createService(prisma).login({
          email: 'nobody@yinphone.shop',
          password: PASSWORD,
        }),
      );

      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(401);
      expect(error.getResponse()).toMatchObject({
        code: 'INVALID_CREDENTIALS',
        message: 'Email or password is incorrect',
      });
      expect(prisma.adminSession.create).not.toHaveBeenCalled();
    });

    it('counts down the remaining attempts on a wrong password', async () => {
      const prisma = createPrismaMock();
      prisma.adminUser.findUnique.mockResolvedValue(
        adminRow({ failedLoginAttempts: 1 }),
      );

      const error = await captureError(
        createService(prisma).login({
          email: EMAIL,
          password: 'wrong-password',
        }),
      );

      expect(error.getStatus()).toBe(401);
      expect(error.getResponse()).toMatchObject({ attemptsLeft: 1 });
      expect(prisma.adminUser.update).toHaveBeenCalledWith({
        where: { id: 'a1' },
        data: { failedLoginAttempts: 2 },
      });
    });

    it('locks the account after the last allowed failure', async () => {
      vi.useFakeTimers({ now: new Date('2026-03-01T00:00:00.000Z') });

      const prisma = createPrismaMock();
      prisma.adminUser.findUnique.mockResolvedValue(
        adminRow({ failedLoginAttempts: 2 }),
      );

      const error = await captureError(
        createService(prisma).login({
          email: EMAIL,
          password: 'wrong-password',
        }),
      );

      expect(error.getStatus()).toBe(429);
      expect(error.getResponse()).toMatchObject({
        code: 'ACCOUNT_LOCKED',
        retryAfterSeconds: 300,
      });
      // The counter resets so the next window starts clean.
      expect(prisma.adminUser.update).toHaveBeenCalledWith({
        where: { id: 'a1' },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: new Date('2026-03-01T00:05:00.000Z'),
        },
      });
      expect(prisma.adminSession.create).not.toHaveBeenCalled();
    });

    it('refuses a locked account without checking the password', async () => {
      const prisma = createPrismaMock();
      prisma.adminUser.findUnique.mockResolvedValue(
        adminRow({ lockedUntil: new Date(Date.now() + 60_000) }),
      );

      const error = await captureError(
        createService(prisma).login({ email: EMAIL, password: PASSWORD }),
      );

      expect(error.getStatus()).toBe(429);
      expect(prisma.adminSession.create).not.toHaveBeenCalled();
    });
  });

  describe('resolveSession', () => {
    const liveSession = {
      id: 's1',
      expiresAt: new Date(Date.now() + 60_000),
      lastUsedAt: new Date(),
      adminUser: adminRow(),
    };

    it('returns nothing without a token', async () => {
      const prisma = createPrismaMock();

      await expect(
        createService(prisma).resolveSession(undefined),
      ).resolves.toBeNull();
      expect(prisma.adminSession.findUnique).not.toHaveBeenCalled();
    });

    it('resolves the admin behind a live session', async () => {
      const prisma = createPrismaMock();
      prisma.adminSession.findUnique.mockResolvedValue(liveSession);

      const session = await createService(prisma).resolveSession('token');

      expect(prisma.adminSession.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tokenHash: hashSessionToken('token') },
        }),
      );
      expect(session).toMatchObject({
        sessionId: 's1',
        user: { id: 'a1', role: 'STAFF' },
      });
    });

    it('drops an expired session and reports nothing', async () => {
      const prisma = createPrismaMock();
      prisma.adminSession.findUnique.mockResolvedValue({
        ...liveSession,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(
        createService(prisma).resolveSession('token'),
      ).resolves.toBeNull();
      expect(prisma.adminSession.deleteMany).toHaveBeenCalledWith({
        where: { id: 's1' },
      });
    });

    it('only touches lastUsedAt when it is stale', async () => {
      const prisma = createPrismaMock();
      prisma.adminSession.findUnique.mockResolvedValue({
        ...liveSession,
        lastUsedAt: new Date(Date.now() - 10 * 60 * 1000),
      });

      await createService(prisma).resolveSession('token');

      expect(prisma.adminSession.update).toHaveBeenCalledWith({
        where: { id: 's1' },
        data: { lastUsedAt: expect.any(Date) },
      });
    });

    it('leaves a freshly used session untouched', async () => {
      const prisma = createPrismaMock();
      prisma.adminSession.findUnique.mockResolvedValue(liveSession);

      await createService(prisma).resolveSession('token');

      expect(prisma.adminSession.update).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('deletes the session behind the token', async () => {
      const prisma = createPrismaMock();

      await createService(prisma).logout('token');

      expect(prisma.adminSession.deleteMany).toHaveBeenCalledWith({
        where: { tokenHash: hashSessionToken('token') },
      });
    });

    it('does nothing without a token', async () => {
      const prisma = createPrismaMock();

      await createService(prisma).logout(undefined);

      expect(prisma.adminSession.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('rejects a wrong current password', async () => {
      const prisma = createPrismaMock();
      prisma.adminUser.findUnique.mockResolvedValue({ passwordHash });

      const error = await captureError(
        createService(prisma).changePassword('a1', {
          currentPassword: 'not-the-password',
          newPassword: 'a-brand-new-password',
        }),
      );

      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.getResponse()).toMatchObject({
        code: 'INVALID_CURRENT_PASSWORD',
      });
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('stores a new hash and revokes every previous session', async () => {
      const prisma = createPrismaMock();
      prisma.adminUser.findUnique.mockResolvedValue({ passwordHash });

      const result = await createService(prisma).changePassword('a1', {
        currentPassword: PASSWORD,
        newPassword: 'a-brand-new-password',
      });

      expect(result.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
      expect(prisma.adminSession.deleteMany).toHaveBeenCalledWith({
        where: { adminUserId: 'a1' },
      });
      expect(prisma.adminUser.update).toHaveBeenCalledWith({
        where: { id: 'a1' },
        data: {
          passwordHash: expect.stringContaining('$argon2id$'),
          mustChangePassword: false,
        },
      });
      expect(prisma.adminSession.create).toHaveBeenCalledOnce();
    });
  });

  describe('revokeOtherSessions', () => {
    it('deletes every session but the current one', async () => {
      const prisma = createPrismaMock();
      prisma.adminSession.deleteMany.mockResolvedValue({ count: 2 });

      const result = await createService(prisma).revokeOtherSessions(
        'a1',
        's1',
      );

      expect(prisma.adminSession.deleteMany).toHaveBeenCalledWith({
        where: { adminUserId: 'a1', id: { not: 's1' } },
      });
      expect(result).toEqual({ revoked: 2 });
    });

    it('reports zero when nothing else was signed in', async () => {
      const prisma = createPrismaMock();
      prisma.adminSession.deleteMany.mockResolvedValue({ count: 0 });

      await expect(
        createService(prisma).revokeOtherSessions('a1', 's1'),
      ).resolves.toEqual({ revoked: 0 });
    });
  });
});
