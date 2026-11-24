import { Button } from "@workspace/ui/components/button"
import { SearchX, X } from "lucide-react"

/**
 * What the list shows when the filters exclude every order. The copy is the
 * design's: Burmese headline, English sub-line, and a single way out — clearing
 * the filters rather than an empty table with no explanation.
 */
export function OrderListEmpty({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border bg-card px-6 py-8 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-secondary">
        <SearchX className="size-[22px] text-primary" strokeWidth={2.2} />
      </span>

      <p className="font-body text-sm leading-[1.7] font-bold text-foreground">
        စစ်ထုတ်မှုနှင့် ကိုက်ညီသော မှာယူမှု မရှိပါ
      </p>
      <p className="text-xs text-muted-foreground">
        No orders match these filters
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
