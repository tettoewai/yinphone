import { Button } from "@workspace/ui/components/button"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@workspace/ui/components/pagination"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { pageWindow } from "@/lib/paging"

type ProductsPaginationProps = {
  page: number
  pageSize: number
  total: number
  pageCount: number
  onPageChange: (page: number) => void
}

/**
 * The table footer from the design: "1–5 of 24 • Page 1/5" on the left, the
 * page window on the right.
 *
 * There is no page-size switcher because the design fixes five rows per page.
 * Paging is local state, not a URL, so the controls are real buttons rather
 * than anchors with an empty href.
 */
export function ProductsPagination({
  page,
  pageSize,
  total,
  pageCount,
  onPageChange,
}: ProductsPaginationProps) {
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3">
      <p className="text-xs text-muted-foreground tabular-nums">
        {first}–{last} of {total} • Page {page}/{pageCount}
      </p>

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
