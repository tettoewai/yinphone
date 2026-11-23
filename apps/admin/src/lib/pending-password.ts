/**
 * `POST /api/auth/change-password` requires the current password, but the
 * forced-reset screen (see `design/reset-password.html`) only asks for a new
 * one. The password typed into the login form is therefore held here for the
 * length of the reset step.
 *
 * Deliberately in memory only: not in `localStorage`, `sessionStorage`, or the
 * URL. Reloading the page loses it, and the user has to sign in again — which
 * is the correct failure mode for a credential.
 */

let pendingPassword: string | null = null

export function rememberPassword(password: string) {
  pendingPassword = password
}

export function peekPassword() {
  return pendingPassword
}

export function forgetPassword() {
  pendingPassword = null
}
