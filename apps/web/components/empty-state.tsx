import { RotateCcw, ShoppingBasket } from "lucide-react"

type EmptyStateProps = {
  onClear: () => void
}

export default function EmptyState({ onClear }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-secondary">
        <ShoppingBasket
          className="size-[34px] text-primary"
          strokeWidth={1.41}
        />
      </div>
      <div className="font-body text-base leading-[1.7] font-semibold text-foreground">
        ဤအမျိုးအစားတွင် ပစ္စည်းမရှိသေးပါ
      </div>
      <div className="-mt-2 text-sm text-muted-foreground">
        No items in this category yet
      </div>
      <div className="font-body text-sm leading-[1.7] text-muted-foreground">
        တခြားဈေးနှုန်း သို့မဟုတ် ဆိုဒ်ဖြင့် ရှာကြည့်ပါ
      </div>
      <button
        type="button"
        onClick={onClear}
        className="mt-1 flex min-h-[44px] items-center gap-1.5 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground"
      >
        <RotateCcw className="size-[15px]" strokeWidth={3.2} />
        <span className="font-body">Filters များ ရှင်းလင်းမည်</span>
      </button>
    </div>
  )
}
