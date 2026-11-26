import { Button } from "@workspace/ui/components/button"
import { Banknote, Bell, Plus, ShoppingBag, Truck } from "lucide-react"

import { useSession } from "@/auth/session-context"
import { AdminPageHeader } from "@/components/admin-page-header"
import { ChannelSplit } from "@/components/dashboard/channel-split"
import { useDashboard } from "@/components/dashboard/dashboard-context"
import { GreetingCard } from "@/components/dashboard/greeting-card"
import { KpiCard, type Kpi } from "@/components/dashboard/kpi-card"
import {
  OrdersEmptyState,
  RecentOrders,
} from "@/components/dashboard/recent-orders"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { DashboardSkeleton } from "@/components/states/dashboard-skeleton"
import { RequestError } from "@/components/states/request-error"
import { ApiError, type AdminDashboardOverview } from "@/lib/api"
import {
  formatOrderDelta,
  toChannelShares,
  toDailySales,
  toRecentOrders,
} from "@/lib/dashboard"
import { formatMmk } from "@/lib/format"
import { yangonNow } from "@/lib/yangon-time"

/** The four headline figures, derived from the overview payload. */
function buildKpis(overview: AdminDashboardOverview): Kpi[] {
  const { today, pending } = overview

  return [
    {
      key: "orders-today",
      icon: ShoppingBag,
      value: String(today.orders),
      label: "ယနေ့ မှာယူမှုများ",
      detail: `Today's orders • ${formatOrderDelta(today.orders, today.ordersYesterday)}`,
    },
    {
      key: "sales-today",
      icon: Banknote,
      value: formatMmk(today.salesMmk),
      label: "ယနေ့ ရောင်းအား",
      detail: `Today's sales • ${today.salesOrders} orders counted`,
    },
    {
      key: "awaiting-confirm",
      icon: Bell,
      value: `${pending.new} NEW`,
      label: "အတည်ပြုရန် ကျန်",
      detail: "Awaiting confirm • needs a reply on chat",
      highlight: pending.new > 0,
      badge: pending.new > 0 ? "NEW" : undefined,
    },
    {
      key: "to-deliver",
      icon: Truck,
      value: String(pending.confirmed),
      label: "ပို့ရန် ကျန်",
      detail: "Confirmed • ready to dispatch",
    },
  ]
}

export function DashboardPage() {
  const { user } = useSession()
  const { overview, error, reload } = useDashboard()
  const nowDate = new Date()
  const now = yangonNow(nowDate)

  return (
    <>
      <AdminPageHeader
        title="ဒက်ရှ်ဘုတ်"
        subtitle={`Dashboard overview • ${now.shortDate}, Yangon time`}
        actions={
          <Button
            disabled
            title="Coming soon"
            className="min-h-12 gap-2 px-5 text-sm font-bold"
          >
            <Plus className="size-4" strokeWidth={3} />
            ထုတ်ကုန်အသစ်
          </Button>
        }
      />

      <main className="flex flex-1 flex-col gap-5 px-4 py-5 sm:px-6">
        <GreetingCard name={user?.name ?? "Admin"} now={now} />

        {error ? (
          <RequestError
            detail={error instanceof ApiError ? error.message : undefined}
            onRetry={reload}
          />
        ) : overview === null ? (
          <DashboardSkeleton showTitle={false} />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {buildKpis(overview).map((kpi) => (
                <KpiCard key={kpi.key} kpi={kpi} />
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-5">
              <SalesChart days={toDailySales(overview.salesLast7Days)} />
              <ChannelSplit channels={toChannelShares(overview.channels)} />
            </div>

            {overview.recentOrders.length === 0 ? (
              <OrdersEmptyState />
            ) : (
              <RecentOrders
                orders={toRecentOrders(overview.recentOrders, nowDate)}
              />
            )}
          </>
        )}
      </main>
    </>
  )
}
