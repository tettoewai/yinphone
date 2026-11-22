import { CONTACT } from "@/components/contact-data"

export type ChatChannel = "messenger" | "viber" | "telegram"

/**
 * Chat deep links. Telegram supports a prefilled message; Messenger and Viber
 * do not, so those channels rely on the copied order text being pasted.
 */
export function chatHref(channel: ChatChannel, message?: string) {
  const text = message ?? ""

  switch (channel) {
    case "messenger":
      return CONTACT.messengerUrl
    case "viber":
      return CONTACT.viberHref
    case "telegram":
      return text
        ? `${CONTACT.telegramUrl}?text=${encodeURIComponent(text)}`
        : CONTACT.telegramUrl
  }
}

/** Whether the channel can carry the message without the customer pasting. */
export function channelSupportsPrefill(channel: ChatChannel) {
  return channel === "telegram"
}
