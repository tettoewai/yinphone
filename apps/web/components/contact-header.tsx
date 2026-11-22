import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ContactHeader() {
  return (
    <header className="flex items-center gap-1 border-b border-border bg-background px-3 py-2">
      <Link
        href="/"
        aria-label="Go back to home"
        className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-md"
      >
        <ArrowLeft className="size-[22px] text-foreground" strokeWidth={2.2} />
      </Link>

      <div className="min-w-0 flex-1 text-center">
        <h1 className="truncate font-body text-base leading-[1.7] font-bold text-foreground">
          ဆက်သွယ်ရန်
        </h1>
        <div className="-mt-1 text-xs text-muted-foreground">Contact us</div>
      </div>

      <div className="w-[44px] shrink-0" />
    </header>
  )
}
