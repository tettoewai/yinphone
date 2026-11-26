import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"

/**
 * Table-shaped placeholder shared by every list screen. Rows echo the real
 * tables — a 36px thumb, two text lines and a 64px status chip — so the layout
 * does not jump when the data lands.
 */
export function TableSkeleton({
  rows = 4,
  className,
}: {
  rows?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-border",
        className
      )}
      aria-hidden="true"
    >
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 border-b border-border bg-background px-3.5 py-3 last:border-b-0"
        >
          <Skeleton className="size-9 shrink-0 rounded-md" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-2.5 w-2/3 rounded-sm" />
            <Skeleton className="h-2 w-1/3 rounded-sm bg-muted/70" />
          </div>
          <Skeleton className="h-6 w-16 shrink-0 rounded-sm" />
        </div>
      ))}
    </div>
  )
}

function StatSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-background p-3">
      <Skeleton className="h-2.5 w-16 rounded-sm" />
      <Skeleton className="h-5 w-20 rounded-sm" />
      <Skeleton className="h-2 w-24 rounded-sm bg-muted/70" />
    </div>
  )
}

/**
 * Loading state for the dashboard: the KPI row, then the recent-orders table.
 *
 * Soft blocks rather than spinners, per the design — a spinner would replace
 * the page with a single dot, while this keeps the final layout in place so the
 * swap to real numbers is quiet.
 */
export function DashboardSkeleton({
  kpis = 4,
  rows = 4,
  showTitle = true,
  className,
}: {
  kpis?: number
  rows?: number
  /** Off when the skeleton is embedded in a card that has its own heading. */
  showTitle?: boolean
  className?: string
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex flex-col gap-5", className)}
    >
      <span className="sr-only">ခဏစောင့်ပါ… • Loading…</span>

      {showTitle ? <Skeleton className="h-9 w-56 rounded-md" /> : null}

      <div
        className={cn(
          "grid gap-2.5",
          kpis > 3 ? "grid-cols-2 xl:grid-cols-4" : "grid-cols-3"
        )}
      >
        {Array.from({ length: kpis }, (_, index) => (
          <StatSkeleton key={index} />
        ))}
      </div>

      <div className="overflow-hidden rounded-md border border-border">
        <div className="flex items-center gap-3 border-b border-border bg-background px-3.5 py-3">
          <Skeleton className="h-2.5 w-32 rounded-sm" />
          <Skeleton className="ml-auto h-6 w-20 rounded-sm bg-muted/70" />
        </div>
        <TableSkeleton rows={rows} className="rounded-none border-0" />
      </div>
    </div>
  )
}
