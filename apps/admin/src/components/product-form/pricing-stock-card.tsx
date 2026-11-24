import { Switch } from "@workspace/ui/components/switch"
import { cn } from "@workspace/ui/lib/utils"
import { Minus, Plus } from "lucide-react"

import { Field } from "@/components/field"
import { FormCard } from "@/components/product-form/form-card"
import {
  formatPriceDigits,
  priceDigitsFrom,
  type DraftField,
  type ProductDraft,
} from "@/lib/product-form"

type PricingStockCardProps = {
  draft: ProductDraft
  onChange: (patch: Partial<ProductDraft>) => void
  errorFor: (field: DraftField) => string | undefined
  onBlurField: (field: DraftField) => void
}

/** Card 2: price, stock and the Active toggle that publishes the product. */
export function PricingStockCard({
  draft,
  onChange,
  errorFor,
  onBlurField,
}: PricingStockCardProps) {
  const priceError = errorFor("price")

  return (
    <FormCard step={2} title="ဈေးနှုန်းနှင့် စတော့ • Pricing & stock">
      <div className="grid grid-cols-2 gap-3">
        <Field
          id="product-price"
          label="ဈေးနှုန်း (Ks)"
          labelEn="required"
          hint="Numbers only • commas auto-added"
          error={priceError}
        >
          <div
            className={cn(
              "flex min-h-12 items-center rounded-md border bg-background px-3.5 transition-colors focus-within:border-primary",
              priceError ? "border-accent" : "border-border"
            )}
          >
            <input
              id="product-price"
              inputMode="numeric"
              autoComplete="off"
              value={formatPriceDigits(draft.price)}
              onChange={(event) =>
                onChange({ price: priceDigitsFrom(event.target.value) })
              }
              onBlur={() => onBlurField("price")}
              placeholder="0"
              aria-invalid={priceError ? true : undefined}
              aria-describedby={
                priceError ? "product-price-message" : undefined
              }
              className="min-w-0 flex-1 bg-transparent text-right text-sm font-bold text-foreground outline-none placeholder:text-muted-foreground"
            />
            <span className="pl-2 text-xs text-muted-foreground">Ks</span>
          </div>
        </Field>

        <div className="flex flex-col gap-1.5">
          <span className="font-body text-sm font-bold text-foreground">
            စတော့{" "}
            <span className="text-xs font-normal text-muted-foreground">
              • Stock
            </span>
          </span>
          <div className="flex min-h-12 items-center justify-between rounded-md border border-border bg-background px-1.5">
            <button
              type="button"
              aria-label="Decrease stock"
              onClick={() => onChange({ stock: Math.max(0, draft.stock - 1) })}
              disabled={draft.stock <= 0}
              className="flex h-10 w-11 items-center justify-center rounded-sm bg-muted text-foreground transition-colors outline-none hover:bg-muted/70 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40"
            >
              <Minus className="size-4" strokeWidth={3} />
            </button>
            <span
              aria-live="polite"
              className="text-base font-bold text-foreground tabular-nums"
            >
              {draft.stock}
            </span>
            <button
              type="button"
              aria-label="Increase stock"
              onClick={() => onChange({ stock: draft.stock + 1 })}
              className="flex h-10 w-11 items-center justify-center rounded-sm bg-primary text-primary-foreground transition-colors outline-none hover:bg-primary/85 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Plus className="size-4" strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-14 items-center justify-between gap-3 rounded-md border border-border bg-background px-3.5">
        <div className="min-w-0">
          <div className="font-body text-sm font-bold text-foreground">
            Active • ဆိုင်တွင် ပြမည်
          </div>
          <div className="text-xs text-muted-foreground">
            Default ON • toggle hides instantly
          </div>
        </div>
        <Switch
          checked={draft.isActive}
          onCheckedChange={(checked) => onChange({ isActive: checked })}
          aria-label="Show this product in the shop"
          className="h-[30px] w-[52px] rounded-xl border-0 p-1 [--switch-thumb-size:22px] [--switch-thumb-travel:22px]"
        />
      </div>
    </FormCard>
  )
}
