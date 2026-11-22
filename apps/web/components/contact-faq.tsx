"use client"

import { Minus, Plus } from "lucide-react"
import { useId, useState } from "react"

import type { Faq } from "@/components/contact-data"
import { cn } from "@workspace/ui/lib/utils"

type ContactFaqProps = {
  items: Faq[]
}

export default function ContactFaq({ items }: ContactFaqProps) {
  const [openIndex, setOpenIndex] = useState(0)
  const baseId = useId()

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        const panelId = `${baseId}-panel-${index}`

        return (
          <div
            key={item.questionEn}
            className={cn(
              "overflow-hidden rounded-md border bg-card",
              isOpen ? "border-primary" : "border-border"
            )}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="flex min-h-[52px] w-full items-center justify-between gap-2 px-4 py-2 text-left"
            >
              <div>
                <div className="font-body text-sm leading-[1.7] font-bold text-foreground">
                  {item.question}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.questionEn}
                </div>
              </div>
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-sm",
                  isOpen
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-primary"
                )}
              >
                {isOpen ? (
                  <Minus className="size-4" strokeWidth={3} />
                ) : (
                  <Plus className="size-4" strokeWidth={3} />
                )}
              </span>
            </button>

            <div
              id={panelId}
              hidden={!isOpen}
              className="px-4 pb-3 font-body text-sm leading-[1.8] text-muted-foreground"
            >
              {item.answer}
            </div>
          </div>
        )
      })}
    </div>
  )
}
