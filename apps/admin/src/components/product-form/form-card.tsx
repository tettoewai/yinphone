import { cn } from "@workspace/ui/lib/utils"
import type { ReactNode } from "react"

type FormCardProps = {
  /** The numbered badge from the design: 1 Basic info … 4 Photos. */
  step: number
  title: string
  children: ReactNode
  className?: string
}

/** One numbered card in the add-product form, with the shared card chrome. */
export function FormCard({ step, title, children, className }: FormCardProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-border bg-card p-5",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-primary text-xs font-bold text-primary-foreground">
          {step}
        </span>
        <h2 className="min-w-0 font-body text-sm leading-[1.7] font-bold text-foreground">
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}
