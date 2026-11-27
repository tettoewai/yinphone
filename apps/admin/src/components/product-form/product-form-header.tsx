import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

import { ROUTES } from "@/lib/routes"

type ProductFormHeaderProps = {
  /** `create` is the add screen; `edit` is an existing product. */
  mode: "create" | "edit"
  /**
   * How many required fields are still empty; 0 reads as "ready to save".
   * `null` while the product loads, so the chip is not shown for a draft that
   * does not exist yet.
   */
  requiredLeft: number | null
}

/**
 * Title block of the product editor: the way back, the bilingual title and the
 * progress chip. The breadcrumb above it belongs to `AdminTopbar`, which knows
 * the route.
 */
export function ProductFormHeader({
  mode,
  requiredLeft,
}: ProductFormHeaderProps) {
  const editing = mode === "edit"

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-3 sm:px-6">
      <div className="min-w-0">
        <Link
          to={ROUTES.products}
          className="flex min-h-11 w-fit items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="size-4" strokeWidth={3} />
          <span className="font-body">ထုတ်ကုန်များသို့ ပြန်ရန်</span>
        </Link>

        <h1 className="font-body text-2xl leading-[1.7] font-bold text-foreground">
          {editing ? "ထုတ်ကုန် ပြင်ဆင်ရန်" : "ထုတ်ကုန်အသစ် ထည့်ရန်"}
        </h1>
        <p className="-mt-1 text-sm text-muted-foreground">
          {editing
            ? "Edit product • Changes are saved when you press Save"
            : "Add product • Nothing is saved until you press Save"}
        </p>
      </div>

      <RequiredChip count={requiredLeft} />
    </div>
  )
}

function RequiredChip({ count }: { count: number | null }) {
  if (count === null) return null

  if (count === 0) {
    return (
      <span className="flex min-h-11 items-center gap-2 rounded-md border border-primary/30 bg-secondary px-4 text-sm font-semibold text-primary">
        <span className="inline-block size-2 rounded-xl bg-primary" />
        Ready to save
      </span>
    )
  }

  return (
    <span className="flex min-h-11 items-center gap-2 rounded-md border border-accent bg-accent/20 px-4 text-sm font-semibold text-accent-foreground">
      <span className="inline-block size-2 rounded-xl bg-accent" />
      {count} required {count === 1 ? "field" : "fields"} left
    </span>
  )
}
