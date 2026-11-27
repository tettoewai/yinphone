import { GripVertical, Shirt, X } from "lucide-react"

import { isSavedPhoto, type ProductPhoto } from "@/lib/product-form"

type PhotoTileProps = {
  photo: ProductPhoto
  index: number
  isMain: boolean
  onRemove: (id: string) => void
  onDragStart: (index: number) => void
  onDragEnd: () => void
  onDropAt: (index: number) => void
}

/**
 * One photo in the editor's grid.
 *
 * Tiles are drag sources and drop targets so the first slot — the one the
 * storefront uses as the main photo — can be changed by dragging. A saved URL
 * renders the image; a file picked in this tab renders its object URL and is
 * labelled as local, because it is not sent to the API.
 */
export function PhotoTile({
  photo,
  index,
  isMain,
  onRemove,
  onDragStart,
  onDragEnd,
  onDropAt,
}: PhotoTileProps) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragEnd={onDragEnd}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        onDropAt(index)
      }}
      className="overflow-hidden rounded-md border border-border bg-background"
    >
      <div className="relative">
        {photo.url ? (
          <img
            src={photo.url}
            alt=""
            draggable={false}
            className="aspect-square w-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="flex aspect-square w-full items-center justify-center bg-secondary"
          >
            <Shirt className="size-8 text-primary/70" strokeWidth={1.6} />
          </span>
        )}

        {isMain ? (
          <span className="absolute top-1.5 left-1.5 rounded-sm bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
            MAIN
          </span>
        ) : null}

        <button
          type="button"
          onClick={() => onRemove(photo.id)}
          aria-label={`Remove photo ${index + 1}`}
          title="Remove photo"
          className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-sm border border-border bg-card text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <X className="size-[13px]" strokeWidth={3.7} />
        </button>

        <span
          aria-hidden
          title="Drag to reorder"
          className="absolute bottom-1.5 left-1.5 flex size-7 cursor-grab items-center justify-center rounded-sm border border-border bg-card text-muted-foreground"
        >
          <GripVertical className="size-[13px]" strokeWidth={3.7} />
        </span>
      </div>

      <div className="px-2 py-1.5">
        <div className="h-1.5 overflow-hidden rounded-sm bg-muted">
          <div className="h-full w-full rounded-sm bg-primary" />
        </div>
        <div className="pt-1 text-[11px] text-muted-foreground">
          {isSavedPhoto(photo) ? "Saved" : "Local only"}
        </div>
      </div>
    </div>
  )
}
