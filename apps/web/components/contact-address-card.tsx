"use client"

import { Check, Copy, Navigation, Store } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { CONTACT } from "@/components/contact-data"

export default function ContactAddressCard() {
  const [isCopied, setIsCopied] = useState(false)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current)
    }
  }, [])

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT.addressEn)
      setIsCopied(true)
      if (timeout.current) clearTimeout(timeout.current)
      timeout.current = setTimeout(() => setIsCopied(false), 2000)
    } catch {
      // Clipboard access was denied, so the button keeps its label.
    }
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-2.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary">
          <Store className="size-[19px] text-primary" strokeWidth={2.53} />
        </span>
        <div>
          <div className="font-body text-sm leading-[1.7] font-bold text-foreground">
            {CONTACT.addressMy}
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {CONTACT.addressEn}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <a
          href={CONTACT.directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-md bg-primary text-sm font-bold text-primary-foreground"
        >
          <Navigation className="size-[15px]" strokeWidth={3.2} />
          <span className="font-body">လမ်းညွှန်ကြည့်ရန်</span>
        </a>

        <button
          type="button"
          onClick={copyAddress}
          aria-label={isCopied ? "Address copied" : "Copy address"}
          className="flex min-h-[44px] items-center gap-1.5 rounded-md bg-secondary px-4 text-sm font-semibold text-secondary-foreground"
        >
          {isCopied ? (
            <Check className="size-[15px]" strokeWidth={3.2} />
          ) : (
            <Copy className="size-[15px]" strokeWidth={3.2} />
          )}
          <span>{isCopied ? "Copied" : "Copy"}</span>
        </button>
      </div>
    </div>
  )
}
