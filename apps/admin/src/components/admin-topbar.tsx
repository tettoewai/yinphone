import { Button } from "@workspace/ui/components/button"
import { ChevronRight, LogOut, Menu } from "lucide-react"
import { Link, useLocation, useMatch } from "react-router-dom"

import { useSession } from "@/auth/session-context"
import { navItemForPath } from "@/lib/admin-nav"
import { ROUTES } from "@/lib/routes"

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
}

function roleLabel(role: "OWNER" | "STAFF" | undefined) {
  if (role === "OWNER") return "Owner"
  if (role === "STAFF") return "Staff"
  return "Admin"
}

type AdminTopbarProps = {
  onOpenNav: () => void
}

/**
 * Breadcrumb bar from the mock. The mock's language toggle is omitted: every
 * screen is already bilingual inline and there is no locale switching behind
 * it (same call as `AuthShell`). Sign-out is an explicit button rather than a
 * menu because the chip has nothing else to hold yet.
 */
export function AdminTopbar({ onOpenNav }: AdminTopbarProps) {
  const { pathname } = useLocation()
  const { user, signOut } = useSession()

  const current = navItemForPath(pathname)?.label ?? "Admin"
  // The screens that add a crumb of their own; the last segment names it.
  const orderDetail = useMatch(ROUTES.orderDetail)
  const productNew = useMatch(ROUTES.productNew)

  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-3 border-b border-border bg-card px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
        <button
          type="button"
          onClick={onOpenNav}
          aria-label="Open navigation"
          className="-ml-1 flex size-9 shrink-0 items-center justify-center rounded-md hover:bg-muted hover:text-foreground lg:hidden"
        >
          <Menu className="size-5" />
        </button>
        <span className="hidden truncate sm:inline">YinPhone Boutique</span>
        <ChevronRight
          className="hidden size-[13px] shrink-0 sm:block"
          strokeWidth={3.7}
        />
        {productNew ? (
          <>
            <Link
              to={ROUTES.products}
              className="truncate hover:text-foreground"
            >
              {current}
            </Link>
            <ChevronRight className="size-[13px] shrink-0" strokeWidth={3.7} />
            <span className="truncate font-semibold text-foreground">
              Add product
            </span>
          </>
        ) : orderDetail ? (
          <>
            <Link to={ROUTES.orders} className="truncate hover:text-foreground">
              {current}
            </Link>
            <ChevronRight className="size-[13px] shrink-0" strokeWidth={3.7} />
            <span className="truncate font-semibold text-foreground">
              {orderDetail.params.code}
            </span>
          </>
        ) : (
          <span className="truncate font-semibold text-foreground">
            {current}
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        <div className="flex min-h-11 items-center gap-2 rounded-md border border-border bg-card pr-3 pl-1">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-secondary text-sm font-bold text-primary">
            {initialsOf(user?.name ?? "Admin")}
          </span>
          <div className="hidden min-w-0 leading-tight sm:block">
            <div className="max-w-[180px] truncate text-[13px] font-bold text-foreground">
              {user?.name ?? "Admin"}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {roleLabel(user?.role)}
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => void signOut()}
          aria-label="Sign out"
          className="min-h-11 gap-1.5 px-3 text-sm font-semibold sm:px-4"
        >
          <LogOut />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    </header>
  )
}
