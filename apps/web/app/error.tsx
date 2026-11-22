"use client"

import { Info, RotateCcw } from "lucide-react"
import { useEffect } from "react"

export default function GlobalError({
  error,
  retry,
}: {
  error: unknown
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto flex w-full max-w-md min-w-0 flex-1 flex-col items-center px-6 py-16 text-center font-body">
      <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-secondary">
        <Info className="size-[34px] text-primary" strokeWidth={1.6} />
      </div>
      <h1 className="pt-5 font-body text-xl leading-[1.7] font-bold text-foreground">
        တစ်ခုခု မှားယွင်းနေပါတယ်
      </h1>
      <div className="text-sm text-muted-foreground">Something went wrong</div>
      <p className="max-w-[280px] pt-2 font-body text-sm leading-[1.8] text-muted-foreground">
        စာမျက်နှာကို ပြန်လည်ဖွင့်ကြည့်ပါ။ မရသေးရင် Messenger မှာ
        ဆက်သွယ်နိုင်ပါတယ်။
      </p>
      <button
        type="button"
        onClick={retry}
        className="mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-bold text-primary-foreground"
      >
        <RotateCcw className="size-4" strokeWidth={3.2} />
        ထပ်စမ်းကြည့်မည် • Try again
      </button>
    </div>
  )
}
