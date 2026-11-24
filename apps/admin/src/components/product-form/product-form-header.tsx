import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

import { ROUTES } from "@/lib/routes"

type ProductFormHeaderProps = {
  /** How many required fields are still empty; 0 reads as "ready to save". */
  requiredLeft: number
}

/**
 * Title block of the add-product screen: the way back, the bilingual title and
 * the progress chip. The breadcrumb above it belongs to `AdminTopbar`, which
 * knows the route.
 */
export function ProductFormHeader({ requiredLeft }: ProductFormHeaderProps) {
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
          ထုတ်ကုန်အသစ် ထည့်ရန်
        </h1>
        {/* The design prints a mock auto-save time here. The draft only lives in
            this tab, so the line says that instead of claiming it was saved. */}
        <p className="-mt-1 text-sm text-muted-foreground">
          Add product • Nothing is saved until you press Save
        </p>
      </div>

      <RequiredChip count={requiredLeft} />
    </div>
  )
}

function RequiredChip({ count }: { count: number }) {
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
