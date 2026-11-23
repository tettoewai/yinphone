import { X } from "lucide-react"
import { useEffect, useState } from "react"
import { Outlet } from "react-router-dom"

import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminTopbar } from "@/components/admin-topbar"

/**
 * Chrome for every signed-in admin screen: the primary rail on desktop, the
 * same rail in a drawer below `lg`, and the breadcrumb bar on top.
 */
export function AdminLayout() {
  const [navOpen, setNavOpen] = useState(false)

  // A drawer left open while the viewport grows would keep the body locked
  // behind a rail that is already visible, so close it at the `lg` breakpoint.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)")
    const closeOnDesktop = () => {
      if (desktop.matches) setNavOpen(false)
    }

    desktop.addEventListener("change", closeOnDesktop)

    return () => desktop.removeEventListener("change", closeOnDesktop)
  }, [])

  useEffect(() => {
    if (!navOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNavOpen(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [navOpen])

  return (
    <div className="flex min-h-svh bg-background font-body">
      <div className="sticky top-0 hidden h-svh shrink-0 lg:block">
        <AdminSidebar />
      </div>

      {navOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setNavOpen(false)}
            className="absolute inset-0 bg-foreground/40"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
            className="relative flex h-full w-60"
          >
            <AdminSidebar onNavigate={() => setNavOpen(false)} />
            <button
              type="button"
              autoFocus
              onClick={() => setNavOpen(false)}
              aria-label="Close navigation"
              className="absolute top-4 right-3 flex size-9 items-center justify-center rounded-md bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25"
            >
              <X className="size-[18px]" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar onOpenNav={() => setNavOpen(true)} />
        <Outlet />
      </div>
    </div>
  )
}
