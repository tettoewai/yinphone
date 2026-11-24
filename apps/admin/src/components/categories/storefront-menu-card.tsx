import { cn } from "@workspace/ui/lib/utils"

import { visibleCategories, type AdminCategory } from "@/lib/categories"

type StorefrontMenuCardProps = {
  categories: readonly AdminCategory[]
}

/**
 * The storefront menu as shoppers see it, derived from the same list the sort
 * card edits — so a drag, a rename or a toggle shows up here immediately.
 *
 * The first visible category carries the design's highlighted row: it is the
 * menu's default landing category. Hidden ones are left out entirely, which is
 * the one place the toggle's effect is visible at a glance.
 */
export function StorefrontMenuCard({ categories }: StorefrontMenuCardProps) {
  const visible = visibleCategories(categories)
  const hidden = categories.length - visible.length
  const hiddenNote =
    hidden === 1
      ? "1 category is switched off — its products stay, but it leaves this menu."
      : `${hidden} categories are switched off — their products stay, but they leave this menu.`

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h2 className="text-[11px] font-bold text-muted-foreground">
        STOREFRONT MENU • LIVE PREVIEW
      </h2>

      <div className="mt-2 flex flex-col gap-1 rounded-md border border-border bg-background p-3">
        {visible.length === 0 ? (
          <p className="px-3 py-3 font-body text-xs leading-[1.7] text-muted-foreground">
            No categories are switched on — turn one on to see it here.
          </p>
        ) : (
          visible.map((category, index) => (
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

      {hidden > 0 ? (
        <p className="font-body text-xs leading-[1.7] text-muted-foreground">
          {hiddenNote}
        </p>
      ) : null}
    </section>
  )
}
