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
import { loginSchema, type LoginInput } from './dto/login.schema.js';
import {
  clearSessionCookieOptions,
  sessionCookieOptions,
} from './session-cookie.js';
import { SESSION_COOKIE, readCookie } from './session-token.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
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
}
