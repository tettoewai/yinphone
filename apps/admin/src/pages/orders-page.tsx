import { Button } from "@workspace/ui/components/button"
import { Plus } from "lucide-react"
import { useMemo, useState } from "react"

import { AdminPageHeader } from "@/components/admin-page-header"
import { OrderFilters } from "@/components/orders/order-filters"
import { OrderListEmpty } from "@/components/orders/order-list-empty"
import { OrdersMobileList } from "@/components/orders/orders-mobile-list"
import { OrdersPagination } from "@/components/orders/orders-pagination"
import { OrdersTable } from "@/components/orders/orders-table"
import { StatusFilterPills } from "@/components/orders/status-filter-pills"
import {
  DEFAULT_PAGE_SIZE,
  filterOrders,
  statusCounts,
  type ChannelSlug,
  type DateRangeKey,
  type OrderStatus,
  type PageSize,
} from "@/lib/orders"
import { ORDERS_GENERATED_AT, ORDERS_MOCK } from "@/lib/orders-mock"
import { paginate, pageCountFor } from "@/lib/paging"

/**
 * The orders list (`/orders`).
 *
 * Every row comes from `orders-mock.ts` — there is no `GET /api/orders` yet.
 * Filtering, counting and paging happen in the browser for the same reason:
 * 24 rows fit in one response, and doing it here keeps the interaction instant
 * while the endpoint is designed. When it lands, replace the `ORDERS_MOCK`
 * reference and move the three helpers in `lib/orders.ts` to the query string.
 *
 * Filtering is applied in a deliberate order — search, channel and range first,
 * then the status counts, then the status filter, then paging — so a pill's
 * count always describes what selecting it would show.
 */
export function OrdersPage() {
  const [query, setQuery] = useState("")
  const [channel, setChannel] = useState<ChannelSlug | "all">("all")
  const [range, setRange] = useState<DateRangeKey>("7d")
  const [status, setStatus] = useState<OrderStatus | "all">("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSize>(DEFAULT_PAGE_SIZE)

  // `ORDERS_GENERATED_AT` is the instant the mock rows were stamped against, so
  // "Today" and "Last 7 days" agree with the data for the life of the session.
  const inScope = useMemo(
    () =>
      filterOrders(ORDERS_MOCK, { query, channel, range }, ORDERS_GENERATED_AT),
    [query, channel, range]
  )

  const counts = useMemo(() => statusCounts(inScope), [inScope])

  const visible = useMemo(
    () =>
      status === "all"
        ? inScope
        : inScope.filter((order) => order.status === status),
    [inScope, status]
  )

  const pageCount = pageCountFor(visible.length, pageSize)
  // A filter can leave the page pointer past the end; clamping keeps the footer
  // and the visible rows in agreement without a state-syncing effect.
  const currentPage = Math.min(page, pageCount)
  const rows = paginate(visible, currentPage, pageSize)

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
        subtitle={`Orders • ${ORDERS_MOCK.length} orders • Asia/Yangon`}
        actions={
          <Button
            disabled
            title="Coming soon"
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
            total={inScope.length}
            counts={counts}
            onChange={changeStatus}
          />
        </OrderFilters>

        {visible.length === 0 ? (
          <OrderListEmpty onClear={clearFilters} />
        ) : (
          <section className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="hidden md:block">
              <OrdersTable orders={rows} />
            </div>
            <div className="md:hidden">
              <OrdersMobileList orders={rows} />
            </div>
            <OrdersPagination
              page={currentPage}
              pageSize={pageSize}
              total={visible.length}
              pageCount={pageCount}
              onPageChange={setPage}
              onPageSizeChange={changePageSize}
            />
          </section>
        )}
      </main>
    </>
  )
}
