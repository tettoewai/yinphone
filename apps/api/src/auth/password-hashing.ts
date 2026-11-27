import { argon2id } from 'argon2';

/**
 * argon2id at the OWASP minimum (19 MiB, t=2), shared by every place that
 * writes an admin password — sign-in rotation and staff invites — so the
 * stored hashes always use the same parameters.
 */
export const ARGON2_OPTIONS = {
  type: argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;
