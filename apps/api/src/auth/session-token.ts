import { createHash, randomBytes } from 'node:crypto';

/** Name of the httpOnly cookie that carries the admin session token. */
export const SESSION_COOKIE = 'yp_session';

/** Sent with every admin request; the API is never mounted under a subpath. */
export const SESSION_COOKIE_PATH = '/';

/**
 * Opaque 256-bit session token. Only its SHA-256 hash is persisted, so a
 * database leak does not hand out usable sessions.
 */
export function createSessionToken() {
  return randomBytes(32).toString('base64url');
}

export function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Reads a single cookie out of the `Cookie` header. Hand-rolled to avoid a
 * `cookie-parser` dependency; malformed encoding means "not this cookie".
 */
export function readCookie(header: string | undefined, name: string) {
  if (!header) return undefined;

  for (const pair of header.split(';')) {
    const separator = pair.indexOf('=');
    if (separator === -1) continue;
    if (pair.slice(0, separator).trim() !== name) continue;

    try {
      return decodeURIComponent(pair.slice(separator + 1).trim());
    } catch {
      return undefined;
    }
  }

  return undefined;
}
