import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"
import { CloudUpload, FolderOpen, Info, TriangleAlert } from "lucide-react"
import { useRef, useState } from "react"

import { FormCard } from "@/components/product-form/form-card"
import { PhotoTile } from "@/components/product-form/photo-tile"
import { ShopCardPreview } from "@/components/product-form/shop-card-preview"
import {
  MAX_PHOTOS,
  isHttpUrl,
  isSavedPhoto,
  type ProductPhoto,
} from "@/lib/product-form"

type PhotosCardProps = {
  photos: readonly ProductPhoto[]
  onAddFiles: (files: readonly File[]) => void
  onAddUrl: (url: string) => void
  onRemove: (id: string) => void
  onReorder: (from: number, to: number) => void
  /** Values for the shop-card preview under the grid. */
  preview: { nameMy: string; nameEn: string; price: string }
}

/**
 * Card 4: the dropzone, the grid of photos and the shop-card preview.
 *
 * Photos are stored as URLs, but there is no upload endpoint yet, so the
 * dropzone only previews a picked file locally — a "Add photo by URL" field is
 * how an image actually reaches the product. The card says so rather than
 * letting a picked file look saved.
 */
export function PhotosCard({
  photos,
  onAddFiles,
  onAddUrl,
  onRemove,
  onReorder,
  preview,
}: PhotosCardProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [urlValue, setUrlValue] = useState("")
  const [urlError, setUrlError] = useState<string | null>(null)

  const full = photos.length >= MAX_PHOTOS
  const localOnly = photos.filter((photo) => !isSavedPhoto(photo)).length

  function pick(list: FileList | null) {
    if (!list) return
    onAddFiles([...list])
  }

  function submitUrl() {
    const value = urlValue.trim()

    if (full) {
      setUrlError("Photo limit reached — remove one first.")
      return
    }

    if (!isHttpUrl(value)) {
      setUrlError(
        "Enter a full http(s) URL • e.g. https://example.com/photo.jpg"
      )
      return
    }

    onAddUrl(value)
    setUrlValue("")
    setUrlError(null)
  }

  function dropAt(index: number) {
    if (dragIndex !== null) onReorder(dragIndex, index)
    setDragIndex(null)
  }

  return (
    <FormCard
      step={4}
      title={`ဓာတ်ပုံများ • Photos (${photos.length}/${MAX_PHOTOS})`}
    >
      <div
        onDragOver={(event) => {
          event.preventDefault()
          if (!full) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragOver(false)
          if (!full) pick(event.dataTransfer.files)
        }}
        className={cn(
          "flex flex-col items-center gap-2 rounded-lg border-2 border-dashed bg-background px-5 py-7 text-center transition-colors",
          dragOver ? "border-primary" : "border-border"
        )}
      >
        <span className="flex size-12 items-center justify-center rounded-xl bg-secondary">
          <CloudUpload className="size-[22px] text-primary" strokeWidth={2.2} />
        </span>

        <div className="font-body text-sm leading-[1.7] font-bold text-foreground">
          ဓာတ်ပုံများ ဆွဲချထည့်ပါ
        </div>
        <div className="text-xs text-muted-foreground">
          Drag &amp; drop • JPG, PNG, WebP • ≤ 5 MB each
        </div>

        <Button
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          disabled={full}
          className="mt-1 min-h-11 gap-1.5 px-5 text-sm font-bold"
        >
          <FolderOpen className="size-[15px]" strokeWidth={3.2} />
          {full ? "Photo limit reached" : "Choose files"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          aria-label="Choose product photos"
          onChange={(event) => {
            pick(event.target.files)
            // Clearing the value lets the same file be picked again after a
            // removal, which the browser would otherwise ignore.
            event.target.value = ""
          }}
        />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          submitUrl()
        }}
        className="flex flex-col gap-1.5"
      >
        <label
          htmlFor="product-photo-url"
          className="font-body text-sm font-semibold text-foreground"
        >
          ဓာတ်ပုံ link{" "}
          <span className="text-xs font-normal text-muted-foreground">
            • Add photo by URL
          </span>
        </label>
        <div className="flex gap-2">
          <Input
            id="product-photo-url"
            type="url"
            inputMode="url"
            autoComplete="off"
            value={urlValue}
            disabled={full}
            onChange={(event) => {
              setUrlValue(event.target.value)
              setUrlError(null)
            }}
            placeholder="https://…"
            aria-invalid={urlError ? true : undefined}
            className="h-12 rounded-md border-border bg-background text-sm text-foreground"
          />
          <Button
            type="submit"
            variant="secondary"
            disabled={full}
            className="min-h-12 shrink-0 px-4 text-sm font-bold"
          >
            Add
          </Button>
        </div>
        {urlError ? (
          <p className="font-body text-xs leading-[1.7] text-accent-foreground">
            {urlError}
          </p>
        ) : null}
      </form>

      <div className="grid grid-cols-3 gap-2.5">
        {photos.map((photo, index) => (
          <PhotoTile
            key={photo.id}
            photo={photo}
            index={index}
            isMain={index === 0}
            onRemove={onRemove}
            onDragStart={setDragIndex}
            onDragEnd={() => setDragIndex(null)}
            onDropAt={dropAt}
          />
        ))}
      </div>

      {localOnly > 0 ? (
        <div className="flex gap-2 rounded-md border border-accent bg-accent/10 px-3.5 py-2.5 font-body text-xs leading-[1.7] text-accent-foreground">
          <TriangleAlert
            className="mt-0.5 size-3.5 shrink-0"
            strokeWidth={3.4}
          />
          <span>
            {localOnly} file{localOnly === 1 ? "" : "s"} picked in this browser
            will not be saved — photo uploads are not connected yet. Add a photo
            URL to keep an image with the product.
          </span>
        </div>
      ) : null}

      <div className="flex gap-2 rounded-md border border-border bg-background px-3.5 py-2.5 font-body text-xs leading-[1.7] text-muted-foreground">
        <Info
          className="mt-0.5 size-3.5 shrink-0 text-primary"
          strokeWidth={3.4}
        />
        <span>ပထမပုံက Main photo ဖြစ်မည်။ ဆွဲပြီး နေရာရွှေ့နိုင်ပါတယ်။</span>
      </div>

      <ShopCardPreview
        nameMy={preview.nameMy}
        nameEn={preview.nameEn}
        price={preview.price}
        photo={photos[0]}
      />
    </FormCard>
  )
}
