import { z } from 'zod';

const DEFAULT_CORS_ORIGINS = ['http://localhost:3000', 'http://localhost:3001'];

/**
 * A blank value in `.env` (`COOKIE_DOMAIN=`) means "not set", so
 * `.env.example` can ship empty placeholders without breaking boot. Required
 * keys such as `DATABASE_URL` stay strict.
 */
const blankToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

/** An integer setting that falls back to `fallback` when the variable is absent or blank. */
const optionalInt = (fallback: number, min: number, max: number) =>
  z.preprocess(
    blankToUndefined,
    z.coerce.number().int().min(min).max(max).default(fallback),
  );

/**
 * Environment contract. `ConfigModule` validates this at boot and serves the
 * parsed output, so `PORT` is a number and `CORS_ORIGINS` an array.
 */
export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().min(1),
  CORS_ORIGINS: z.preprocess(
    blankToUndefined,
    z
      .string()
      .default(DEFAULT_CORS_ORIGINS.join(','))
      .transform((value) =>
        value
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean),
      ),
  ),
  /** Hours a normal sign-in stays valid. */
  SESSION_TTL_HOURS: optionalInt(12, 1, 168),
  /** Days a "remember this device" sign-in stays valid. */
  SESSION_REMEMBER_DAYS: optionalInt(30, 1, 90),
  /** Failed sign-ins allowed before the account locks. */
  LOGIN_MAX_ATTEMPTS: optionalInt(5, 1, 20),
  /** How long a locked account stays locked, in minutes. */
  LOGIN_LOCK_MINUTES: optionalInt(5, 1, 1440),
  /**
   * Forces the `Secure` cookie flag. Defaults to on in production; set it to
   * `false` to test the admin app over plain HTTP on another host.
   */
  COOKIE_SECURE: z.preprocess(
    blankToUndefined,
    z
      .enum(['true', 'false'])
      .optional()
      .transform((value) =>
        value === undefined ? undefined : value === 'true',
      ),
  ),
  /** Shares the session cookie with sibling subdomains, e.g. `.yinphone.shop`. */
  COOKIE_DOMAIN: z.preprocess(
    blankToUndefined,
    z.string().trim().min(1).optional(),
  ),
});

export type Env = z.infer<typeof envSchema>;
