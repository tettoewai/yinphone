import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"
import { cn } from "@workspace/ui/lib/utils"
import { LoaderCircle, Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

import { Field, TextField } from "@/components/field"
import { FormAlert } from "@/components/form-alert"
import {
  ApiError,
  channelsApi,
  ordersApi,
  productsApi,
  type AdminChannel,
  type AdminProductSummary,
} from "@/lib/api"
import { formatMmk } from "@/lib/format"
import {
  MAX_LINE_QUANTITY,
  defaultSize,
  emptyLine,
  emptyManualOrderDraft,
  manualOrderProblem,
  manualOrderTotal,
  toCreateOrderBody,
  type ManualOrderDraft,
  type ManualOrderLine,
  type ManualOrderProblemField,
} from "@/lib/manual-order"

type ManualOrderDialogProps = {
  onOpenChange: (open: boolean) => void
  /** Handed the new code so the caller can open the order it created. */
  onCreated: (code: string) => void
}

function isAbortError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { name?: unknown }).name === "AbortError"
  )
}

function failureMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Something went wrong. Please try again."
}

const LINE_INPUT =
  "min-h-12 w-full rounded-md border-2 border-border bg-input px-3.5 text-sm text-foreground outline-none transition-colors focus:border-primary"

/**
 * "Manual order" on `/orders`: the form staff fill in for a chat order.
 *
 * Mounted only while open, so each opening starts from a blank draft and a
 * fresh fetch of the active catalogue and channels. The API prices the order
 * from the database and starts it as NEW; the total here is a preview.
 */
