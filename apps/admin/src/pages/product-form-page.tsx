import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { FormAlert } from "@/components/form-alert"
import { BasicInfoCard } from "@/components/product-form/basic-info-card"
import { DescriptionCard } from "@/components/product-form/description-card"
import { PhotosCard } from "@/components/product-form/photos-card"
import { PricingStockCard } from "@/components/product-form/pricing-stock-card"
import { ProductFormFooter } from "@/components/product-form/product-form-footer"
import { ProductFormHeader } from "@/components/product-form/product-form-header"
import { UnsavedChangesBanner } from "@/components/product-form/unsaved-changes-banner"
import { TableSkeleton } from "@/components/states/dashboard-skeleton"
import { RequestError } from "@/components/states/request-error"
import { useCategories } from "@/hooks/use-categories"
import { useProduct } from "@/hooks/use-product"
import { ApiError, productsApi } from "@/lib/api"
import {
  MAX_PHOTOS,
  createBlankDraft,
  draftFromProduct,
  draftToBody,
  fieldError,
  isDraftBlank,
  localOnlyPhotoCount,
  missingFields,
  type DraftField,
  type ProductDraft,
} from "@/lib/product-form"
import { ROUTES } from "@/lib/routes"

/** Which product the unsaved draft belongs to, so a route change resets it. */
type EditState = { id: string | null; draft: ProductDraft }

/**
 * The product editor: `/products/new` and `/products/:id/edit`.
 *
 * Both modes share the draft shape and the four cards. The add form starts
 * blank; the edit form is seeded from `GET /api/admin/products/:id` once it
 * arrives, and every keystroke keeps the result in local state until Save. Save
 * posts `POST /api/admin/products` or `PATCH /api/admin/products/:id` and then
 * returns to the list.
 *
 * Photos are the one thing the API cannot take from this screen: there is no
 * upload endpoint, so a picked file previews through an object URL and is left
 * out of the payload, while a pasted http(s) URL is saved. Those object URLs are
 * revoked when the photo is removed or the page unmounts.
 */
