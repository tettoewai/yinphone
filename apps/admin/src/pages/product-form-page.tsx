import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { BasicInfoCard } from "@/components/product-form/basic-info-card"
import { DescriptionCard } from "@/components/product-form/description-card"
import { PhotosCard } from "@/components/product-form/photos-card"
import { PricingStockCard } from "@/components/product-form/pricing-stock-card"
import { ProductFormFooter } from "@/components/product-form/product-form-footer"
import { ProductFormHeader } from "@/components/product-form/product-form-header"
import { UnsavedChangesBanner } from "@/components/product-form/unsaved-changes-banner"
import {
  MAX_PHOTOS,
  createBlankDraft,
  createSeedDraft,
  fieldError,
  isDraftBlank,
  missingFields,
  type DraftField,
  type ProductDraft,
} from "@/lib/product-form"
import { ROUTES } from "@/lib/routes"

/**
 * Add product (`/products/new`).
 *
 * The whole screen is local state: there is no `POST /api/products` yet, so
 * saving validates the draft and returns to the list rather than pretending to
 * persist anything. Picked photos become object URLs owned by this view and are
 * revoked when they are removed or the page unmounts.
 *
 * The draft starts from the design's demo content — one restored draft that is
 * still missing its English name — which is why that field shows its error
 * before it has been touched.
 */
export function ProductFormPage() {
  const navigate = useNavigate()
  const [draft, setDraft] = useState<ProductDraft>(createSeedDraft)
  const [touched, setTouched] = useState<ReadonlySet<DraftField>>(
    () => new Set<DraftField>(["nameEn"])
  )
  const [attemptedSave, setAttemptedSave] = useState(false)
  const objectUrls = useRef<string[]>([])
  const photoSerial = useRef(0)

  // Without this the blobs behind removed or abandoned photos would stay alive
  // for the whole tab session.
  useEffect(
    () => () => {
      for (const url of objectUrls.current) URL.revokeObjectURL(url)
    },
    []
  )

  const missing = missingFields(draft)

  function errorFor(field: DraftField) {
    return attemptedSave || touched.has(field)
      ? fieldError(draft, field)
      : undefined
  }

  function update(patch: Partial<ProductDraft>) {
    setDraft((current) => ({ ...current, ...patch }))
  }

  function blurField(field: DraftField) {
    setTouched((current) => {
      if (current.has(field)) return current
      const next = new Set(current)
      next.add(field)
      return next
    })
  }

  function addPhotos(files: readonly File[]) {
    const room = MAX_PHOTOS - draft.photos.length
    const picked = files
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, Math.max(room, 0))
    if (picked.length === 0) return

    // Built outside the state updater: Strict Mode runs updaters twice, which
    // would mint — and leak — a second object URL per file.
    const added = picked.map((file) => {
      photoSerial.current += 1
      const url = URL.createObjectURL(file)
      objectUrls.current.push(url)
      return { id: `photo-${photoSerial.current}`, url }
    })

    setDraft((current) => ({
      ...current,
      photos: [...current.photos, ...added],
    }))
  }

  function removePhoto(id: string) {
    const photo = draft.photos.find((item) => item.id === id)
    if (photo?.url) {
      URL.revokeObjectURL(photo.url)
      objectUrls.current = objectUrls.current.filter((url) => url !== photo.url)
    }

    setDraft((current) => ({
      ...current,
      photos: current.photos.filter((item) => item.id !== id),
    }))
  }

  function reorderPhotos(from: number, to: number) {
    if (from === to) return

    setDraft((current) => {
      const next = [...current.photos]
      const [moved] = next.splice(from, 1)
      if (!moved) return current
      next.splice(to, 0, moved)
      return { ...current, photos: next }
    })
  }

  function discard() {
    for (const url of objectUrls.current) URL.revokeObjectURL(url)
    objectUrls.current = []
    setDraft(createBlankDraft())
    setTouched(new Set())
    setAttemptedSave(false)
  }

  function save() {
    if (missing.length > 0) {
      setAttemptedSave(true)
      setTouched(new Set(missing))
      return
    }

    // No products API yet: the editor's job ends at validation, so saving
    // leaves the form instead of claiming a product was created.
    navigate(ROUTES.products)
  }

  const handlers = {
    draft,
    onChange: update,
    errorFor,
    onBlurField: blurField,
  }

  return (
    <>
      <ProductFormHeader requiredLeft={missing.length} />

      <main className="flex flex-1 flex-col gap-3 px-4 pt-3 sm:px-6">
        {isDraftBlank(draft) ? null : (
          <UnsavedChangesBanner onDiscard={discard} />
        )}

        <div className="grid items-start gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <BasicInfoCard {...handlers} />
            <PricingStockCard {...handlers} />
            <DescriptionCard draft={draft} onChange={update} />
          </div>

          <PhotosCard
            photos={draft.photos}
            onAdd={addPhotos}
            onRemove={removePhoto}
            onReorder={reorderPhotos}
            preview={{
              nameMy: draft.nameMy,
              nameEn: draft.nameEn,
              price: draft.price,
            }}
          />
        </div>
      </main>

      <ProductFormFooter
        photoCount={draft.photos.length}
        onCancel={() => navigate(ROUTES.products)}
        onSave={save}
      />
    </>
  )
}
