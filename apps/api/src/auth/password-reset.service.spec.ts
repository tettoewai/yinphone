import { HttpException } from '@nestjs/common';
import { argon2id, hash, verify } from 'argon2';
import { describe, expect, it, vi } from 'vitest';

import type { ConfigService } from '@nestjs/config';

import type { EmailService } from '../email/email.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { PasswordResetService } from './password-reset.service.js';
import { hashSessionToken } from './session-token.js';

/** Cheap argon2id settings: real hashing, but fast enough for unit tests. */
const CHEAP_ARGON2 = {
  type: argon2id,
  memoryCost: 1024,
  timeCost: 1,
  parallelism: 1,
} as const;

const EMAIL = 'staff@yinphone.shop';
const MAX_ATTEMPTS = 3;
const TTL_MINUTES = 10;

function createPrismaMock() {
  const prisma = {
    adminUser: { findUnique: vi.fn(), update: vi.fn() },
    adminSession: { deleteMany: vi.fn() },
    passwordResetCode: {
      findFirst: vi.fn(),
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

function createEmailMock() {
  return { sendPasswordResetCode: vi.fn().mockResolvedValue(undefined) };
}

const env: Record<string, unknown> = {
  RESET_CODE_TTL_MINUTES: TTL_MINUTES,
  RESET_CODE_MAX_ATTEMPTS: MAX_ATTEMPTS,
  RESET_RESEND_COOLDOWN_SECONDS: 30,
};

function createService(
  prisma: ReturnType<typeof createPrismaMock>,
  email: ReturnType<typeof createEmailMock>,
) {
  const config = {
    getOrThrow: vi.fn((key: string) => env[key]),
    get: vi.fn((key: string) => env[key]),
  };

  return new PasswordResetService(
    prisma as unknown as PrismaService,
    email as unknown as EmailService,
    config as unknown as ConfigService,
  );
}

async function captureError(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    return error as HttpException;
  }

  throw new Error('Expected the promise to reject');
}

function errorBody(error: HttpException) {
  return error.getResponse() as Record<string, unknown>;
}

describe('PasswordResetService', () => {
  describe('request', () => {
    it('stays silent for an unknown email', async () => {
      const prisma = createPrismaMock();
      const email = createEmailMock();
      prisma.adminUser.findUnique.mockResolvedValue(null);

      await expect(
        createService(prisma, email).request(EMAIL),
      ).resolves.toBeUndefined();

      expect(prisma.passwordResetCode.create).not.toHaveBeenCalled();
      expect(email.sendPasswordResetCode).not.toHaveBeenCalled();
    });

    it('mails a 6-digit code and stores only its hash', async () => {
      const prisma = createPrismaMock();
      const email = createEmailMock();
      prisma.adminUser.findUnique.mockResolvedValue({
        id: 'a1',
        email: EMAIL,
      });
      prisma.passwordResetCode.findFirst.mockResolvedValue(null);

      const now = Date.now();
      await createService(prisma, email).request(EMAIL);

      expect(email.sendPasswordResetCode).toHaveBeenCalledOnce();

      const sent = email.sendPasswordResetCode.mock.calls[0][0] as {
        to: string;
        code: string;
        expiresInMinutes: number;
      };

      expect(sent.to).toBe(EMAIL);
      expect(sent.code).toMatch(/^\d{6}$/);
      expect(sent.expiresInMinutes).toBe(TTL_MINUTES);

      const created = prisma.passwordResetCode.create.mock.calls[0][0] as {
        data: { codeHash: string; expiresAt: Date; adminUserId: string };
      };

      expect(created.data.adminUserId).toBe('a1');
      expect(created.data.codeHash).not.toContain(sent.code);
      expect(await verify(created.data.codeHash, sent.code)).toBe(true);
      expect(created.data.expiresAt.getTime()).toBeGreaterThanOrEqual(
        now + TTL_MINUTES * 60 * 1000 - 1000,
      );
    });

    it('refuses a second code inside the cooldown', async () => {
      const prisma = createPrismaMock();
      const email = createEmailMock();
      prisma.adminUser.findUnique.mockResolvedValue({
        id: 'a1',
        email: EMAIL,
      });
      prisma.passwordResetCode.findFirst.mockResolvedValue({
        createdAt: new Date(Date.now() - 5_000),
      });

      const error = await captureError(
        createService(prisma, email).request(EMAIL),
      );

      expect(error.getStatus()).toBe(429);
      expect(errorBody(error).code).toBe('RESET_COOLDOWN');
      expect(errorBody(error).retryAfterSeconds).toBeGreaterThan(0);
      expect(email.sendPasswordResetCode).not.toHaveBeenCalled();
    });

    it('allows a new code once the cooldown has passed', async () => {
      const prisma = createPrismaMock();
      const email = createEmailMock();
      prisma.adminUser.findUnique.mockResolvedValue({
        id: 'a1',
        email: EMAIL,
      });
      prisma.passwordResetCode.findFirst.mockResolvedValue({
        createdAt: new Date(Date.now() - 60_000),
      });

      await createService(prisma, email).request(EMAIL);

      expect(email.sendPasswordResetCode).toHaveBeenCalledOnce();
    });

    it('drops the code when the email cannot be sent', async () => {
      const prisma = createPrismaMock();
      const email = createEmailMock();
      prisma.adminUser.findUnique.mockResolvedValue({
        id: 'a1',
        email: EMAIL,
      });
      prisma.passwordResetCode.findFirst.mockResolvedValue(null);
      email.sendPasswordResetCode.mockRejectedValue(new Error('resend down'));

      await expect(createService(prisma, email).request(EMAIL)).rejects.toThrow(
        'resend down',
      );

      expect(prisma.passwordResetCode.deleteMany).toHaveBeenCalled();
    });
  });

  describe('verify', () => {
    async function record(code: string, attempts = 0) {
      return {
        id: 'r1',
        codeHash: await hash(code, CHEAP_ARGON2),
        attempts,
      };
    }

    it('rejects an unknown email without revealing it', async () => {
      const prisma = createPrismaMock();
      prisma.adminUser.findUnique.mockResolvedValue(null);

      const error = await captureError(
        createService(prisma, createEmailMock()).verify(EMAIL, '123456'),
      );

      expect(error.getStatus()).toBe(400);
      expect(errorBody(error).code).toBe('INVALID_RESET_CODE');
      expect(prisma.passwordResetCode.findFirst).not.toHaveBeenCalled();
    });

    it('rejects when there is no live code', async () => {
      const prisma = createPrismaMock();
      prisma.adminUser.findUnique.mockResolvedValue({ id: 'a1' });
      prisma.passwordResetCode.findFirst.mockResolvedValue(null);

      const error = await captureError(
        createService(prisma, createEmailMock()).verify(EMAIL, '123456'),
      );

      expect(errorBody(error).code).toBe('RESET_CODE_EXPIRED');
    });

    it('trades the right code for a hashed single-use ticket', async () => {
      const prisma = createPrismaMock();
      prisma.adminUser.findUnique.mockResolvedValue({ id: 'a1' });
      prisma.passwordResetCode.findFirst.mockResolvedValue(
        await record('123456'),
      );

      const { ticket } = await createService(prisma, createEmailMock()).verify(
        EMAIL,
        '123456',
      );

      expect(ticket).toMatch(/^[A-Za-z0-9_-]{43}$/);

      // First call bumps the attempt counter; the second writes the ticket.
      const stored = prisma.passwordResetCode.update.mock.calls.at(-1)?.[0] as {
        data: { ticketHash: string; verifiedAt: Date | null };
      };

      expect(stored.data.ticketHash).toBe(hashSessionToken(ticket));
      expect(stored.data.verifiedAt).toBeInstanceOf(Date);
    });

    it('counts a wrong guess and reports the attempts left', async () => {
      const prisma = createPrismaMock();
      prisma.adminUser.findUnique.mockResolvedValue({ id: 'a1' });
      prisma.passwordResetCode.findFirst.mockResolvedValue(
        await record('123456'),
      );

      const error = await captureError(
        createService(prisma, createEmailMock()).verify(EMAIL, '000000'),
      );

      expect(error.getStatus()).toBe(400);
      expect(errorBody(error).code).toBe('INVALID_RESET_CODE');
      expect(errorBody(error).attemptsLeft).toBe(MAX_ATTEMPTS - 1);
      expect(prisma.passwordResetCode.update).toHaveBeenCalledOnce();
    });

    it('burns a code that has used up its attempts', async () => {
      const prisma = createPrismaMock();
      prisma.adminUser.findUnique.mockResolvedValue({ id: 'a1' });
      prisma.passwordResetCode.findFirst.mockResolvedValue(
        await record('123456', MAX_ATTEMPTS),
      );

      const error = await captureError(
        createService(prisma, createEmailMock()).verify(EMAIL, '123456'),
      );

      expect(errorBody(error).code).toBe('RESET_CODE_EXHAUSTED');
      expect(prisma.passwordResetCode.update).not.toHaveBeenCalled();
    });
  });

  describe('complete', () => {
    const TICKET = 'ticket-from-the-verify-step';

    function liveRecord(overrides: Record<string, unknown> = {}) {
      return {
        id: 'r1',
        adminUserId: 'a1',
        verifiedAt: new Date(),
        consumedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
        ...overrides,
      };
    }

    it('sets the password, clears the lockout and revokes every session', async () => {
      const prisma = createPrismaMock();
      prisma.passwordResetCode.findUnique.mockResolvedValue(liveRecord());

      await createService(prisma, createEmailMock()).complete(
        TICKET,
        'a-brand-new-password',
      );

      expect(prisma.passwordResetCode.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ticketHash: hashSessionToken(TICKET) },
        }),
      );

      const update = prisma.adminUser.update.mock.calls[0][0] as {
        where: { id: string };
        data: { passwordHash: string; mustChangePassword: boolean };
      };

      expect(update.where).toEqual({ id: 'a1' });
      expect(update.data.mustChangePassword).toBe(false);
      expect(
        await verify(update.data.passwordHash, 'a-brand-new-password'),
      ).toBe(true);

      expect(prisma.adminSession.deleteMany).toHaveBeenCalledWith({
        where: { adminUserId: 'a1' },
      });
    });

    it.each([
      ['unknown ticket', null],
      ['unverified ticket', { verifiedAt: null }],
      ['spent ticket', { consumedAt: new Date() }],
      ['expired ticket', { expiresAt: new Date(Date.now() - 1) }],
    ])('rejects a %s', async (_label, override) => {
      const prisma = createPrismaMock();
      prisma.passwordResetCode.findUnique.mockResolvedValue(
        override === null ? null : liveRecord(override),
      );

      const error = await captureError(
        createService(prisma, createEmailMock()).complete(
          TICKET,
          'whatever-123',
        ),
      );

      expect(error.getStatus()).toBe(400);
      expect(errorBody(error).code).toBe('RESET_TICKET_EXPIRED');
      expect(prisma.adminUser.update).not.toHaveBeenCalled();
    });
  });
});
