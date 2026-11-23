import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

import { AuthService, type AdminView } from './auth.service.js';
import { SESSION_COOKIE, readCookie } from './session-token.js';

/** Request decorated by `AdminAuthGuard` once a session has been resolved. */
export interface AdminRequest extends Request {
  admin: AdminView;
  adminSessionId: string;
  sessionToken: string;
}

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AdminRequest>();
    const token = readCookie(request.headers.cookie, SESSION_COOKIE);

    if (!token) {
      throw new UnauthorizedException({
        statusCode: 401,
        code: 'NOT_SIGNED_IN',
        message: 'Sign in to continue',
      });
    }

    const session = await this.auth.resolveSession(token);

    if (!session) {
      throw new UnauthorizedException({
        statusCode: 401,
        code: 'SESSION_EXPIRED',
        message: 'Your session has expired. Sign in again.',
      });
    }

    request.admin = session.user;
    request.adminSessionId = session.sessionId;
    request.sessionToken = token;

    return true;
  }
}
