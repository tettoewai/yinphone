/**
 * Paging helpers shared by the admin list screens.
 *
 * These are plain functions over arrays rather than one screen's internals, so
 * the orders footer and the products footer draw the same page window. When the
 * list endpoints land, only the callers change — paging moves into the query
 * string and the slices here stop being used.
 */

export function paginate<T>(
  items: readonly T[],
  page: number,
  pageSize: number
) {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}

export function pageCountFor(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize))
}

/** `"ellipsis"` marks a collapsed gap between page numbers. */
export type PageWindowEntry = number | "ellipsis"

/**
 * Page numbers to render: every page while there are seven or fewer, otherwise
 * the first, the last and the selected page's neighbours.
 */
export function pageWindow(page: number, pageCount: number): PageWindowEntry[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, pageCount])
  for (const candidate of [page - 1, page, page + 1]) {
    if (candidate > 1 && candidate < pageCount) pages.add(candidate)
  }

  const ordered = [...pages].sort((a, b) => a - b)
  const window: PageWindowEntry[] = []
  let previous = 0

  for (const current of ordered) {
    if (current - previous > 1) window.push("ellipsis")
    window.push(current)
    previous = current
  }

  return window
}
