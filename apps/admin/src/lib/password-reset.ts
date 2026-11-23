/**
 * Front-end stand-in for the email-OTP password reset.
 *
 * Nothing here talks to a server: no email is sent, and any 6-digit code is
 * accepted. It exists so the screens can be built and reviewed before the
 * Resend-backed endpoints land.
 *
 * To go live, keep the signatures and replace the bodies with calls to:
 *
 *   POST /api/auth/password-reset/request   { email }            → 204
 *   POST /api/auth/password-reset/verify    { email, code }      → { ticket }
 *   POST /api/auth/password-reset/complete  { ticket, password } → 204
 *
 * `ticket` should be whatever the server hands back to prove the code was
 * verified — a short-lived signed token rather than the email itself.
 */

const NETWORK_DELAY_MS = 700

export const RESET_CODE_LENGTH = 6
export const RESEND_COOLDOWN_SECONDS = 30
export const RESET_CODE_TTL_MINUTES = 10

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function requestResetCode(email: string) {
  await wait(NETWORK_DELAY_MS)

  return {
    email,
    expiresAt: Date.now() + RESET_CODE_TTL_MINUTES * 60 * 1000,
  }
}

export async function verifyResetCode(email: string, code: string) {
  await wait(NETWORK_DELAY_MS)

  if (code.length !== RESET_CODE_LENGTH) {
    throw new Error("Enter the 6-digit code from the email")
  }

  return { ticket: `demo-ticket-${Date.now()}`, email }
}

export async function completePasswordReset(ticket: string, password: string) {
  await wait(NETWORK_DELAY_MS)

  // Enough shape-checking to keep the UI honest once a server is involved.
  if (!ticket) {
    throw new Error("Your reset session expired. Please start again.")
  }

  if (password.length < 8) {
    throw new Error("Password is too short")
  }
}
