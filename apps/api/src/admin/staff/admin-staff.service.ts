import {
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'argon2';
import { randomInt } from 'node:crypto';

import { ARGON2_OPTIONS } from '../../auth/password-hashing.js';
import type { AdminRole } from '../../generated/prisma/enums.js';
import type { AdminUserGetPayload } from '../../generated/prisma/models.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { InviteStaffInput } from './dto/invite-staff.schema.js';
import type { UpdateStaffInput } from './dto/update-staff.schema.js';

/** The roster row; `passwordHash` is never selected. */
const STAFF_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  mustChangePassword: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

/** Owners are listed first; the roster is otherwise oldest-first. */
const ROLE_RANK: Record<AdminRole, number> = { OWNER: 0, STAFF: 1 };

/**
 * No `0`, `1`, `O`, `l` or `I`: the temporary password is read aloud or typed
 * off a screen, and those are the pairs people confuse.
 */
const TEMP_PASSWORD_ALPHABET =
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
const TEMP_PASSWORD_UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const TEMP_PASSWORD_DIGITS = '23456789';
const TEMP_PASSWORD_LENGTH = 14;

type StaffRow = AdminUserGetPayload<{ select: typeof STAFF_SELECT }>;

function toStaff(row: StaffRow) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    mustChangePassword: row.mustChangePassword,
    /** ISO 8601; the admin renders every timestamp in Asia/Yangon. */
    lastLoginAt: row.lastLoginAt ? row.lastLoginAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

function randomChar(alphabet: string) {
  return alphabet.charAt(randomInt(alphabet.length));
}

/** Prisma reports unique-constraint violations as `code === 'P2002'`. */
function isUniqueViolation(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'P2002'
  );
}

/**
 * A one-time password for an invited teammate. It always carries an uppercase
 * letter and a digit so it satisfies the rules on the forced-reset screen.
 */
function generateTemporaryPassword() {
  const chars = Array.from({ length: TEMP_PASSWORD_LENGTH }, () =>
    randomChar(TEMP_PASSWORD_ALPHABET),
  );

  // Guarantee the uppercase letter and digit the forced-reset rules ask for,
  // at two different random positions so the shape is not predictable.
  const upperIndex = randomInt(TEMP_PASSWORD_LENGTH);
  let digitIndex = randomInt(TEMP_PASSWORD_LENGTH - 1);
  if (digitIndex >= upperIndex) digitIndex += 1;

  chars[upperIndex] = randomChar(TEMP_PASSWORD_UPPER);
  chars[digitIndex] = randomChar(TEMP_PASSWORD_DIGITS);

  return chars.join('');
}

function lastOwner() {
  return new ConflictException({
    statusCode: HttpStatus.CONFLICT,
    code: 'LAST_OWNER',
    message: 'The shop needs at least one owner. Promote someone else first.',
  });
}

function selfAction(code: 'SELF_ROLE_CHANGE' | 'SELF_REMOVE', message: string) {
  return new ForbiddenException({
    statusCode: HttpStatus.FORBIDDEN,
    code,
    message,
  });
}

/**
 * The settings team tab. Owners manage the roster here; STAFF cannot reach the
 * routes at all (`@Roles('OWNER')` on the controller).
 *
 * Two guardrails are enforced server-side, because the screen is not the only
 * possible caller: the last owner can never be demoted or removed, and an
 * owner cannot change their own role (which also covers demoting themselves).
 */
@Injectable()
export class AdminStaffService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const rows = await this.prisma.adminUser.findMany({
      orderBy: { createdAt: 'asc' },
      select: STAFF_SELECT,
    });

    // Owners first, then the roster in the order people joined.
    return rows
      .map(toStaff)
      .sort((a, b) => ROLE_RANK[a.role] - ROLE_RANK[b.role]);
  }

  /**
   * Creates the account with a server-generated temporary password and
   * `mustChangePassword`, so the invitee rotates it on first sign-in. The
   * password is returned exactly once, for the owner to pass on out-of-band;
   * there is no email delivery yet.
   */
  async invite(input: InviteStaffInput) {
    const existing = await this.prisma.adminUser.findUnique({
      where: { email: input.email },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException(`"${input.email}" is already on the team`);
    }

    const temporaryPassword = generateTemporaryPassword();

    try {
      const row = await this.prisma.adminUser.create({
        data: {
          email: input.email,
          name: input.name,
          role: input.role,
          passwordHash: await hash(temporaryPassword, ARGON2_OPTIONS),
          mustChangePassword: true,
        },
        select: STAFF_SELECT,
      });

      return { member: toStaff(row), temporaryPassword };
    } catch (error) {
      // Another owner invited the same address between the check and the write.
      if (isUniqueViolation(error)) {
        throw new ConflictException(`"${input.email}" is already on the team`);
      }

      throw error;
    }
  }

  async update(actorId: string, id: string, input: UpdateStaffInput) {
    return this.prisma.$transaction(async (tx) => {
      const target = await tx.adminUser.findUnique({
        where: { id },
        select: { id: true, role: true },
      });

      if (!target) {
        throw new NotFoundException(`Staff member "${id}" was not found`);
      }

      const roleChanges =
        input.role !== undefined && input.role !== target.role;

      if (roleChanges && id === actorId) {
        throw selfAction(
          'SELF_ROLE_CHANGE',
          'You cannot change your own role. Ask another owner to do it.',
        );
      }

      if (roleChanges && target.role === 'OWNER') {
        const owners = await tx.adminUser.count({ where: { role: 'OWNER' } });
        if (owners <= 1) throw lastOwner();
      }

      const row = await tx.adminUser.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.role !== undefined ? { role: input.role } : {}),
        },
        select: STAFF_SELECT,
      });

      return toStaff(row);
    });
  }

  async remove(actorId: string, id: string) {
    if (id === actorId) {
      throw selfAction(
        'SELF_REMOVE',
        'You cannot remove your own account. Ask another owner to do it.',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      const target = await tx.adminUser.findUnique({
        where: { id },
        select: { id: true, role: true },
      });

      if (!target) {
        throw new NotFoundException(`Staff member "${id}" was not found`);
      }

      if (target.role === 'OWNER') {
        const owners = await tx.adminUser.count({ where: { role: 'OWNER' } });
        if (owners <= 1) throw lastOwner();
      }

      // Sessions cascade with the row, so the removed teammate is signed out
      // everywhere on their next request.
      await tx.adminUser.delete({ where: { id } });
    });
  }
}
