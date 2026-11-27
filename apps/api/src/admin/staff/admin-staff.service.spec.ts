import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { verify } from 'argon2';
import { describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '../../prisma/prisma.service.js';
import { AdminStaffService } from './admin-staff.service.js';

function createPrismaMock() {
  const prisma = {
    adminUser: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    // Prisma supports both the array form and the interactive callback; the
    // staff service uses the callback so the guardrail check shares the write.
    $transaction: vi.fn(async (argument: unknown) =>
      typeof argument === 'function'
        ? argument(prisma)
        : Promise.all(argument as Promise<unknown>[]),
    ),
  };

  return prisma;
}

function createService(prisma: ReturnType<typeof createPrismaMock>) {
  return new AdminStaffService(prisma as unknown as PrismaService);
}

function staffRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'a1',
    email: 'staff@yinphone.shop',
    name: 'YinPhone Staff',
    role: 'STAFF' as const,
    mustChangePassword: false,
    lastLoginAt: null as Date | null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

async function captureError(action: Promise<unknown>) {
  try {
    await action;
  } catch (error) {
    return error as {
      getStatus: () => number;
      getResponse: () => unknown;
    };
  }

  throw new Error('Expected the call to reject, but it resolved');
}

describe('AdminStaffService', () => {
  describe('list', () => {
    it('lists owners first, oldest join first within a role', async () => {
      const prisma = createPrismaMock();
      prisma.adminUser.findMany.mockResolvedValue([
        staffRow({ id: 'a2', email: 'late@yinphone.shop' }),
        staffRow({ id: 'a3', role: 'OWNER', email: 'owner@yinphone.shop' }),
      ]);

      const result = await createService(prisma).list();

      expect(result.map((member) => member.id)).toEqual(['a3', 'a2']);
    });

    it('returns ISO timestamps and never the password hash', async () => {
      const prisma = createPrismaMock();
      prisma.adminUser.findMany.mockResolvedValue([
        staffRow({ lastLoginAt: new Date('2026-02-01T10:00:00.000Z') }),
      ]);

      const [member] = await createService(prisma).list();

      expect(member).not.toHaveProperty('passwordHash');
      expect(member?.lastLoginAt).toBe('2026-02-01T10:00:00.000Z');
      expect(member?.createdAt).toBe('2026-01-01T00:00:00.000Z');
    });
  });

  describe('invite', () => {
    const input = {
      email: 'new@yinphone.shop',
      name: 'New Teammate',
      role: 'STAFF' as const,
    };

    it('creates the account with a one-time password that must be changed', async () => {
      const prisma = createPrismaMock();
      prisma.adminUser.findUnique.mockResolvedValue(null);
      prisma.adminUser.create.mockResolvedValue(
        staffRow({
          email: input.email,
          name: input.name,
          mustChangePassword: true,
        }),
      );

      const result = await createService(prisma).invite(input);

      const data = prisma.adminUser.create.mock.calls[0]?.[0]?.data as {
        passwordHash: string;
        mustChangePassword: boolean;
        role: string;
      };

      expect(result.temporaryPassword).toHaveLength(14);
      expect(result.temporaryPassword).toMatch(/[A-Z]/);
      expect(result.temporaryPassword).toMatch(/\d/);
      // The owner sees the password once; only its hash is stored.
      expect(data.passwordHash).toMatch(/^\$argon2id\$/);
      expect(await verify(data.passwordHash, result.temporaryPassword)).toBe(
        true,
      );
      expect(data.mustChangePassword).toBe(true);
      expect(data.role).toBe('STAFF');
    });

    it('refuses an email that is already on the team', async () => {
      const prisma = createPrismaMock();
      prisma.adminUser.findUnique.mockResolvedValue({ id: 'a2' });

      const error = await captureError(createService(prisma).invite(input));

      expect(error).toBeInstanceOf(ConflictException);
      expect(prisma.adminUser.create).not.toHaveBeenCalled();
    });

    it('turns a duplicate write into a conflict', async () => {
      const prisma = createPrismaMock();
      prisma.adminUser.findUnique.mockResolvedValue(null);
      prisma.adminUser.create.mockRejectedValue(
        Object.assign(new Error('duplicate'), { code: 'P2002' }),
      );

      const error = await captureError(createService(prisma).invite(input));

      expect(error).toBeInstanceOf(ConflictException);
    });
  });

  describe('update', () => {
    it('refuses to change the acting owner’s own role', async () => {
      const prisma = createPrismaMock();
      prisma.adminUser.findUnique.mockResolvedValue({
        id: 'a1',
        role: 'OWNER',
      });

      const error = await captureError(
        createService(prisma).update('a1', 'a1', { role: 'STAFF' }),
      );

      expect(error).toBeInstanceOf(ForbiddenException);
      expect(error.getResponse()).toMatchObject({ code: 'SELF_ROLE_CHANGE' });
      expect(prisma.adminUser.update).not.toHaveBeenCalled();
    });

    it('refuses to demote the last owner', async () => {
      const prisma = createPrismaMock();
      prisma.adminUser.findUnique.mockResolvedValue({
        id: 'a2',
        role: 'OWNER',
      });
      prisma.adminUser.count.mockResolvedValue(1);

      const error = await captureError(
        createService(prisma).update('a1', 'a2', { role: 'STAFF' }),
      );

      expect(error).toBeInstanceOf(ConflictException);
      expect(error.getResponse()).toMatchObject({ code: 'LAST_OWNER' });
      expect(prisma.adminUser.update).not.toHaveBeenCalled();
    });

    it('demotes an owner while another owner remains', async () => {
      const prisma = createPrismaMock();
      prisma.adminUser.findUnique.mockResolvedValue({
        id: 'a2',
        role: 'OWNER',
      });
      prisma.adminUser.count.mockResolvedValue(2);
      prisma.adminUser.update.mockResolvedValue(
        staffRow({ id: 'a2', role: 'STAFF' }),
      );

      const member = await createService(prisma).update('a1', 'a2', {
        role: 'STAFF',
      });

      expect(prisma.adminUser.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'a2' },
          data: { role: 'STAFF' },
        }),
      );
      expect(member.role).toBe('STAFF');
    });

    it('renames a member without touching the owner count', async () => {
      const prisma = createPrismaMock();
      prisma.adminUser.findUnique.mockResolvedValue({
        id: 'a2',
        role: 'OWNER',
      });
      prisma.adminUser.update.mockResolvedValue(
        staffRow({ id: 'a2', role: 'OWNER', name: 'Renamed' }),
      );

      await createService(prisma).update('a1', 'a2', { name: 'Renamed' });

      expect(prisma.adminUser.count).not.toHaveBeenCalled();
      expect(prisma.adminUser.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { name: 'Renamed' } }),
      );
    });

    it('reports a missing member', async () => {
      const prisma = createPrismaMock();
      prisma.adminUser.findUnique.mockResolvedValue(null);

      const error = await captureError(
        createService(prisma).update('a1', 'missing', { name: 'Nobody' }),
      );

      expect(error).toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    it('refuses to remove the acting owner’s own account', async () => {
      const prisma = createPrismaMock();

      const error = await captureError(
        createService(prisma).remove('a1', 'a1'),
      );

      expect(error).toBeInstanceOf(ForbiddenException);
      expect(error.getResponse()).toMatchObject({ code: 'SELF_REMOVE' });
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('refuses to remove the last owner', async () => {
      const prisma = createPrismaMock();
      prisma.adminUser.findUnique.mockResolvedValue({
        id: 'a2',
        role: 'OWNER',
      });
      prisma.adminUser.count.mockResolvedValue(1);

      const error = await captureError(
        createService(prisma).remove('a1', 'a2'),
      );

      expect(error).toBeInstanceOf(ConflictException);
      expect(error.getResponse()).toMatchObject({ code: 'LAST_OWNER' });
      expect(prisma.adminUser.delete).not.toHaveBeenCalled();
    });

    it('removes a staff member', async () => {
      const prisma = createPrismaMock();
      prisma.adminUser.findUnique.mockResolvedValue({
        id: 'a2',
        role: 'STAFF',
      });

      await createService(prisma).remove('a1', 'a2');

      expect(prisma.adminUser.delete).toHaveBeenCalledWith({
        where: { id: 'a2' },
      });
    });

    it('reports a missing member', async () => {
      const prisma = createPrismaMock();
      prisma.adminUser.findUnique.mockResolvedValue(null);

      const error = await captureError(
        createService(prisma).remove('a1', 'missing'),
      );

      expect(error).toBeInstanceOf(NotFoundException);
    });
  });
});
