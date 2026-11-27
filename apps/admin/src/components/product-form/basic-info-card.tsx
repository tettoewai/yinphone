import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { cn } from "@workspace/ui/lib/utils"
import { Link } from "react-router-dom"

import { Field, TextField } from "@/components/field"
import { FormCard } from "@/components/product-form/form-card"
import type { AdminProductCategory } from "@/lib/api"
import type { DraftField, ProductDraft } from "@/lib/product-form"
import { ROUTES } from "@/lib/routes"

type BasicInfoCardProps = {
  draft: ProductDraft
  categories: readonly AdminProductCategory[]
  /** True while the category list is still arriving. */
  categoriesLoading?: boolean
  onChange: (patch: Partial<ProductDraft>) => void
  errorFor: (field: DraftField) => string | undefined
  onBlurField: (field: DraftField) => void
}

/**
 * Card 1: both names and the category the storefront files the product under.
 *
 * The options are the shop's real categories (`GET /api/admin/categories`), and
 * the draft keeps the category **id** because that is what the product body
 * takes.
 */
export function BasicInfoCard({
  draft,
  categories,
  categoriesLoading = false,
  onChange,
  errorFor,
  onBlurField,
}: BasicInfoCardProps) {
  const categoryError = errorFor("category")
  const noCategories = !categoriesLoading && categories.length === 0

  // Feeds `Select.Value` so the trigger shows the label, not the raw id.
  const items = categories.map((category) => ({
    value: category.id,
    label: `${category.nameMy} • ${category.nameEn}`,
  }))

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
        hint={
          noCategories
            ? "No categories yet — create one before adding products."
            : undefined
        }
      >
        <Select
          items={items}
          value={draft.category || null}
          onValueChange={(value) => onChange({ category: value ?? "" })}
          disabled={categories.length === 0}
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
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.nameMy} • {category.nameEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {noCategories ? (
        <Link
          to={ROUTES.categories}
          className="w-fit text-xs font-semibold text-primary hover:underline"
        >
          Go to categories →
        </Link>
      ) : null}
    </FormCard>
  )
}
