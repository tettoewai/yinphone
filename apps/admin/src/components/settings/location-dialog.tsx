import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { useState } from "react"

import { TextField } from "@/components/field"

type LocationDialogProps = {
  lat: number
  lng: number
  onOpenChange: (open: boolean) => void
  onSave: (lat: number, lng: number) => void
}

function parseCoordinate(value: string) {
  const parsed = Number(value.trim())
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * "Set location" from the shop card: two coordinate fields behind a dialog.
 *
 * Mounted only while open, so each opening starts from the current pin without
 * an effect to reset it. Saving only checks that the values are in range — a
 * geocoder would need the maps API, which this screen does not have yet.
 */
export function LocationDialog({
  lat,
  lng,
  onOpenChange,
  onSave,
}: LocationDialogProps) {
  const [draft, setDraft] = useState(() => ({
    lat: lat.toFixed(2),
    lng: lng.toFixed(2),
  }))
  const [attemptedSave, setAttemptedSave] = useState(false)

  const latValue = parseCoordinate(draft.lat)
  const lngValue = parseCoordinate(draft.lng)

  const latError =
    latValue === null || Math.abs(latValue) > 90
      ? "Enter a latitude between -90 and 90 • လတ္တီကျု မှားနေသည်။"
      : undefined
  const lngError =
    lngValue === null || Math.abs(lngValue) > 180
      ? "Enter a longitude between -180 and 180 • လောင်ဂျီကျု မှားနေသည်။"
      : undefined

  function save() {
    if (latValue === null || lngValue === null) {
      setAttemptedSave(true)
      return
    }

    onSave(latValue, lngValue)
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>တည်နေရာ သတ်မှတ်ရန်</DialogTitle>
          <DialogDescription>
            Map pin • enter the shop&apos;s WGS84 coordinates for the storefront
            map.
          </DialogDescription>
        </DialogHeader>

        <TextField
          id="shop-latitude"
          label="Latitude"
          labelEn="လတ္တီကျု"
          value={draft.lat}
          onChange={(value) =>
            setDraft((current) => ({ ...current, lat: value }))
          }
          hint="16.84"
          error={attemptedSave ? latError : undefined}
        />

        <TextField
          id="shop-longitude"
          label="Longitude"
          labelEn="လောင်ဂျီကျု"
          value={draft.lng}
          onChange={(value) =>
            setDraft((current) => ({ ...current, lng: value }))
          }
          hint="96.17"
          error={attemptedSave ? lngError : undefined}
        />

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="min-h-12 flex-1 px-6 text-sm font-bold"
          >
            Cancel
          </Button>
          <Button
            onClick={save}
            className="min-h-12 flex-1 px-6 text-sm font-bold"
          >
            Save location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
