import { Button } from "@workspace/ui/components/button"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@workspace/ui/components/pagination"
import { ChevronLeft, ChevronRight } from "lucide-react"

import {
  PAGE_SIZES,
  pageWindow,
  type PageSize,
} from "@/lib/orders"

type OrdersPaginationProps = {
  page: number
  pageSize: PageSize
  total: number
  pageCount: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: PageSize) => void
}

/**
 * The table footer: page size on the left, page numbers on the right.
 *
 * Paging is local state, not a URL, so the navigation is built from `Button`s
 * rather than `PaginationLink` — that helper renders an anchor, and an empty or
 * `#` href would be a worse affordance than a real button.
 */
export function OrdersPagination({
  page,
  pageSize,
  total,
  pageCount,
  onPageChange,
  onPageSizeChange,
}: OrdersPaginationProps) {
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>Rows:</span>
        {PAGE_SIZES.map((size) => (
          <Button
            key={size}
            variant={size === pageSize ? "default" : "outline"}
            size="sm"
            aria-pressed={size === pageSize}
            onClick={() => onPageSizeChange(size)}
            className="min-h-9 rounded-sm px-3 font-bold"
          >
            {size}
          </Button>
        ))}
        <span className="pl-2 tabular-nums">
          {first}–{last} of {total} • Page {page}/{pageCount}
        </span>
      </div>

      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="size-11 rounded-md"
            >
              <ChevronLeft className="size-4" strokeWidth={3} />
            </Button>
          </PaginationItem>

          {pageWindow(page, pageCount).map((entry, index) =>
            entry === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis className="size-11" />
              </PaginationItem>
            ) : (
              <PaginationItem key={entry}>
                <Button
                  variant={entry === page ? "default" : "outline"}
                  size="icon"
                  aria-label={`Page ${entry}`}
                  aria-current={entry === page ? "page" : undefined}
                  onClick={() => onPageChange(entry)}
                  className="size-11 rounded-md text-sm font-bold"
                >
                  {entry}
                </Button>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next page"
              disabled={page >= pageCount}
              onClick={() => onPageChange(page + 1)}
              className="size-11 rounded-md"
            >
              <ChevronRight className="size-4" strokeWidth={3} />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
