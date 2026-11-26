/**
 * Types, mock rows and the pure helpers behind `/channels`.
 *
 * This is the screen that will own the shop's public chat links, so the mock
 * carries the design's three channels and the exact links it shows — including
 * Telegram's `telegram.me/...`, which fails the `t.me/` rule and is what puts
 * the design's validation warning on screen.
 *
 * `OrderChannel` is what `GET /api/channels` should return. Channel identity is
 * the shared `ChannelSlug` from `lib/orders.ts`, so the dashboard split, the
 * orders table and this screen can never disagree about which channels exist.
 * Nothing here imports React.
 */

import type { ChannelSlug } from "@/lib/orders"

export type OrderChannel = {
  key: ChannelSlug
  nameMy: string
  nameEn: string
  /** Sample volume for the meta line; not fetched yet. */
  orderCount: number
  /** The shop's public chat link, editable on this screen. */
  link: string
  /** Switched on the storefront. Disabling hides the button, not the history. */
  isEnabled: boolean
}

/** A bilingual line of copy — Burmese first, then the Latin translation. */
export type ChannelMessage = {
  my: string
  en: string
}

/**
 * The design's rows. The counts are sample figures, not the dashboard's
 * channel split, and Telegram starts switched off — which is why the card shows
 * "past orders kept" and the storefront preview labels it "off".
 */
export const CHANNELS_MOCK: readonly OrderChannel[] = [
  {
    key: "messenger",
    nameMy: "မက်ဆင်ဂျာ",
    nameEn: "Messenger",
    orderCount: 14,
    link: "https://m.me/yinphone.boutique",
    isEnabled: true,
  },
  {
    key: "viber",
    nameMy: "ဗိုင်ဘာ",
    nameEn: "Viber",
    orderCount: 6,
    link: "viber://chat?number=959123456789",
    isEnabled: true,
  },
  {
    key: "telegram",
    nameMy: "တယ်လီဂရမ်",
    nameEn: "Telegram",
    orderCount: 4,
    link: "telegram.me/yinphone",
    isEnabled: false,
  },
]

type ChannelRule = {
  /** Lowercased prefix a valid link must start with, after the scheme is stripped. */
  prefix: string
  hint: ChannelMessage
  invalid: ChannelMessage
}

const CHANNEL_RULES: Record<ChannelSlug, ChannelRule> = {
  messenger: {
    prefix: "m.me/",
    hint: {
      my: "Page Settings → Messaging → m.me လင့်ခ်ကို ကူးယူပါ။",
      en: "Copy your m.me link from Page Messaging settings.",
    },
    invalid: {
      my: "https://m.me/ ဖြင့် စရမည်။",
      en: "URL must start with m.me/ for Messenger.",
    },
  },
  viber: {
    prefix: "viber://chat",
    hint: {
      my: "Viber → More → QR & link ကို ရယူပါ။",
      en: "Get your public chat link from Viber More menu.",
    },
    invalid: {
      my: "viber://chat ဖြင့် စရမည်။",
      en: "URL must start with viber://chat for Viber.",
    },
  },
  telegram: {
    prefix: "t.me/",
    hint: {
      my: "t.me/ ဖြင့် စသော လင့်ခ် ထည့်ပါ။",
      en: "Use your public t.me/ link.",
    },
    invalid: {
      my: "t.me/ ဖြင့် စရမည် — telegram.me မမှန်ပါ။",
      en: "URL must start with t.me/ for Telegram.",
    },
  },
}

const REQUIRED: ChannelMessage = {
  my: "လင့်ခ် ထည့်ပါ။",
  en: "Link is required.",
}

/** Drops a leading `http(s)://` so `https://t.me/x` and `t.me/x` validate alike. */
function stripWebScheme(link: string) {
  return link.toLowerCase().replace(/^https?:\/\//, "")
}

/**
 * The card's hint — how to find the link in that provider's app. Always shown
 * under the field unless the current link is invalid.
 */
export function channelHint(channel: OrderChannel): ChannelMessage {
  return CHANNEL_RULES[channel.key].hint
}

/**
 * What to tell the owner about the link, or `undefined` while it is valid.
 * A disabled channel is still validated: the design surfaces Telegram's bad
 * link while it is switched off, so the fix is visible before it reopens.
 */
export function channelLinkError(
  channel: OrderChannel
): ChannelMessage | undefined {
  const link = channel.link.trim()
  if (link === "") return REQUIRED

  const { prefix, invalid } = CHANNEL_RULES[channel.key]
  return stripWebScheme(link).startsWith(prefix) ? undefined : invalid
}

/** Enabled channels, in the order the design lists them. */
export function activeChannels(channels: readonly OrderChannel[]) {
  return channels.filter((channel) => channel.isEnabled)
}

/** "2 of 3 active" — the header's count and subtitle. */
export function activeChannelCount(channels: readonly OrderChannel[]) {
  return activeChannels(channels).length
}

/** Enabled channels whose link is invalid; saving stays blocked while above zero. */
export function enabledLinkIssues(channels: readonly OrderChannel[]) {
  return activeChannels(channels).filter(
    (channel) => channelLinkError(channel) !== undefined
  )
}

/** "Messenger • 14 orders this week" / "Telegram • 4 past orders kept". */
export function channelMeta(channel: OrderChannel) {
  const activity = channel.isEnabled
    ? `${channel.orderCount} orders this week`
    : `${channel.orderCount} past orders kept`
  return `${channel.nameEn} • ${activity}`
}

/**
 * Whether two channel lists hold the same edits. Used for the dirty state, so a
 * link typed and then retyped back to its saved value is not "unsaved".
 */
export function channelsMatch(
  a: readonly OrderChannel[],
  b: readonly OrderChannel[]
) {
  if (a.length !== b.length) return false

  return a.every((channel, index) => {
    const other = b[index]
    return (
      other !== undefined &&
      channel.key === other.key &&
      channel.link === other.link &&
      channel.isEnabled === other.isEnabled
    )
  })
}

/** A fresh copy of the mock so page state never mutates the module constant. */
export function channelsFromMock() {
  return CHANNELS_MOCK.map((channel) => ({ ...channel }))
}
