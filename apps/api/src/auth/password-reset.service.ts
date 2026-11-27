import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash, verify } from 'argon2';
import { randomInt } from 'node:crypto';

import { EmailService } from '../email/email.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ARGON2_OPTIONS } from './password-hashing.js';
import { createSessionToken, hashSessionToken } from './session-token.js';

/** The code length the admin UI asks for. */
const CODE_LENGTH = 6;

/** Ten digits of entropy would be too many to type; six is the design. */
const CODE_CEILING = 10 ** CODE_LENGTH;

function invalidCode(attemptsLeft: number) {
  return new BadRequestException({
    statusCode: HttpStatus.BAD_REQUEST,
    code: 'INVALID_RESET_CODE',
    message:
      attemptsLeft > 0
        ? `That code is not correct. ${attemptsLeft} attempt(s) left.`
        : 'That code is not correct. Request a new one.',
    attemptsLeft: Math.max(attemptsLeft, 0),
  });
}

function codeExpired() {
  return new BadRequestException({
    statusCode: HttpStatus.BAD_REQUEST,
    code: 'RESET_CODE_EXPIRED',
    message: 'This code has expired. Request a new one.',
  });
}

function codeExhausted() {
  return new BadRequestException({
    statusCode: HttpStatus.BAD_REQUEST,
    code: 'RESET_CODE_EXHAUSTED',
    message: 'Too many attempts. Request a new code.',
  });
}

function ticketExpired() {
  return new BadRequestException({
    statusCode: HttpStatus.BAD_REQUEST,
    code: 'RESET_TICKET_EXPIRED',
    message: 'Your reset session expired. Please start again.',
  });
}

function resendCooldown(retryAfterSeconds: number) {
  return new HttpException(
    {
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      code: 'RESET_COOLDOWN',
      message: `Please wait ${retryAfterSeconds}s before requesting another code.`,
      retryAfterSeconds,
    },
    HttpStatus.TOO_MANY_REQUESTS,
  );
}

/**
 * The email-OTP password reset, in three moves: request a code, trade the code
 * for a ticket, then set a password with the ticket.
 *
 * Everything secret is stored hashed — the code with argon2, the ticket with
 * SHA-256, the same way sessions are kept — so the database alone cannot be
 * replayed. The request step answers identically for known and unknown emails,
 * so the endpoint cannot be used to discover who has an account.
 */
@Injectable()
export class PasswordResetService {
  private readonly ttlMinutes: number;
  private readonly ttlMs: number;
  private readonly maxAttempts: number;
  private readonly cooldownMs: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    config: ConfigService,
  ) {
    this.ttlMinutes = config.getOrThrow<number>('RESET_CODE_TTL_MINUTES');
    this.ttlMs = this.ttlMinutes * 60 * 1000;
    this.maxAttempts = config.getOrThrow<number>('RESET_CODE_MAX_ATTEMPTS');
    this.cooldownMs =
      config.getOrThrow<number>('RESET_RESEND_COOLDOWN_SECONDS') * 1000;
  }

  /** Mails a fresh code. Unknown and uncooldown'd emails both end in silence. */
  async request(email: string): Promise<void> {
    const now = new Date();
    const admin = await this.prisma.adminUser.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!admin) return;

    const last = await this.prisma.passwordResetCode.findFirst({
      where: { adminUserId: admin.id, consumedAt: null },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    if (last) {
      const elapsedMs = now.getTime() - last.createdAt.getTime();
      if (elapsedMs < this.cooldownMs) {
        throw resendCooldown(Math.ceil((this.cooldownMs - elapsedMs) / 1000));
      }
    }

    const code = randomInt(0, CODE_CEILING)
      .toString()
      .padStart(CODE_LENGTH, '0');

    const codeHash = await hash(code, ARGON2_OPTIONS);

    await this.prisma.$transaction([
      // Opportunistic cleanup; nothing else prunes spent codes.
      this.prisma.passwordResetCode.deleteMany({
        where: {
          adminUserId: admin.id,
          OR: [{ expiresAt: { lte: now } }, { consumedAt: { not: null } }],
        },
      }),
      this.prisma.passwordResetCode.create({
        data: {
          adminUserId: admin.id,
          codeHash,
          expiresAt: new Date(now.getTime() + this.ttlMs),
        },
      }),
    ]);

    try {
      await this.email.sendPasswordResetCode({
        to: admin.email,
        code,
        expiresInMinutes: this.ttlMinutes,
      });
    } catch (error) {
      // A code nobody received must not stay valid.
      await this.prisma.passwordResetCode.deleteMany({
        where: { adminUserId: admin.id, consumedAt: null },
      });
      throw error;
    }
  }

  /** Checks the code and trades it for a single-use ticket. */
  async verify(email: string, code: string): Promise<{ ticket: string }> {
    const now = new Date();
    const admin = await this.prisma.adminUser.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!admin) throw invalidCode(0);

    const record = await this.prisma.passwordResetCode.findFirst({
      where: {
        adminUserId: admin.id,
        consumedAt: null,
        verifiedAt: null,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, codeHash: true, attempts: true },
    });

    if (!record) throw codeExpired();
    if (record.attempts >= this.maxAttempts) throw codeExhausted();

    // Count the guess before checking it, so a crash cannot buy extra attempts.
    await this.prisma.passwordResetCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });

    if (!(await this.verifyQuietly(record.codeHash, code))) {
      throw invalidCode(this.maxAttempts - (record.attempts + 1));
    }

    const ticket = createSessionToken();

    await this.prisma.passwordResetCode.update({
      where: { id: record.id },
      data: {
        verifiedAt: now,
        ticketHash: hashSessionToken(ticket),
        // The ticket gets its own full window to finish the flow.
        expiresAt: new Date(now.getTime() + this.ttlMs),
      },
    });

    return { ticket };
  }

  /**
   * Sets the new password and ends every session for the account. A reset is
   * what someone does when they suspect the old password is compromised, so
   * no device stays signed in.
   */
  async complete(ticket: string, password: string): Promise<void> {
    const now = new Date();
    const record = await this.prisma.passwordResetCode.findUnique({
      where: { ticketHash: hashSessionToken(ticket) },
      select: {
        id: true,
        adminUserId: true,
        verifiedAt: true,
        consumedAt: true,
        expiresAt: true,
      },
    });

    if (
      !record ||
      record.verifiedAt === null ||
      record.consumedAt !== null ||
      record.expiresAt <= now
    ) {
      throw ticketExpired();
    }

    const passwordHash = await hash(password, ARGON2_OPTIONS);

    await this.prisma.$transaction([
      this.prisma.adminUser.update({
        where: { id: record.adminUserId },
        data: {
          passwordHash,
          // They just chose it, and a lockout must not outlive a reset.
          mustChangePassword: false,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }),
      this.prisma.adminSession.deleteMany({
        where: { adminUserId: record.adminUserId },
      }),
      this.prisma.passwordResetCode.update({
        where: { id: record.id },
        data: { consumedAt: now },
      }),
      this.prisma.passwordResetCode.deleteMany({
        where: { adminUserId: record.adminUserId, id: { not: record.id } },
      }),
    ]);
  }

  private async verifyQuietly(codeHash: string, code: string) {
    try {
      return await verify(codeHash, code);
    } catch {
      // A malformed hash in the database must never read as a match.
      return false;
    }
  }
}
