import { cn } from "@workspace/ui/lib/utils"

import type { AdminCategory } from "@/lib/categories"

type StorefrontMenuCardProps = {
  categories: readonly AdminCategory[]
}

/**
 * The storefront menu as shoppers see it, derived from the same list the sort
 * card edits — so a drag or a rename shows up here once it is saved.
 *
 * The first category carries the design's highlighted row: it is the menu's
 * default landing category.
 */
export function StorefrontMenuCard({ categories }: StorefrontMenuCardProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h2 className="text-[11px] font-bold text-muted-foreground">
        STOREFRONT MENU • LIVE PREVIEW
      </h2>

      <div className="mt-2 flex flex-col gap-1 rounded-md border border-border bg-background p-3">
        {categories.length === 0 ? (
          <p className="px-3 py-3 font-body text-xs leading-[1.7] text-muted-foreground">
            No categories yet — add one to see it here.
          </p>
        ) : (
          categories.map((category, index) => (
            <div
              key={category.id}
              className={cn(
                "flex min-h-11 items-center justify-between gap-2 rounded-md px-3 text-sm",
                index === 0
                  ? "bg-primary font-bold text-primary-foreground"
                  : "text-foreground"
              )}
            >
              <span className="min-w-0 truncate font-body">
                {category.nameMy}{" "}
                <span className="text-xs opacity-70">{category.nameEn}</span>
              </span>
              <span className="shrink-0 text-xs opacity-70">
                {category.productCount}
              </span>
            </div>
          ))
        )}
      </div>

      <p className="pt-2 font-body text-xs leading-[1.7] text-muted-foreground">
        Drag rows on the left — menu updates in the same order.
      </p>
    </section>
  )
}
