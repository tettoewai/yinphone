/**
 * A one-channel signal for "the API says this session is gone".
 *
 * `lib/api.ts` has no React context, so it cannot open a dialog itself. It
 * notifies here instead and `SessionExpiredDialog` subscribes while mounted.
 * Notifying is deliberately fire-and-forget: several requests can 401 in the
 * same tick and the dialog only needs to be open once.
 */

type SessionExpiryListener = () => void

const listeners = new Set<SessionExpiryListener>()

/** Subscribe to expired-session signals; returns the unsubscribe function. */
export function onSessionExpired(listener: SessionExpiryListener) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

/** Called by the API client on a 401 that is not a credentials failure. */
export function notifySessionExpired() {
  for (const listener of listeners) listener()
}
