import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { Plus } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { AdminPageHeader } from "@/components/admin-page-header"
import { ManualOrderDialog } from "@/components/orders/manual-order-dialog"
import { OrderFilters } from "@/components/orders/order-filters"
import { OrderListEmpty } from "@/components/orders/order-list-empty"
import { OrdersMobileList } from "@/components/orders/orders-mobile-list"
import { OrdersPagination } from "@/components/orders/orders-pagination"
import { OrdersTable } from "@/components/orders/orders-table"
import { StatusFilterPills } from "@/components/orders/status-filter-pills"
import { TableSkeleton } from "@/components/states/dashboard-skeleton"
import { RequestError } from "@/components/states/request-error"
import { useOrderList } from "@/hooks/use-orders"
import { ApiError } from "@/lib/api"
import {
  DEFAULT_PAGE_SIZE,
  toOrderSummary,
  type ChannelSlug,
  type DateRangeKey,
  type OrderStatus,
  type PageSize,
} from "@/lib/orders"
import { pageCountFor } from "@/lib/paging"
import { orderDetailPath } from "@/lib/routes"

const EMPTY_COUNTS: Record<OrderStatus, number> = {
  NEW: 0,
  CONFIRMED: 0,
  DELIVERED: 0,
  CANCELLED: 0,
}

/**
 * The orders list (`/orders`).
 *
 * Filtering, counting and paging come from `GET /api/admin/orders`: changing
 * any facet refetches, and the status pill counts are measured before the
 * status filter, so they never collapse to the selected status. The search box
 * is debounced in the hook; everything else applies immediately.
 *
 * "Manual order" opens a dialog for orders taken on chat; creating one jumps
 * straight to its detail screen.
 */
export function OrdersPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [channel, setChannel] = useState<ChannelSlug | "all">("all")
  const [range, setRange] = useState<DateRangeKey>("7d")
  const [status, setStatus] = useState<OrderStatus | "all">("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSize>(DEFAULT_PAGE_SIZE)
  const [manualOpen, setManualOpen] = useState(false)

  const {
    page: list,
    error,
    loading,
    refreshing,
    reload,
  } = useOrderList({
    q: query,
    channel,
    status,
    range,
    page,
    pageSize,
  })

  const total = list?.total ?? 0
  const counts = list?.counts ?? EMPTY_COUNTS
  const pageCount = pageCountFor(total, pageSize)

  const rows = (list?.items ?? []).map(toOrderSummary)
  const otherFiltersTotal =
    counts.NEW + counts.CONFIRMED + counts.DELIVERED + counts.CANCELLED

  function changeQuery(value: string) {
    setQuery(value)
    setPage(1)
  }

  function changeChannel(value: ChannelSlug | "all") {
    setChannel(value)
    setPage(1)
  }

  function changeRange(value: DateRangeKey) {
    setRange(value)
    setPage(1)
  }

  function changeStatus(value: OrderStatus | "all") {
    setStatus(value)
    setPage(1)
  }

  function changePageSize(value: PageSize) {
    setPageSize(value)
    setPage(1)
  }

  /** Stay inside the pages the current result actually has. */
  function changePage(value: number) {
    setPage(Math.min(Math.max(1, value), pageCount))
  }

  function clearFilters() {
    setQuery("")
    setChannel("all")
    setRange("7d")
    setStatus("all")
    setPage(1)
  }

  return (
    <>
      <AdminPageHeader
        title="မှာယူမှုများ"
        subtitle={`Orders • ${total} orders • Asia/Yangon`}
        actions={
          <Button
            onClick={() => setManualOpen(true)}
            className="min-h-12 gap-2 px-5 text-sm font-bold"
          >
            <Plus className="size-4" strokeWidth={3} />
            Manual order
          </Button>
        }
      />

      <main className="flex flex-1 flex-col gap-4 px-4 py-5 sm:px-6">
        <OrderFilters
          query={query}
          onQueryChange={changeQuery}
          channel={channel}
          onChannelChange={changeChannel}
          range={range}
          onRangeChange={changeRange}
        >
          <StatusFilterPills
            value={status}
            total={otherFiltersTotal}
            counts={counts}
            onChange={changeStatus}
          />
        </OrderFilters>

        {error ? (
          <RequestError
            detail={error instanceof ApiError ? error.message : undefined}
            onRetry={reload}
          />
        ) : loading ? (
          <TableSkeleton rows={6} className="rounded-lg" />
        ) : rows.length === 0 ? (
          <OrderListEmpty onClear={clearFilters} />
        ) : (
          <section
            aria-busy={refreshing}
            className={cn(
              "overflow-hidden rounded-lg border border-border bg-card transition-opacity",
              refreshing && "opacity-60"
            )}
          >
            <div className="hidden md:block">
              <OrdersTable orders={rows} />
            </div>
            <div className="md:hidden">
              <OrdersMobileList orders={rows} />
            </div>
            <OrdersPagination
              page={page}
              pageSize={pageSize}
              total={total}
              pageCount={pageCount}
              onPageChange={changePage}
              onPageSizeChange={changePageSize}
            />
          </section>
        )}
      </main>

      {manualOpen ? (
        <ManualOrderDialog
          onOpenChange={setManualOpen}
          onCreated={(code) => {
            setManualOpen(false)
            navigate(orderDetailPath(code))
          }}
        />
      ) : null}
    </>
  )
}
