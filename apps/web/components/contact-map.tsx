"use client"

import { MapPin, Minus, Plus } from "lucide-react"
import { useState } from "react"

import { CONTACT } from "@/components/contact-data"
import { cn } from "@workspace/ui/lib/utils"

const MIN_ZOOM = 1
const MAX_ZOOM = 1.6
const ZOOM_STEP = 0.2

export default function ContactMap() {
  const [zoom, setZoom] = useState(MIN_ZOOM)

  const zoomBy = (delta: number) => {
    setZoom((value) =>
      Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number((value + delta).toFixed(1))))
    )
  }

  return (
    <div className="relative h-[190px] overflow-hidden rounded-lg border border-border bg-muted">
      {/* Street art only — the pin stays card-anchored while the map zooms. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{ transform: `scale(${zoom})` }}
      >
        <div className="absolute top-0 right-0 left-0 h-[20px] bg-card/70" />
        <div className="absolute top-[58px] right-0 left-0 flex h-[26px] items-center border-y border-border bg-card px-4">
          <div className="text-[10px] font-medium tracking-wide text-muted-foreground">
            BOGYOKE MARKET RD
          </div>
        </div>
        <div className="absolute top-0 bottom-0 left-[110px] w-[20px] border-x border-border bg-card" />
        <div className="absolute top-0 right-[70px] bottom-0 w-[12px] bg-card/70" />
        <div className="absolute bottom-0 left-0 h-[14px] w-full bg-card/70" />
      </div>

      <div className="absolute top-[16px] left-[16px] rounded-sm border border-border bg-card px-2 py-1 text-[10px] text-muted-foreground">
        City Hall
      </div>
      <div className="absolute right-[16px] bottom-[24px] rounded-sm border border-border bg-card px-2 py-1 text-[10px] text-muted-foreground">
        Junction City
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-card bg-primary shadow-sm">
          <MapPin
            className="size-[22px] text-primary-foreground"
            strokeWidth={2.18}
          />
        </div>
        <div className="mt-1.5 rounded-sm bg-foreground px-2.5 py-1 font-body text-xs font-bold text-primary-foreground">
          {CONTACT.shopName}
        </div>
      </div>

      <div className="absolute right-2 bottom-2 flex gap-1.5">
        <button
          type="button"
          onClick={() => zoomBy(ZOOM_STEP)}
          disabled={zoom >= MAX_ZOOM}
          aria-label="Zoom in"
          className={cn(
            "flex h-[44px] w-[44px] items-center justify-center rounded-md border border-border bg-card",
            zoom >= MAX_ZOOM && "opacity-70"
          )}
        >
          <Plus className="size-[17px] text-foreground" strokeWidth={2.82} />
        </button>
        <button
          type="button"
          onClick={() => zoomBy(-ZOOM_STEP)}
          disabled={zoom <= MIN_ZOOM}
          aria-label="Zoom out"
          className={cn(
            "flex h-[44px] w-[44px] items-center justify-center rounded-md border border-border bg-card",
            zoom <= MIN_ZOOM && "opacity-70"
          )}
        >
          <Minus className="size-[17px] text-foreground" strokeWidth={2.82} />
        </button>
      </div>
    </div>
  )
}
