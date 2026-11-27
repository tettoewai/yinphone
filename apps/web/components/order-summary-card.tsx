"use client"

import {
  ArrowUpRight,
  Check,
  ClipboardList,
  Clock,
  Copy,
  Loader2,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Send,
  ShoppingBag,
  X,
  type LucideIcon,
} from "lucide-react"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"
import { cn } from "@workspace/ui/lib/utils"

import {
  buildOrderLine,
  buildOrderMessage,
  getOrderTotal,
  MAX_ORDER_QTY,
  MIN_ORDER_QTY,
  type OrderDraft,
} from "@/components/order-data"
import { Link } from "@/i18n/navigation"
import { createOrder } from "@/lib/api"
import { channelSupportsPrefill, chatHref, type ChatChannel } from "@/lib/chat"
import { formatDigits, formatPrice } from "@/lib/format"
import { useClipboard } from "@/lib/use-clipboard"

type ChannelOption = {
  id: ChatChannel
  label: string
  icon: LucideIcon
}

/** Contact-preference choices. The order itself never leaves the app. */
const CHANNELS: readonly ChannelOption[] = [
  { id: "messenger", label: "Messenger", icon: MessageCircle },
  { id: "viber", label: "Viber", icon: Phone },
  { id: "telegram", label: "Telegram", icon: Send },
]

/** Brand colours only apply to the pressed segment. */
const CHANNEL_ACTIVE: Record<ChatChannel, string> = {
  messenger:
    "aria-pressed:bg-messenger aria-pressed:text-primary-foreground aria-pressed:hover:bg-messenger aria-pressed:hover:text-primary-foreground",
  viber:
    "aria-pressed:bg-viber aria-pressed:text-white aria-pressed:hover:bg-viber aria-pressed:hover:text-white",
  telegram:
    "aria-pressed:bg-telegram aria-pressed:text-white aria-pressed:hover:bg-telegram aria-pressed:hover:text-white",
}

function ChannelIcon({
  channel,
  className,
}: {
  channel: ChatChannel
  className?: string
}) {
  const Icon =
    CHANNELS.find((option) => option.id === channel)?.icon ?? MessageCircle

  return <Icon className={className} strokeWidth={2.53} />
}

type OrderSummaryCardProps = {
  /** Database id — what the orders API keys on. */
  productId: string
  /** Slug — used for links back to the product. */
  productSlug: string
  image: string
  alt: string
  /** Product name in the active locale. */
  title: string
  /** Myanmar name, used in the message the shop receives. */
  shopTitle: string
  price: number
  size?: string
  colorName?: string
  colorHex?: string
  initialQty: number
  stockLeft?: number
}

function clampQty(value: number, maxQty: number) {
  return Math.min(maxQty, Math.max(MIN_ORDER_QTY, value))
}

