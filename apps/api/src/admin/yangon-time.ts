/**
 * Asia/Yangon day arithmetic shared by the admin screens.
 *
 * The shop runs on UTC+6:30 with no daylight saving, so shifting into
 * "wall-clock milliseconds" and flooring to a day boundary is safe.
 */

/** Milliseconds in a day. */
export const DAY_MS = 86_400_000;

/** Asia/Yangon is a fixed UTC+6:30 with no daylight saving, so a constant works. */
export const YANGON_OFFSET_MS = (6 * 60 + 30) * 60_000;

/** The instant Asia/Yangon's calendar day containing `value` began. */
export function startOfYangonDay(value: Date) {
  const shifted = value.getTime() + YANGON_OFFSET_MS;
  return new Date(Math.floor(shifted / DAY_MS) * DAY_MS - YANGON_OFFSET_MS);
}

/**
 * `YYYY-MM-DD` for the Asia/Yangon calendar day containing `value`.
 *
 * Shifting then formatting as UTC makes the ISO date components equal to the
 * Yangon wall-clock date.
 */
export function yangonDateKey(value: Date) {
  return new Date(value.getTime() + YANGON_OFFSET_MS)
    .toISOString()
    .slice(0, 10);
}
