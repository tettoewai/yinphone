import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash, verify } from 'argon2';

import type { AdminRole } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ChangePasswordInput } from './dto/change-password.schema.js';
import type { LoginInput } from './dto/login.schema.js';
import { ARGON2_OPTIONS } from './password-hashing.js';
import { createSessionToken, hashSessionToken } from './session-token.js';

/**
 * Verified against when the email is unknown, so a missing account costs the
 * same as a wrong password and the endpoint does not leak which emails exist.
 */
const DUMMY_HASH =
  '$argon2id$v=19$m=19456,t=2,p=1$p1wF3mnBrLuQJYwMbM3o0w$OC/zSK7kDguARtCVOCqMIyLxGFB3UjqL5x3V5X716Xo';

/** `lastUsedAt` is only rewritten once it is this stale, to keep reads cheap. */
const TOUCH_INTERVAL_MS = 5 * 60 * 1000;

const ADMIN_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  mustChangePassword: true,
} as const;

export type AdminView = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  mustChangePassword: boolean;
};

export type ResolvedSession = {
  sessionId: string;
  user: AdminView;
};

export type LoginResult = {
  token: string;
  expiresAt: Date;
  user: AdminView;
};

export type StartedSession = {
  token: string;
  expiresAt: Date;
};

function toAdminView(admin: {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  mustChangePassword: boolean;
}): AdminView {
  // Listed explicitly so `passwordHash` can never ride along into a response.
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    mustChangePassword: admin.mustChangePassword,
  };
}

function invalidCredentials(attemptsLeft: number) {
  return new UnauthorizedException({
    statusCode: HttpStatus.UNAUTHORIZED,
    code: 'INVALID_CREDENTIALS',
    message: 'Email or password is incorrect',
    attemptsLeft: Math.max(attemptsLeft, 0),
  });
}

function accountLocked(until: Date, now: Date) {
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((until.getTime() - now.getTime()) / 1000),
  );

  return new HttpException(
    {
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      code: 'ACCOUNT_LOCKED',
      message: `Too many attempts. Try again in ${Math.ceil(retryAfterSeconds / 60)} minute(s).`,
      retryAfterSeconds,
      lockedUntil: until.toISOString(),
    },
    HttpStatus.TOO_MANY_REQUESTS,
  );
}