export function ManualOrderDialog({
  onOpenChange,
  onCreated,
}: ManualOrderDialogProps) {
  const [draft, setDraft] = useState<ManualOrderDraft>(emptyManualOrderDraft)
  const [products, setProducts] = useState<AdminProductSummary[] | null>(null)
  const [channels, setChannels] = useState<AdminChannel[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [attempted, setAttempted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    Promise.all([
      productsApi.list({ visibility: "active", limit: 100 }, controller.signal),
      channelsApi.list(controller.signal),
    ])
      .then(([page, allChannels]) => {
        const active = allChannels.filter((channel) => channel.isActive)
        const first = active[0]

        setProducts(page.items)
        setChannels(active)
        // Pre-select the first channel so a one-channel shop needs no choice.
        setDraft((current) =>
          current.channel || !first
            ? current
            : { ...current, channel: first.slug }
        )
      })
      .catch((failure: unknown) => {
        if (isAbortError(failure)) return

        setLoadError(failureMessage(failure))
      })

    return () => controller.abort()
  }, [])

  const loading = products === null || channels === null
  const total = manualOrderTotal(draft, products ?? [])
  const problem = manualOrderProblem(draft, products ?? [])

  function errorFor(field: ManualOrderProblemField) {
    return attempted && problem?.field === field ? problem.message : undefined
  }

  function update(patch: Partial<ManualOrderDraft>) {
    setDraft((current) => ({ ...current, ...patch }))
    setSubmitError(null)
  }

  function updateLine(key: string, patch: Partial<ManualOrderLine>) {
    setDraft((current) => ({
      ...current,
      lines: current.lines.map((line) =>
        line.key === key ? { ...line, ...patch } : line
      ),
    }))
    setSubmitError(null)
  }

  /** Picking a product also picks its first size (or none for one-size items). */
  function chooseProduct(key: string, productId: string) {
    const product = (products ?? []).find((row) => row.id === productId)
    updateLine(key, {
      productId,
      size: product ? defaultSize(product) : null,
    })
  }

  function addLine() {
    setDraft((current) => ({
      ...current,
      lines: [...current.lines, emptyLine()],
    }))
  }

  function removeLine(key: string) {
    setDraft((current) => ({
      ...current,
      lines: current.lines.filter((line) => line.key !== key),
    }))
  }

  async function submit() {
    setAttempted(true)
    if (problem) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const order = await ordersApi.create(toCreateOrderBody(draft))
      onCreated(order.code)
    } catch (failure) {
      setSubmitError(failureMessage(failure))
    } finally {
      setSubmitting(false)
    }
  }

  const productItems = (products ?? []).map((product) => ({
    value: product.id,
    label: `${product.nameMy} • ${product.nameEn}`,
  }))

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>မှာယူမှု အသစ်</DialogTitle>
          <DialogDescription>
            Manual order • record a chat order. Prices come from the catalogue
            and the order starts as NEW.
          </DialogDescription>
        </DialogHeader>

        {loadError ? (
          <FormAlert
            title="မအောင်မြင်ပါ • Could not load the order form"
            detail={loadError}
          />
        ) : loading ? (
          <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            Loading products and channels…
          </p>
        ) : (
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              void submit()
            }}
            noValidate
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                id="manual-order-name"
                label="အမည်"
                labelEn="Customer name"
                value={draft.customerName}
                onChange={(customerName) => update({ customerName })}
                placeholder="Ma Thida"
                error={errorFor("customerName")}
                disabled={submitting}
              />
              <TextField
                id="manual-order-phone"
                label="ဖုန်း"
                labelEn="Phone"
                value={draft.customerPhone}
                onChange={(customerPhone) => update({ customerPhone })}
                placeholder="09 123 456 789"
                error={errorFor("customerPhone")}
                disabled={submitting}
              />
            </div>

            <Field
              id="manual-order-channel"
              label="ချန်နယ်"
              labelEn="Channel — required"
              error={errorFor("channel")}
              hint={
                channels.length === 0
                  ? "No active channels — turn one on in Channels first."
                  : undefined
              }
            >
              <Select
                items={channels.map((channel) => ({
                  value: channel.slug,
                  label: `${channel.nameMy} • ${channel.nameEn}`,
                }))}
                value={draft.channel || null}
                onValueChange={(value) => update({ channel: value ?? "" })}
                disabled={submitting}
              >
                <SelectTrigger
                  id="manual-order-channel"
                  aria-invalid={errorFor("channel") ? true : undefined}
                  className={cn(
                    "min-h-12 rounded-md border-2 bg-background px-3.5 text-sm text-foreground focus-visible:border-primary",
                    errorFor("channel") ? "border-accent" : "border-border"
                  )}
                >
                  <SelectValue placeholder="ချန်နယ် ရွေးပါ" />
                </SelectTrigger>
                <SelectContent>
                  {channels.map((channel) => (
                    <SelectItem key={channel.id} value={channel.slug}>
                      {channel.nameMy} • {channel.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-body text-sm leading-[1.7] font-bold text-foreground">
                  ပစ္စည်းများ
                  <span className="text-xs font-normal text-muted-foreground">
                    {" • Items"}
                  </span>
                </span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addLine}
                  disabled={submitting}
                  className="min-h-9 gap-1.5 px-3 text-xs font-bold"
                >
                  <Plus className="size-3.5" strokeWidth={3} />
                  Add line
                </Button>
              </div>

              {draft.lines.map((line, index) => {
                const product = (products ?? []).find(
                  (row) => row.id === line.productId
                )

                return (
                  <div
                    key={line.key}
                    className="flex flex-col gap-2 rounded-md border border-border bg-background p-3"
                  >
                    <Field
                      id={`manual-order-product-${line.key}`}
                      label={`Line ${index + 1}`}
                      labelEn="Product"
                    >
                      <Select
                        items={productItems}
                        value={line.productId || null}
                        onValueChange={(value) =>
                          chooseProduct(line.key, value ?? "")
                        }
                        disabled={submitting}
                      >
                        <SelectTrigger
                          id={`manual-order-product-${line.key}`}
                          className="min-h-12 rounded-md border-2 border-border bg-background px-3.5 text-sm text-foreground focus-visible:border-primary"
                        >
                          <SelectValue placeholder="ထုတ်ကုန် ရွေးပါ" />
                        </SelectTrigger>
                        <SelectContent>
                          {(products ?? []).map((row) => (
                            <SelectItem key={row.id} value={row.id}>
                              {row.nameMy} • {row.nameEn} —{" "}
                              {formatMmk(row.priceMmk)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <div className="flex items-end gap-2">
                      {product && product.sizes.length > 0 ? (
                        <div className="flex flex-1 flex-col gap-1.5">
                          <label
                            htmlFor={`manual-order-size-${line.key}`}
                            className="font-body text-xs font-semibold text-foreground"
                          >
                            Size
                          </label>
                          <Select
                            items={product.sizes.map((size) => ({
                              value: size,
                              label: size,
                            }))}
                            value={line.size}
                            onValueChange={(value) =>
                              updateLine(line.key, { size: value })
                            }
                            disabled={submitting}
                          >
                            <SelectTrigger
                              id={`manual-order-size-${line.key}`}
                              className="min-h-12 rounded-md border-2 border-border bg-background px-3.5 text-sm text-foreground focus-visible:border-primary"
                            >
                              <SelectValue placeholder="Size" />
                            </SelectTrigger>
                            <SelectContent>
                              {product.sizes.map((size) => (
                                <SelectItem key={size} value={size}>
                                  {size}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : null}

                      <div className="flex w-24 flex-col gap-1.5">
                        <label
                          htmlFor={`manual-order-quantity-${line.key}`}
                          className="font-body text-xs font-semibold text-foreground"
                        >
                          Qty
                        </label>
                        <input
                          id={`manual-order-quantity-${line.key}`}
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={MAX_LINE_QUANTITY}
                          value={line.quantity}
                          onChange={(event) =>
                            updateLine(line.key, {
                              quantity: event.target.value,
                            })
                          }
                          disabled={submitting}
                          className={LINE_INPUT}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeLine(line.key)}
                        disabled={submitting || draft.lines.length === 1}
                        aria-label={`Remove line ${index + 1}`}
                        className="min-h-12 px-3 text-accent-foreground"
                      >
                        <Trash2 className="size-4" strokeWidth={2.8} />
                      </Button>
                    </div>
                  </div>
                )
              })}

              {errorFor("lines") ? (
                <p className="font-body text-xs leading-[1.7] text-accent-foreground">
                  {errorFor("lines")}
                </p>
              ) : null}

              {products.length === 0 ? (
                <p className="font-body text-xs leading-[1.7] text-muted-foreground">
                  No active products yet — add one before recording an order.
                </p>
              ) : null}
            </div>

            <Field id="manual-order-note" label="မှတ်ချက်" labelEn="Note">
              <Textarea
                id="manual-order-note"
                rows={2}
                value={draft.note}
                onChange={(event) => update({ note: event.target.value })}
                placeholder="Delivery details, colour, anything the customer said…"
                maxLength={500}
                disabled={submitting}
              />
            </Field>

            {submitError ? (
              <FormAlert
                title="မအောင်မြင်ပါ • Could not create the order"
                detail={submitError}
              />
            ) : null}

            <DialogFooter className="items-center sm:justify-between">
              <span className="text-sm font-bold text-foreground">
                Total • {formatMmk(total)}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={submitting}
                  className="min-h-12 px-5 text-sm font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="min-h-12 px-5 text-sm font-bold"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    "Create order"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
