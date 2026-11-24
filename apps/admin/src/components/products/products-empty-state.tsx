import { Button, buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { Plus, SearchX, Shirt, X } from "lucide-react"
import { Link } from "react-router-dom"

import { ROUTES } from "@/lib/routes"

/**
 * What the list shows once the shop has no products at all. Unreachable while
 * the page runs on `PRODUCTS_MOCK`, but it is the first thing a new shop sees,
 * so it exists before the products API makes it reachable.
 */
export function ProductsEmpty() {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-lg border-2 border-dashed border-border bg-card px-6 py-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-secondary">
        <Shirt className="size-[22px] text-primary" strokeWidth={2.2} />
      </span>

      <p className="font-body text-sm leading-[1.7] font-bold text-foreground">
        ထုတ်ကုန် မရှိသေးပါ
      </p>
      <p className="max-w-[320px] text-xs leading-[1.7] text-muted-foreground">
        No products yet • Tip: add 3+ bright photos per item — sales double.
      </p>

      <Link
        to={ROUTES.productNew}
        className={cn(
          buttonVariants(),
          "mt-1.5 min-h-12 gap-2 px-5 text-sm font-bold"
        )}
      >
        <Plus className="size-[15px]" strokeWidth={3.2} />
        Add your first product
      </Link>
    </div>
  )
}

/**
 * What the table shows when the filters exclude every product — a way out
 * rather than an empty grid with no explanation.
 */
export function ProductsListEmpty({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border bg-card px-6 py-8 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-secondary">
        <SearchX className="size-[22px] text-primary" strokeWidth={2.2} />
      </span>

      <p className="font-body text-sm leading-[1.7] font-bold text-foreground">
        စစ်ထုတ်မှုနှင့် ကိုက်ညီသော ထုတ်ကုန် မရှိပါ
      </p>
      <p className="text-xs text-muted-foreground">
        No products match these filters
      </p>

      <Button
        variant="secondary"
        onClick={onClear}
        className="mt-1 min-h-11 gap-1.5 px-5 text-sm font-bold"
      >
        <X className="size-[15px]" strokeWidth={3.2} />
        Clear filters
      </Button>
    </div>
  )
}