export default function OrderSummaryCard({
  productId,
  productSlug,
  image,
  alt,
  title,
  shopTitle,
  price,
  size,
  colorName,
  colorHex,
  initialQty,
  stockLeft,
}: OrderSummaryCardProps) {
  const maxQty = Math.max(
    MIN_ORDER_QTY,
    Math.min(MAX_ORDER_QTY, stockLeft ?? MAX_ORDER_QTY)
  )

  const [qty, setQty] = useState(() => clampQty(initialQty, maxQty))
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [channel, setChannel] = useState<ChatChannel>("messenger")
  const [origin, setOrigin] = useState("")
  const [placedCode, setPlacedCode] = useState<string | null>(null)
  const [isPlacing, setIsPlacing] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const [placeError, setPlaceError] = useState("")
  const { copiedKey, copy } = useClipboard()

  const locale = useLocale()
  const t = useTranslations("Order")
  const common = useTranslations("Common")

  // Resolved after mount: the message needs an absolute product URL.
  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const name = customerName.trim()
  const phone = customerPhone.trim()
  const phoneDigits = phone.replace(/\D/g, "")

  const phoneFormatError =
    phone && (phoneDigits.length < 7 || phoneDigits.length > 15)
      ? t("errors.phoneFormat")
      : ""
  // The API will not accept an order without a name and a phone number.
  const nameError = showErrors && !name ? t("errors.name") : ""
  const phoneError =
    phoneFormatError || (showErrors && !phone ? t("errors.phone") : "")

  const draft: OrderDraft = {
    title,
    shopTitle,
    unitPrice: price,
    qty,
    size,
    colorName,
  }
  const total = getOrderTotal(draft)
  const orderLine = buildOrderLine(draft, locale, t("lineLabel"))
  const productHref = `/products/${productSlug}`
  const productUrl = origin ? `${origin}${productHref}` : productHref
  const channelLabel =
    CHANNELS.find((option) => option.id === channel)?.label ?? "Messenger"

  const isPlaced = Boolean(placedCode)
  const isLocked = isPlaced || isPlacing

  // Only a confirmed order has a code; a guess would not match the database.
  const message = buildOrderMessage(draft, {
    code: placedCode ?? undefined,
    customerName: name || undefined,
    customerPhone: phone || undefined,
    productUrl,
  })

  /**
   * Registers the order with the shop. Prices are resolved by the API, never
   * sent from this form. `channel` is only a contact preference — it drives the
   * dashboard's channel split and how we confirm the order.
   */
  async function placeOrder() {
    if (placedCode) return placedCode

    setIsPlacing(true)
    setPlaceError("")

    try {
      const order = await createOrder({
        customerName: name,
        customerPhone: phone,
        channel,
        items: [
          {
            productId,
            quantity: qty,
            ...(size ? { size } : {}),
          },
        ],
      })

      setPlacedCode(order.code)

      return order.code
    } catch {
      setPlaceError(t("errors.place"))

      return null
    } finally {
      setIsPlacing(false)
    }
  }

  async function handlePlaceOrder() {
    if (isPlacing || placedCode) return

    if (phoneFormatError || !name || !phone) {
      setShowErrors(true)
      return
    }

    await placeOrder()
  }

  /**
   * Secondary action offered once the order exists: hand the same details to
   * the chosen chat app so the customer can talk to the shop there.
   */
  function openChat() {
    if (!placedCode) return

    // Telegram carries the text in the deep link; Messenger and Viber cannot,
    // so put the order on the clipboard for the customer to paste.
    if (!channelSupportsPrefill(channel)) {
      void copy(message, channel)
    }

    const href = chatHref(channel, message)

    if (channel === "viber") {
      window.location.href = href
      return
    }

    window.open(href, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="mx-4 mt-4 overflow-hidden rounded-xl bg-card">
      <div className="flex justify-center pt-2" aria-hidden="true">
        <div className="h-1 w-10 rounded-sm bg-muted" />
      </div>

      <div className="flex items-start justify-between gap-2 px-5 pt-2 pb-3">
        <div>
          <h2 className="font-body text-lg leading-[1.7] font-bold text-foreground">
            {t("title")}
          </h2>
          <p className="-mt-0.5 font-body text-xs leading-[1.7] text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <Link
          href={productHref}
          aria-label={t("close")}
          className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-md bg-secondary"
        >
          <X className="size-[19px] text-foreground" strokeWidth={2.53} />
        </Link>
      </div>

      <div className="mx-5 flex gap-3 rounded-md border border-border bg-background p-3">
        <Image
          src={image}
          alt={alt}
          width={144}
          height={144}
          className="h-[72px] w-[72px] shrink-0 rounded-md object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate font-body text-sm leading-[1.7] font-bold text-foreground">
            {title}
          </div>
          <div className="mt-1.5 flex items-center gap-1.5">
            {size ? (
              <span className="rounded-sm bg-secondary px-2 py-0.5 text-xs font-bold text-foreground">
                {size}
              </span>
            ) : null}
            {colorHex ? (
              <span
                className="inline-block h-4 w-4 rounded-xl border border-border"
                style={{ backgroundColor: colorHex }}
              />
            ) : null}
            {colorName ? (
              <span className="text-xs text-muted-foreground">{colorName}</span>
            ) : null}
          </div>
        </div>
        <div className="shrink-0 font-heading text-sm font-bold text-primary">
          {formatPrice(price, locale)}
        </div>
      </div>

      <div className="flex items-center justify-between px-5 pt-3">
        <div className="flex items-center overflow-hidden rounded-md border border-border">
          <button
            type="button"
            onClick={() => setQty((value) => clampQty(value - 1, maxQty))}
            disabled={qty <= MIN_ORDER_QTY || isLocked}
            aria-label={common("decreaseQuantity")}
            className="flex h-[44px] w-[44px] items-center justify-center text-muted-foreground disabled:opacity-50"
          >
            <Minus className="size-[17px]" strokeWidth={2.82} />
          </button>
          <div
            aria-live="polite"
            className="w-8 text-center text-base font-bold text-foreground"
          >
            {formatDigits(qty, locale)}
          </div>
          <button
            type="button"
            onClick={() => setQty((value) => clampQty(value + 1, maxQty))}
            disabled={qty >= maxQty || isLocked}
            aria-label={common("increaseQuantity")}
            className="flex h-[44px] w-[44px] items-center justify-center bg-primary text-primary-foreground disabled:opacity-50"
          >
            <Plus className="size-[17px]" strokeWidth={2.82} />
          </button>
        </div>

        <div className="text-right">
          <div className="font-body text-xs leading-none text-muted-foreground">
            {t("total")}
          </div>
          <div className="mt-1 font-heading text-xl font-bold text-primary">
            {formatPrice(total, locale)}
          </div>
        </div>
      </div>

      <div className="px-5 pt-1">
        <div className="flex gap-1.5" aria-hidden="true">
          {Array.from({ length: maxQty }, (_, index) => (
            <div
              key={index}
              className={cn(
                "h-1 flex-1 rounded-sm",
                index < qty ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
        <div className="pt-1 font-body text-xs text-muted-foreground">
          {t("maxQty", { count: maxQty })}
        </div>
      </div>

      <div className="mx-5 mt-3 flex flex-col gap-2">
        <div className="text-sm font-semibold text-foreground">
          {t("required")}
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">{t("name")}</span>
          <input
            type="text"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            maxLength={60}
            autoComplete="name"
            disabled={isLocked}
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? "order-name-error" : undefined}
            placeholder={t("namePlaceholder")}
            className={cn(
              "min-h-[44px] w-full rounded-md border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-60",
              nameError ? "border-destructive" : "border-border"
            )}
          />
        </label>

        {nameError ? (
          <p id="order-name-error" className="text-xs text-destructive">
            {nameError}
          </p>
        ) : null}

        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">{t("phone")}</span>
          <input
            type="tel"
            inputMode="tel"
            value={customerPhone}
            onChange={(event) => setCustomerPhone(event.target.value)}
            maxLength={20}
            autoComplete="tel"
            disabled={isLocked}
            aria-invalid={Boolean(phoneError)}
            aria-describedby={phoneError ? "order-phone-error" : undefined}
            placeholder={t("phonePlaceholder")}
            className={cn(
              "min-h-[44px] w-full rounded-md border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-60",
              phoneError ? "border-destructive" : "border-border"
            )}
          />
        </label>

        {phoneError ? (
          <p id="order-phone-error" className="text-xs text-destructive">
            {phoneError}
          </p>
        ) : null}
      </div>

      {isPlaced ? (
        <div
          role="status"
          className="mx-5 mt-3 rounded-md border border-primary/40 bg-secondary px-3 py-2.5"
        >
          <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
            <Check className="size-4 text-primary" strokeWidth={3.2} />
            {t("placed")}
          </div>
          <p className="pt-1 font-heading text-sm font-bold text-primary">
            {placedCode}
          </p>
          <p className="pt-0.5 font-body text-xs leading-[1.7] text-secondary-foreground">
            {t("placedHint", { channel: channelLabel })}
          </p>
        </div>
      ) : null}

      {placeError ? (
        <div
          role="alert"
          className="mx-5 mt-3 rounded-md border border-destructive/40 bg-background px-3 py-2.5"
        >
          <p className="font-body text-xs leading-[1.7] text-destructive">
            {placeError}
          </p>
        </div>
      ) : null}

      <div className="mx-5 mt-3 flex items-center gap-2.5 rounded-md border border-dashed border-border bg-background px-3 py-2.5">
        <ClipboardList
          className="size-[17px] shrink-0 text-primary"
          strokeWidth={2.82}
        />
        <div className="min-w-0 flex-1 truncate font-body text-xs leading-[1.7] text-muted-foreground">
          {orderLine}
        </div>
        <button
          type="button"
          onClick={() => copy(orderLine, "line")}
          className="flex min-h-[44px] shrink-0 items-center gap-1 rounded-md border border-border bg-card px-3 text-xs font-bold text-primary"
        >
          {copiedKey === "line" ? (
            <Check className="size-[13px]" strokeWidth={3.69} />
          ) : (
            <Copy className="size-[13px]" strokeWidth={3.69} />
          )}
          <span>
            {copiedKey === "line" ? common("copied") : common("copy")}
          </span>
        </button>
      </div>

      <div className="flex flex-col gap-2 px-5 pt-3">
        {isPlaced ? (
          <a
            href={chatHref(channel, message)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => {
              event.preventDefault()
              openChat()
            }}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-md border border-border bg-card font-body text-sm leading-[1.7] font-bold text-foreground"
          >
            <ChannelIcon channel={channel} className="size-4" />
            <span>{t("openInChat", { channel: channelLabel })}</span>
            <ArrowUpRight className="size-4" strokeWidth={3} />
          </a>
        ) : (
          <>
            <div className="text-sm font-semibold text-foreground">
              {t("channelLabel")}
            </div>

            <ToggleGroup
              value={[channel]}
              onValueChange={(value) => {
                const next = value[0]

                if (
                  next === "messenger" ||
                  next === "viber" ||
                  next === "telegram"
                ) {
                  setChannel(next)
                }
              }}
              disabled={isPlacing}
              spacing={0}
              orientation="horizontal"
              aria-label={t("channelLabel")}
              className="grid w-full grid-cols-3 overflow-hidden rounded-md border border-border bg-card"
            >
              {CHANNELS.map(({ id, label, icon: Icon }) => (
                <ToggleGroupItem
                  key={id}
                  value={id}
                  className={cn(
                    "h-auto min-h-[48px] flex-1 flex-col gap-1 rounded-none border-l border-border px-2 py-1.5 text-[11px] font-bold text-muted-foreground first:border-l-0",
                    CHANNEL_ACTIVE[id]
                  )}
                >
                  <Icon className="size-4" strokeWidth={2.53} />
                  <span className="font-body leading-none">{label}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <button
              type="button"
              onClick={() => void handlePlaceOrder()}
              disabled={isLocked}
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-md bg-primary text-[15px] font-bold text-primary-foreground disabled:opacity-50"
            >
              {isPlacing ? (
                <Loader2
                  className="size-[19px] animate-spin"
                  strokeWidth={2.53}
                />
              ) : (
                <ShoppingBag className="size-[19px]" strokeWidth={2.53} />
              )}
              <span className="font-body leading-[1.7]">
                {isPlacing ? t("placing") : t("placeOrder")}
              </span>
            </button>

            <p className="text-center font-body text-[11px] leading-[1.7] text-muted-foreground">
              {t("noPayment")}
            </p>
          </>
        )}

        <button
          type="button"
          onClick={() => copy(message, "details")}
          className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-md border border-border bg-card font-body text-sm leading-[1.7] font-semibold text-foreground"
        >
          {copiedKey === "details" ? (
            <Check
              className="size-[15px] text-muted-foreground"
              strokeWidth={3.2}
            />
          ) : (
            <Copy
              className="size-[15px] text-muted-foreground"
              strokeWidth={3.2}
            />
          )}
          <span>
            {copiedKey === "details" ? t("detailsCopied") : t("copyDetails")}
          </span>
        </button>
      </div>

      <div className="px-5 py-4">
        <div className="flex items-start justify-center gap-2 text-center">
          <Clock
            className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
            strokeWidth={3.43}
          />
          <p className="font-body text-xs leading-[1.7] text-muted-foreground">
            {t("shopHours")}
          </p>
        </div>
      </div>
    </div>
  )
}