@Injectable()
export class AuthService {
  private readonly sessionTtlMs: number;
  private readonly rememberTtlMs: number;
  private readonly maxAttempts: number;
  private readonly lockMs: number;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    this.sessionTtlMs =
      config.getOrThrow<number>('SESSION_TTL_HOURS') * 60 * 60 * 1000;
    this.rememberTtlMs =
      config.getOrThrow<number>('SESSION_REMEMBER_DAYS') * 24 * 60 * 60 * 1000;
    this.maxAttempts = config.getOrThrow<number>('LOGIN_MAX_ATTEMPTS');
    this.lockMs = config.getOrThrow<number>('LOGIN_LOCK_MINUTES') * 60 * 1000;
  }

  async login(input: LoginInput, userAgent?: string): Promise<LoginResult> {
    const now = new Date();

    const admin = await this.prisma.adminUser.findUnique({
      where: { email: input.email },
    });

    if (!admin) {
      await this.verifyQuietly(DUMMY_HASH, input.password);
      throw invalidCredentials(this.maxAttempts);
    }

    if (admin.lockedUntil && admin.lockedUntil > now) {
      throw accountLocked(admin.lockedUntil, now);
    }

    if (!(await this.verifyQuietly(admin.passwordHash, input.password))) {
      throw await this.registerFailure(admin.id, admin.failedLoginAttempts);
    }

    const token = createSessionToken();
    const expiresAt = new Date(
      now.getTime() +
        (input.rememberDevice ? this.rememberTtlMs : this.sessionTtlMs),
    );

    await this.prisma.$transaction([
      this.prisma.adminSession.create({
        data: {
          tokenHash: hashSessionToken(token),
          adminUserId: admin.id,
          expiresAt,
          userAgent: userAgent ?? null,
        },
      }),
      this.prisma.adminUser.update({
        where: { id: admin.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: now,
        },
      }),
      // Opportunistic cleanup; nothing else prunes expired sessions.
      this.prisma.adminSession.deleteMany({
        where: { adminUserId: admin.id, expiresAt: { lte: now } },
      }),
    ]);

    return { token, expiresAt, user: toAdminView(admin) };
  }

  async resolveSession(
    token: string | undefined,
  ): Promise<ResolvedSession | null> {
    if (!token) return null;

    const now = new Date();
    const session = await this.prisma.adminSession.findUnique({
      where: { tokenHash: hashSessionToken(token) },
      select: {
        id: true,
        expiresAt: true,
        lastUsedAt: true,
        adminUser: { select: ADMIN_SELECT },
      },
    });

    if (!session) return null;

    if (session.expiresAt <= now) {
      await this.prisma.adminSession.deleteMany({ where: { id: session.id } });
      return null;
    }

    if (now.getTime() - session.lastUsedAt.getTime() > TOUCH_INTERVAL_MS) {
      await this.prisma.adminSession.update({
        where: { id: session.id },
        data: { lastUsedAt: now },
      });
    }

    return { sessionId: session.id, user: toAdminView(session.adminUser) };
  }

  async logout(token: string | undefined) {
    if (!token) return;

    await this.prisma.adminSession.deleteMany({
      where: { tokenHash: hashSessionToken(token) },
    });
  }

  /**
   * Replaces the password and ends every session, then hands back a fresh one
   * so the caller stays signed in on this device only.
   */
  async changePassword(
    adminId: string,
    input: ChangePasswordInput,
    userAgent?: string,
  ): Promise<StartedSession> {
    const now = new Date();
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminId },
      select: { passwordHash: true },
    });

    const currentMatches =
      admin !== null &&
      (await this.verifyQuietly(admin.passwordHash, input.currentPassword));

    if (!currentMatches) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'INVALID_CURRENT_PASSWORD',
        message: 'Your current password is incorrect',
      });
    }

    const token = createSessionToken();
    const expiresAt = new Date(now.getTime() + this.sessionTtlMs);

    await this.prisma.$transaction([
      this.prisma.adminSession.deleteMany({ where: { adminUserId: adminId } }),
      this.prisma.adminUser.update({
        where: { id: adminId },
        data: {
          passwordHash: await hash(input.newPassword, ARGON2_OPTIONS),
          mustChangePassword: false,
        },
      }),
      this.prisma.adminSession.create({
        data: {
          tokenHash: hashSessionToken(token),
          adminUserId: adminId,
          expiresAt,
          userAgent: userAgent ?? null,
        },
      }),
    ]);

    return { token, expiresAt };
  }

  /**
   * Ends every session except the caller's, so the current device stays signed
   * in. `changePassword` already does this as a side effect; this is the
   * standalone "sign out other devices" move.
   */
  async revokeOtherSessions(adminId: string, currentSessionId: string) {
    const { count } = await this.prisma.adminSession.deleteMany({
      where: { adminUserId: adminId, id: { not: currentSessionId } },
    });

    return { revoked: count };
  }

  /** Counts one failed attempt and returns the exception to throw for it. */
  private async registerFailure(
    adminId: string,
    previousAttempts: number,
  ): Promise<HttpException> {
    const attempts = previousAttempts + 1;
    const now = new Date();

    if (attempts < this.maxAttempts) {
      await this.prisma.adminUser.update({
        where: { id: adminId },
        data: { failedLoginAttempts: attempts },
      });

      return invalidCredentials(this.maxAttempts - attempts);
    }

    // Locking resets the counter, so the next window starts with a full set of
    // attempts instead of re-locking on the first mistake.
    const lockedUntil = new Date(now.getTime() + this.lockMs);

    await this.prisma.adminUser.update({
      where: { id: adminId },
      data: { failedLoginAttempts: 0, lockedUntil },
    });

    return accountLocked(lockedUntil, now);
  }

  private async verifyQuietly(passwordHash: string, password: string) {
    try {
      return await verify(passwordHash, password);
    } catch {
      // A malformed hash in the database must not read as a valid password.
      return false;
    }
  }
}
