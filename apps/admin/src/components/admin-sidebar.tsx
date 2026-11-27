import { NavLink } from "react-router-dom"
import { BrandMark } from "@workspace/ui/components/brand-mark"
import { cn } from "@workspace/ui/lib/utils"

import { ADMIN_NAV, type AdminNavItem } from "@/lib/admin-nav"

type AdminSidebarProps = {
  className?: string
  /** Called after a nav link is followed, e.g. to close the mobile drawer. */
  onNavigate?: () => void
  /** Live NEW-order count for the orders chip; `undefined` hides the chip. */
  pendingOrders?: number
}

function NavItemBody({ item, badge }: { item: AdminNavItem; badge?: number }) {
  const Icon = item.icon

  return (
    <>
      <Icon className="size-[18px] shrink-0" strokeWidth={2.7} />
      <span className="flex-1">
        <span className="block font-body text-sm leading-[1.7] font-bold">
          {item.label}
        </span>
        <span className="-mt-0.5 block text-[11px] opacity-70">
          {item.labelEn}
        </span>
      </span>
      {badge ? (
        <span className="flex h-6 min-w-6 items-center justify-center rounded-sm bg-accent px-1.5 text-xs font-bold text-accent-foreground">
          {badge}
        </span>
      ) : null}
    </>
  )
}

/**
 * The shop's navigation rail from the design mock. Below `lg` it is only
 * mounted inside the layout's drawer, so it always renders at full width.
 */
export function AdminSidebar({
  className,
  onNavigate,
  pendingOrders,
}: AdminSidebarProps) {
  function badgeFor(item: AdminNavItem) {
    return item.key === "orders" ? pendingOrders : item.badge
  }

  return (
    <div
      className={cn("flex h-svh w-60 shrink-0 flex-col bg-primary", className)}
    >
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-5">
        <span className="flex size-10 items-center justify-center rounded-md bg-primary-foreground/15">
          <BrandMark className="h-[18px] w-[24px] text-primary-foreground" />
        </span>
        <div>
          <div className="font-heading text-[15px] leading-tight font-bold text-primary-foreground">
            YinPhone
          </div>
          <div className="text-xs text-primary-foreground/70">
            Boutique • Admin
          </div>
        </div>
      </div>

      <nav aria-label="Admin" className="flex flex-col gap-1 px-3">
        {ADMIN_NAV.map((item) => (
          <NavLink
            key={item.key}
            to={item.to}
            end
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex min-h-12 items-center gap-3 rounded-md px-3 transition-colors",
                isActive
                  ? "bg-primary-foreground text-primary"
                  : "text-primary-foreground/80 hover:bg-primary-foreground/10 focus-visible:bg-primary-foreground/10"
              )
            }
          >
            <NavItemBody item={item} badge={badgeFor(item)} />
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-5 pt-4 pb-5 text-center text-[11px] text-primary-foreground/60">
        Admin console • Asia/Yangon
      </div>
    </div>
  )
}
