import type { ConfigService } from '@nestjs/config';
import type { CookieOptions } from 'express';

import { SESSION_COOKIE, SESSION_COOKIE_PATH } from './session-token.js';

/**
 * Flags shared by the set and clear calls. `sameSite: 'lax'` is what keeps
 * cross-site POSTs from carrying the cookie, so no separate CSRF token is
 * needed for the admin app.
 */
function baseCookieOptions(config: ConfigService): CookieOptions {
  const secure =
    config.get<boolean>('COOKIE_SECURE') ??
    config.get<string>('NODE_ENV') === 'production';
  const domain = config.get<string>('COOKIE_DOMAIN');

  return {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: SESSION_COOKIE_PATH,
    ...(domain ? { domain } : {}),
  };
}

export function sessionCookieOptions(
  config: ConfigService,
  expiresAt: Date,
): CookieOptions {
  return { ...baseCookieOptions(config), expires: expiresAt };
}

/** `clearCookie` needs the same path/domain/secure flags as the original write. */
export function clearSessionCookieOptions(
  config: ConfigService,
): CookieOptions {
  return baseCookieOptions(config);
}

export { SESSION_COOKIE };