export function ProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const productId = id ?? null
  const isEdit = productId !== null

  const {
    product,
    error: loadError,
    loading,
    reload,
  } = useProduct(productId ?? undefined)
  const {
    categories,
    error: categoriesError,
    loading: categoriesLoading,
    reload: reloadCategories,
  } = useCategories()

  const [edit, setEdit] = useState<EditState | null>(null)
  const [touched, setTouched] = useState<ReadonlySet<DraftField>>(
    () => new Set<DraftField>()
  )
  const [attemptedSave, setAttemptedSave] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
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

  /** The server's values, or a blank form in create mode. */
  function baseDraft() {
    return product ? draftFromProduct(product) : createBlankDraft()
  }

  const draft = edit && edit.id === productId ? edit.draft : baseDraft()
  const missing = missingFields(draft)
  const localOnly = localOnlyPhotoCount(draft.photos)
  // In edit mode any local change counts; in create mode an emptied form does not.
  const dirty =
    edit !== null &&
    edit.id === productId &&
    (isEdit || !isDraftBlank(edit.draft))

  function errorFor(field: DraftField) {
    return attemptedSave || touched.has(field)
      ? fieldError(draft, field)
      : undefined
  }

  function update(patch: Partial<ProductDraft>) {
    setEdit((current) => {
      const source =
        current && current.id === productId ? current.draft : baseDraft()
      return { id: productId, draft: { ...source, ...patch } }
    })
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
      return { id: `local-${photoSerial.current}`, url, altText: null }
    })

    update({ photos: [...draft.photos, ...added] })
  }

  function addPhotoUrl(url: string) {
    if (draft.photos.length >= MAX_PHOTOS) return

    photoSerial.current += 1
    update({
      photos: [
        ...draft.photos,
        { id: `url-${photoSerial.current}`, url, altText: null },
      ],
    })
  }

  function removePhoto(id: string) {
    const photo = draft.photos.find((item) => item.id === id)
    if (photo?.url?.startsWith("blob:")) {
      URL.revokeObjectURL(photo.url)
      objectUrls.current = objectUrls.current.filter((url) => url !== photo.url)
    }

    update({ photos: draft.photos.filter((item) => item.id !== id) })
  }

  function reorderPhotos(from: number, to: number) {
    if (from === to) return

    const next = [...draft.photos]
    const [moved] = next.splice(from, 1)
    if (!moved) return
    next.splice(to, 0, moved)

    update({ photos: next })
  }

  function discard() {
    for (const url of objectUrls.current) URL.revokeObjectURL(url)
    objectUrls.current = []
    setEdit(null)
    setTouched(new Set())
    setAttemptedSave(false)
    setSaveError(null)
  }

  async function save() {
    if (missing.length > 0) {
      setAttemptedSave(true)
      setTouched(new Set(missing))
      return
    }

    setSaving(true)
    setSaveError(null)

    try {
      const body = draftToBody(draft)
      if (productId) {
        await productsApi.update(productId, body)
      } else {
        await productsApi.create(body)
      }
      navigate(ROUTES.products)
    } catch (failure) {
      setSaveError(
        failure instanceof ApiError
          ? failure.message
          : "Something went wrong. Please try again."
      )
    } finally {
      setSaving(false)
    }
  }

  const handlers = {
    draft,
    onChange: update,
    errorFor,
    onBlurField: blurField,
  }

  const loadingProduct = isEdit && loading
  const failedToLoad = isEdit && !loading && loadError !== null

  return (
    <>
      <ProductFormHeader
        mode={isEdit ? "edit" : "create"}
        requiredLeft={loadingProduct || failedToLoad ? null : missing.length}
      />

      <main className="flex flex-1 flex-col gap-3 px-4 pt-3 sm:px-6">
        {loadingProduct ? (
          <TableSkeleton rows={4} className="rounded-lg" />
        ) : failedToLoad ? (
          <RequestError
            detail={
              loadError instanceof ApiError
                ? loadError.message
                : "This product could not be loaded"
            }
            onRetry={reload}
          />
        ) : (
          <>
            {saveError ? (
              <FormAlert
                title="မသိမ်းနိုင်ပါ • Save failed"
                detail={saveError}
              />
            ) : null}

            {categoriesError ? (
              <FormAlert
                title="အမျိုးအစားများ မရနိုင်ပါ • Categories failed to load"
                detail="The category list could not be fetched, so a category may be missing."
              >
                <button
                  type="button"
                  onClick={reloadCategories}
                  className="mt-1 text-xs font-bold text-primary underline underline-offset-4"
                >
                  Try again
                </button>
              </FormAlert>
            ) : null}

            {dirty ? <UnsavedChangesBanner onDiscard={discard} /> : null}

            <div className="grid items-start gap-4 lg:grid-cols-2">
              <div className="flex flex-col gap-4">
                <BasicInfoCard
                  {...handlers}
                  categories={categories ?? []}
                  categoriesLoading={categoriesLoading}
                />
                <PricingStockCard {...handlers} />
                <DescriptionCard draft={draft} onChange={update} />
              </div>

              <PhotosCard
                photos={draft.photos}
                onAddFiles={addPhotos}
                onAddUrl={addPhotoUrl}
                onRemove={removePhoto}
                onReorder={reorderPhotos}
                preview={{
                  nameMy: draft.nameMy,
                  nameEn: draft.nameEn,
                  price: draft.price,
                }}
              />
            </div>
          </>
        )}
      </main>

      {loadingProduct || failedToLoad ? null : (
        <ProductFormFooter
          mode={isEdit ? "edit" : "create"}
          photoCount={draft.photos.length}
          localOnlyCount={localOnly}
          saving={saving}
          onCancel={() => navigate(ROUTES.products)}
          onSave={() => void save()}
        />
      )}
    </>
  )
}
