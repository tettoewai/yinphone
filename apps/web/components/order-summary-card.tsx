"use client"

import {
  ArrowUpRight,
  Check,
  ClipboardList,
  Clock,
  Copy,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Send,
  X,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

import { cn } from "@workspace/ui/lib/utils"

import { formatPrice, toMyanmarDigits } from "@/components/catalog-data"
import {
  buildOrderLine,
  buildOrderMessage,
  getOrderTotal,
  MAX_ORDER_QTY,
  MIN_ORDER_QTY,
  type OrderDraft,
} from "@/components/order-data"
import { createOrder } from "@/lib/api"
import { channelSupportsPrefill, chatHref, type ChatChannel } from "@/lib/chat"
import { useClipboard } from "@/lib/use-clipboard"

type OrderSummaryCardProps = {
  /** Database id — what the orders API keys on. */
  productId: string
  /** Slug — used for links back to the product. */
  productSlug: string
  image: string
  alt: string
  title: string
  subtitle: string
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
  subtitle,
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
  const [origin, setOrigin] = useState("")
  const [placedCode, setPlacedCode] = useState<string | null>(null)
  const [isPlacing, setIsPlacing] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const [placeError, setPlaceError] = useState("")
  const { copiedKey, copy } = useClipboard()

  // Resolved after mount: the message needs an absolute product URL.
  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const name = customerName.trim()
  const phone = customerPhone.trim()
  const phoneDigits = phone.replace(/\D/g, "")

  const phoneFormatError =
    phone && (phoneDigits.length < 7 || phoneDigits.length > 15)
      ? "ဖုန်းနံပါတ် မမှန်ပါ • Enter a valid phone number"
      : ""
  // The API will not accept an order without a name and a phone number.
  const nameError = showErrors && !name ? "အမည် ဖြည့်ပါ • Enter your name" : ""
  const phoneError =
    phoneFormatError ||
    (showErrors && !phone
      ? "ဖုန်းနံပါတ် ဖြည့်ပါ • Enter your phone number"
      : "")

  const draft: OrderDraft = {
    title,
    subtitle,
    unitPrice: price,
    qty,
    size,
    colorName,
  }
  const total = getOrderTotal(draft)
  const orderLine = buildOrderLine(draft)
  const productHref = `/products/${productSlug}`
  const productUrl = origin ? `${origin}${productHref}` : productHref

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
   * Registers the order so the shop has it — with its real code — before the
   * chat opens. Prices are resolved by the API, never sent from this form.
   */
  async function placeOrder(channel: ChatChannel) {
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
      setPlaceError(
        "အမှာစာ မပို့နိုင်ပါ • Could not place the order. Please try again."
      )

      return null
    } finally {
      setIsPlacing(false)
    }
  }

  async function handleChannelClick(channel: ChatChannel) {
    if (isPlacing) return

    if (!isPlaced && (phoneFormatError || !name || !phone)) {
      setShowErrors(true)
      return
    }

    // Opened before the await so the browser still counts it as a click.
    const pendingWindow = channel === "viber" ? null : window.open("", "_blank")

    const code = placedCode ?? (await placeOrder(channel))

    if (!code) {
      pendingWindow?.close()
      return
    }

    const finalMessage = buildOrderMessage(draft, {
      code,
      customerName: name || undefined,
      customerPhone: phone || undefined,
      productUrl,
    })

    // Telegram carries the text in the deep link; Messenger and Viber cannot,
    // so put the order on the clipboard for the customer to paste.
    if (!channelSupportsPrefill(channel)) {
      void copy(finalMessage, channel)
    }

    const href = chatHref(channel, finalMessage)

    if (pendingWindow) {
      pendingWindow.opener = null
      pendingWindow.location.href = href
      return
    }

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
            Order summary
          </h2>
          <p className="-mt-0.5 font-body text-xs leading-[1.7] text-muted-foreground">
            မှာယူမှု အကျဉ်း • Chat ရွေးပြီး ပို့လိုက်ပါ
          </p>
        </div>
        <Link
          href={productHref}
          aria-label="Close order summary"
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
          <div className="truncate text-xs text-muted-foreground">
            {subtitle}
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
          {formatPrice(price)}
        </div>
      </div>

      <div className="flex items-center justify-between px-5 pt-3">
        <div className="flex items-center overflow-hidden rounded-md border border-border">
          <button
            type="button"
            onClick={() => setQty((value) => clampQty(value - 1, maxQty))}
            disabled={qty <= MIN_ORDER_QTY || isLocked}
            aria-label="Decrease quantity"
            className="flex h-[44px] w-[44px] items-center justify-center text-muted-foreground disabled:opacity-50"
          >
            <Minus className="size-[17px]" strokeWidth={2.82} />
          </button>
          <div
            aria-live="polite"
            className="w-8 text-center text-base font-bold text-foreground"
          >
            {qty}
          </div>
          <button
            type="button"
            onClick={() => setQty((value) => clampQty(value + 1, maxQty))}
            disabled={qty >= maxQty || isLocked}
            aria-label="Increase quantity"
            className="flex h-[44px] w-[44px] items-center justify-center bg-primary text-primary-foreground disabled:opacity-50"
          >
            <Plus className="size-[17px]" strokeWidth={2.82} />
          </button>
        </div>

        <div className="text-right">
          <div className="font-body text-xs leading-none text-muted-foreground">
            စုစုပေါင်း • Total
          </div>
          <div className="mt-1 font-heading text-xl font-bold text-primary">
            {formatPrice(total)}
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
          {`အများဆုံး ${toMyanmarDigits(maxQty)} ထည် • Max ${maxQty} per order`}
        </div>
      </div>

      <div className="mx-5 mt-3 flex flex-col gap-2">
        <div className="text-sm font-semibold text-foreground">
          သင့်အချက်အလက်{" "}
          <span className="font-normal text-muted-foreground">• Required</span>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">အမည် • Name</span>
          <input
            type="text"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            maxLength={60}
            autoComplete="name"
            disabled={isLocked}
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? "order-name-error" : undefined}
            placeholder="Ma Thida"
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
          <span className="text-xs text-muted-foreground">ဖုန်း • Phone</span>
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
            placeholder="09 xxx xxx xxx"
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
            အမှာစာ အသင့်ဖြစ်ပါပြီ • Order ready
          </div>
          <p className="pt-1 font-body text-xs leading-[1.7] text-secondary-foreground">
            {placedCode} • Chat ကို ဖွင့်ပြီး အမှာစာကို ပို့လိုက်ပါ။
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
          <span>{copiedKey === "line" ? "Copied" : "Copy"}</span>
        </button>
      </div>

      <div className="flex flex-col gap-2 px-5 pt-3">
        <a
          href={chatHref("messenger", message)}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={isPlacing}
          onClick={(event) => {
            event.preventDefault()
            void handleChannelClick("messenger")
          }}
          className={cn(
            "flex min-h-[52px] w-full items-center justify-center gap-2 rounded-md bg-messenger text-[15px] font-bold text-primary-foreground",
            isPlacing && "pointer-events-none opacity-50"
          )}
        >
          <MessageCircle className="size-[19px]" strokeWidth={2.53} />
          <span className="font-body leading-[1.7]">
            Messenger တွင် ဆက်မှာရန်
          </span>
          <ArrowUpRight className="size-4" strokeWidth={3} />
        </a>

        <div className="flex gap-2">
          <a
            href={chatHref("viber", message)}
            aria-disabled={isPlacing}
            onClick={(event) => {
              event.preventDefault()
              void handleChannelClick("viber")
            }}
            className={cn(
              "flex min-h-[48px] flex-1 items-center justify-center gap-1.5 rounded-md bg-viber text-sm font-bold text-white",
              isPlacing && "pointer-events-none opacity-50"
            )}
          >
            <Phone className="size-4" strokeWidth={3} />
            Viber
          </a>
          <a
            href={chatHref("telegram", message)}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={isPlacing}
            onClick={(event) => {
              event.preventDefault()
              void handleChannelClick("telegram")
            }}
            className={cn(
              "flex min-h-[48px] flex-1 items-center justify-center gap-1.5 rounded-md bg-telegram text-sm font-bold text-white",
              isPlacing && "pointer-events-none opacity-50"
            )}
          >
            <Send className="size-4" strokeWidth={3} />
            Telegram
          </a>
        </div>

        <p className="text-center font-body text-[11px] leading-[1.7] text-muted-foreground">
          Messenger/Viber တွင် အမှာစာကို paste လုပ်ရန် copy လုပ်ပေးထားပါတယ်။
          Telegram တွင် အလိုအလျောက် ထည့်ပေးထားပါတယ်။
        </p>

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
            {copiedKey === "details"
              ? "Order details copied"
              : "Copy order details"}
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
            ဆိုင်ဖွင့်ချိန် (10:00–20:00) အတွင်း ၁ နာရီအတွင်း ပြန်ဖြေပေးပါတယ်။
            <br />
            We reply within 1 hour during shop hours (10:00–20:00).
          </p>
        </div>
      </div>
    </div>
  )
}
