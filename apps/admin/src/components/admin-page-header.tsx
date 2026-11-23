import type { ReactNode } from "react"

type AdminPageHeaderProps = {
  title: string
  subtitle?: string
  actions?: ReactNode
}

/** The title row that sits under the breadcrumb bar on every admin screen. */
export function AdminPageHeader({
  title,
  subtitle,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-3 sm:px-6">
      <div className="min-w-0">
        <h1 className="font-body text-2xl leading-[1.7] font-bold text-foreground">
          {title}
        </h1>
        {subtitle ? (
          <p className="-mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}
