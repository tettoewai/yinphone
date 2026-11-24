import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { cn } from "@workspace/ui/lib/utils"

import { Field, TextField } from "@/components/field"
import { FormCard } from "@/components/product-form/form-card"
import type { DraftField, ProductDraft } from "@/lib/product-form"
import { PRODUCT_CATEGORIES } from "@/lib/products"

/** Feeds `Select.Value` so the trigger shows the label, not the raw slug. */
const CATEGORY_ITEMS = PRODUCT_CATEGORIES.map((category) => ({
  value: category.slug,
  label: `${category.nameMy} • ${category.nameEn}`,
}))

type BasicInfoCardProps = {
  draft: ProductDraft
  onChange: (patch: Partial<ProductDraft>) => void
  errorFor: (field: DraftField) => string | undefined
  onBlurField: (field: DraftField) => void
}

/** Card 1: both names and the category the storefront files the product under. */
export function BasicInfoCard({
  draft,
  onChange,
  errorFor,
  onBlurField,
}: BasicInfoCardProps) {
  const categoryError = errorFor("category")

  return (
    <FormCard step={1} title="အခြေခံအချက်အလက် • Basic info">
      <TextField
        id="product-name-my"
        label="အမည် (မြန်မာ)"
        labelEn="Name (Myanmar)"
        value={draft.nameMy}
        onChange={(nameMy) => onChange({ nameMy })}
        onBlur={() => onBlurField("nameMy")}
        aside="Required"
        error={errorFor("nameMy")}
      />

      <TextField
        id="product-name-en"
        label="အမည် (အင်္ဂလိပ်)"
        labelEn="Name (English)"
        value={draft.nameEn}
        onChange={(nameEn) => onChange({ nameEn })}
        onBlur={() => onBlurField("nameEn")}
        placeholder="Cotton Midi Dress"
        error={errorFor("nameEn")}
      />

      <Field
        id="product-category"
        label="အမျိုးအစား"
        labelEn="Category — required"
        error={categoryError}
      >
        <Select
          items={CATEGORY_ITEMS}
          value={draft.category || null}
          onValueChange={(value) => onChange({ category: value ?? "" })}
        >
          <SelectTrigger
            id="product-category"
            aria-invalid={categoryError ? true : undefined}
            aria-describedby={
              categoryError ? "product-category-message" : undefined
            }
            className={cn(
              "min-h-12 rounded-md border-2 bg-background px-3.5 text-sm text-foreground focus-visible:border-primary",
              categoryError ? "border-accent" : "border-border"
            )}
          >
            <SelectValue placeholder="အမျိုးအစား ရွေးပါ" />
          </SelectTrigger>
          <SelectContent>
            {PRODUCT_CATEGORIES.map((category) => (
              <SelectItem key={category.slug} value={category.slug}>
                {category.nameMy} • {category.nameEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </FormCard>
  )
}
