import { Button } from "@workspace/ui/components/button"
import { MapPin, Upload } from "lucide-react"
import { useRef } from "react"

import { TextField } from "@/components/field"
import { LocationMap } from "@/components/settings/location-map"
import {
  formatCoordinates,
  settingsSectionId,
  type ShopInfo,
} from "@/lib/settings"

type ShopInfoCardProps = {
  info: ShopInfo
  /** Object URL for a logo picked in this tab, or `null` for the initial. */
  logoUrl: string | null
  onChange: (patch: Partial<ShopInfo>) => void
  onPickLogo: (file: File) => void
  onSetLocation: () => void
}

/**
 * Shop info: the profile the storefront reads, the logo, and the map pin.
 *
 * The logo never leaves the browser — the picked file becomes an object URL
 * owned by the page — so "upload" is honest about being a local preview. The
 * initial stands in for the shop's letter mark until one is picked.
 */
export function ShopInfoCard({
  info,
  logoUrl,
  onChange,
  onPickLogo,
  onSetLocation,
}: ShopInfoCardProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <section
      id={settingsSectionId("shop")}
      className="flex scroll-mt-24 flex-col gap-3.5 rounded-lg border border-border bg-card p-5"
    >
      <h2 className="font-body text-sm leading-[1.7] font-bold text-foreground">
        ဆိုင်အချက်အလက် • Shop info
      </h2>

      <div className="flex gap-3">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary text-2xl font-bold text-primary-foreground">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Shop logo"
              className="size-full object-cover"
            />
          ) : (
            "Y"
          )}
        </div>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex flex-1 flex-col items-center justify-center rounded-md border-2 border-dashed border-border bg-background px-3 py-2 text-center transition-colors outline-none hover:border-primary focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Upload className="size-4 text-primary" strokeWidth={3} />
          <span className="pt-1 text-xs font-bold text-foreground">
            Logo upload
          </span>
          <span className="text-[11px] text-muted-foreground">
            Square • PNG / SVG
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/svg+xml"
          hidden
          aria-label="Choose shop logo"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) onPickLogo(file)
            // Clearing lets the same file be picked again after a change.
            event.target.value = ""
          }}
        />
      </div>

      <TextField
        id="shop-name-my"
        label="ဆိုင်အမည် (မြန်မာ)"
        labelEn="Shop name (Myanmar)"
        value={info.nameMy}
        onChange={(nameMy) => onChange({ nameMy })}
      />

      <TextField
        id="shop-name-en"
        label="ဆိုင်အမည် (အင်္ဂလိပ်)"
        labelEn="Shop name (English)"
        value={info.nameEn}
        onChange={(nameEn) => onChange({ nameEn })}
      />

      <TextField
        id="shop-address-my"
        label="လိပ်စာ (မြန်မာ)"
        labelEn="Address (Myanmar)"
        value={info.addressMy}
        onChange={(addressMy) => onChange({ addressMy })}
      />

      <TextField
        id="shop-address-en"
        label="လိပ်စာ (အင်္ဂလိပ်)"
        labelEn="Address (English)"
        value={info.addressEn}
        onChange={(addressEn) => onChange({ addressEn })}
      />

      <TextField
        id="shop-phone"
        label="ဖုန်း"
        labelEn="Phone"
        value={info.phone}
        onChange={(phone) => onChange({ phone })}
      />

      <div className="overflow-hidden rounded-md border border-border">
        <LocationMap />
        <div className="flex flex-wrap items-center justify-between gap-2 bg-background px-3.5 py-2.5">
          <span className="text-xs text-muted-foreground">
            {formatCoordinates(info.lat, info.lng)}
          </span>
          <Button
            type="button"
            variant="secondary"
            onClick={onSetLocation}
            className="min-h-11 gap-1.5 rounded-md px-4 text-[13px] font-bold"
          >
            <MapPin className="size-3.5" strokeWidth={3.4} />
            Set location
          </Button>
        </div>
      </div>
    </section>
  )
}
