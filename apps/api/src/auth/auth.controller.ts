import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

import { AdminAuthGuard } from './admin-auth.guard.js';
import { AuthService, type AdminView } from './auth.service.js';
import { CurrentAdmin } from './current-admin.decorator.js';
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from './dto/change-password.schema.js';
import {
  completePasswordResetSchema,
  type CompletePasswordResetInput,
} from './dto/complete-password-reset.schema.js';
import { loginSchema, type LoginInput } from './dto/login.schema.js';
import {
  requestPasswordResetSchema,
  type RequestPasswordResetInput,
} from './dto/request-password-reset.schema.js';
import {
  verifyPasswordResetSchema,
  type VerifyPasswordResetInput,
} from './dto/verify-password-reset.schema.js';
import { PasswordResetService } from './password-reset.service.js';
import {
  clearSessionCookieOptions,
  sessionCookieOptions,
} from './session-cookie.js';
import { SESSION_COOKIE, readCookie } from './session-token.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly passwordReset: PasswordResetService,
    private readonly config: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body({ schema: loginSchema }) input: LoginInput,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { token, expiresAt, user } = await this.auth.login(
      input,
      request.get('user-agent'),
    );

    response.cookie(
      SESSION_COOKIE,
      token,
      sessionCookieOptions(this.config, expiresAt),
    );

    return { user, expiresAt: expiresAt.toISOString() };
  }

  @Get('me')
  @UseGuards(AdminAuthGuard)
  me(@CurrentAdmin() admin: AdminView) {
    return { user: admin };
  }

  /**
   * Deliberately unguarded: an expired session should still clear the cookie
   * and answer 204 instead of bouncing the client with a 401.
   */
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.auth.logout(readCookie(request.headers.cookie, SESSION_COOKIE));
    response.clearCookie(
      SESSION_COOKIE,
      clearSessionCookieOptions(this.config),
    );
  }

  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AdminAuthGuard)
  async changePassword(
    @CurrentAdmin() admin: AdminView,
    @Body({ schema: changePasswordSchema }) input: ChangePasswordInput,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { token, expiresAt } = await this.auth.changePassword(
      admin.id,
      input,
      request.get('user-agent'),
    );

    // Every other session was just revoked, so this device gets the new token.
    response.cookie(
      SESSION_COOKIE,
      token,
      sessionCookieOptions(this.config, expiresAt),
    );
  }

  /**
   * The three reset moves are unguarded on purpose: the caller has forgotten
   * their password and is signed out.
   *
   * `request` answers 204 for an unknown email too, so it cannot be used to
   * discover which addresses have an account.
   */
  @Post('password-reset/request')
  @HttpCode(HttpStatus.NO_CONTENT)
  async requestPasswordReset(
    @Body({ schema: requestPasswordResetSchema })
    input: RequestPasswordResetInput,
  ) {
    await this.passwordReset.request(input.email);
  }

  @Post('password-reset/verify')
  @HttpCode(HttpStatus.OK)
  verifyPasswordReset(
    @Body({ schema: verifyPasswordResetSchema })
    input: VerifyPasswordResetInput,
  ) {
    return this.passwordReset.verify(input.email, input.code);
  }

  /** Ends every session for the account, so the next sign-in uses the new password. */
  @Post('password-reset/complete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async completePasswordReset(
    @Body({ schema: completePasswordResetSchema })
    input: CompletePasswordResetInput,
  ) {
    await this.passwordReset.complete(input.ticket, input.password);
  }
}
