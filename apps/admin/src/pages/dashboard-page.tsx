import { Button } from "@workspace/ui/components/button"
import { Banknote, Bell, Plus, ShoppingBag, Truck } from "lucide-react"

import { useSession } from "@/auth/session-context"
import { AdminPageHeader } from "@/components/admin-page-header"
import { ChannelSplit } from "@/components/dashboard/channel-split"
import { GreetingCard } from "@/components/dashboard/greeting-card"
import { KpiCard, type Kpi } from "@/components/dashboard/kpi-card"
import {
  OrdersEmptyState,
  RecentOrders,
} from "@/components/dashboard/recent-orders"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { RECENT_ORDERS } from "@/lib/dashboard-mock"
import { yangonNow } from "@/lib/yangon-time"

/** Today's headline figures. Placeholder values until the stats API exists. */
const KPIS: readonly Kpi[] = [
  {
    key: "orders-today",
    icon: ShoppingBag,
    value: "14",
    label: "ယနေ့ မှာယူမှုများ",
    detail: "Today's orders • +3 vs yesterday",
  },
  {
    key: "sales-today",
    icon: Banknote,
    value: "684,500 Ks",
    label: "ယနေ့ ရောင်းအား",
    detail: "Today's sales • 12 orders paid",
  },
  {
    key: "awaiting-confirm",
    icon: Bell,
    value: "6 NEW",
    label: "အတည်ပြုရန် ကျန်",
    detail: "Awaiting confirm • Needs reply < 1 hr",
    highlight: true,
    badge: "GOLD • NEW",
  },
  {
    key: "to-deliver",
    icon: Truck,
    value: "9",
    label: "ပို့ရန် ကျန်",
    detail: "To deliver • 4 Royal • 5 Ninja",
  },
]

export function DashboardPage() {
  const { user } = useSession()
  const now = yangonNow()

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

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {KPIS.map((kpi) => (
            <KpiCard key={kpi.key} kpi={kpi} />
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          <SalesChart />
          <ChannelSplit />
        </div>

        {RECENT_ORDERS.length === 0 ? (
          <OrdersEmptyState />
        ) : (
          <RecentOrders orders={RECENT_ORDERS} />
        )}
      </main>
    </>
  )
}
