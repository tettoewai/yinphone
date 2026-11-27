/**
 * The email-OTP password reset, as the `/forgot-password` screen uses it.
 *
 * Three calls to the API, matching the steps of the flow:
 *
 *   POST /api/auth/password-reset/request   { email }            → 204
 *   POST /api/auth/password-reset/verify    { email, code }      → { ticket }
 *   POST /api/auth/password-reset/complete  { ticket, password } → 204
 *
 * `ticket` is short-lived proof that the code was verified — the server keeps
 * only its hash, and `complete` spends it.
 *
 * The constants here mirror the server defaults so the copy on screen matches
 * what the API enforces; they are presentation only, not a security boundary.
 */

import { authApi } from "@/lib/api"

export const RESET_CODE_LENGTH = 6
export const RESEND_COOLDOWN_SECONDS = 30
export const RESET_CODE_TTL_MINUTES = 10

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

/**
 * Asks the API to mail a code. Resolves for an unknown email too — the server
 * answers identically so the form cannot be used to probe for accounts.
 */
export async function requestResetCode(email: string) {
  await authApi.requestPasswordReset(email)

  return { email }
}

export function verifyResetCode(email: string, code: string) {
  return authApi.verifyPasswordReset(email, code)
}

export function completePasswordReset(ticket: string, password: string) {
  return authApi.completePasswordReset(ticket, password)
}
