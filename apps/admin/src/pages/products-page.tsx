import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { Plus } from "lucide-react"
import { useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"

import { AdminPageHeader } from "@/components/admin-page-header"
import { HideProductDialog } from "@/components/products/hide-product-dialog"
import { ProductFilters } from "@/components/products/product-filters"
import { ProductsChangeBanner } from "@/components/products/products-change-banner"
import {
  ProductsEmpty,
  ProductsListEmpty,
} from "@/components/products/products-empty-state"
import { ProductsMobileList } from "@/components/products/products-mobile-list"
import { ProductsPagination } from "@/components/products/products-pagination"
import { ProductsTable } from "@/components/products/products-table"
import { paginate, pageCountFor } from "@/lib/paging"
import {
  PRODUCTS_PAGE_SIZE,
  UNDO_SECONDS,
  categoryOptions,
  copyOfProduct,
  filterByStock,
  filterProducts,
  matchesVisibility,
  sortProducts,
  stockCounts,
  type ProductChange,
  type ProductSort,
  type ProductSummary,
  type StockFilter,
  type VisibilityFilter,
} from "@/lib/products"
import { PRODUCTS_MOCK } from "@/lib/products-mock"
import { ROUTES } from "@/lib/routes"

/**
 * The products list (`/products`).
 *
 * Every row comes from `products-mock.ts` — there is no `GET /api/products`
 * yet. Filtering, counting, sorting and paging happen in the browser for the
 * same reason: 24 rows fit in one response, and doing it here keeps the
 * interaction instant while the endpoint is designed. When it lands, replace
 * `PRODUCTS_MOCK` and turn the four mutators below into requests.
 *
 * Hiding and duplicating mutate local state and report through one banner with
 * a ten-second Undo. Filtering runs query and category first, then the stock
 * counts, then the stock chip, then the SHOWING view — so a chip's count always
 * describes what selecting it would show.
 */
export function ProductsPage() {
  const [products, setProducts] = useState<ProductSummary[]>(() => [
    ...PRODUCTS_MOCK,
  ])
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [stock, setStock] = useState<StockFilter>("all")
  const [visibility, setVisibility] = useState<VisibilityFilter>("active")
  const [sort, setSort] = useState<ProductSort>("default")
  const [page, setPage] = useState(1)
  const [change, setChange] = useState<ProductChange | null>(null)
  const [hideTarget, setHideTarget] = useState<ProductSummary | null>(null)
  const copies = useRef(0)

  const categories = useMemo(() => categoryOptions(products), [products])

  const inScope = useMemo(
    () => filterProducts(products, { query, category }),
    [products, query, category]
  )

  const counts = useMemo(() => stockCounts(inScope), [inScope])

  const visible = useMemo(() => {
    const byStock = filterByStock(inScope, stock)
    // A product hidden a moment ago stays on screen for the undo window, even
    // when SHOWING is "Active" — otherwise the row disappears from under the
    // pointer and the banner's Undo has nothing to restore in place.
    const pinnedId = change?.kind === "hidden" ? change.id : null

    return sortProducts(
      byStock.filter(
        (product) =>
          product.id === pinnedId || matchesVisibility(product, visibility)
      ),
      sort
    )
  }, [inScope, stock, visibility, sort, change])

  const pageCount = pageCountFor(visible.length, PRODUCTS_PAGE_SIZE)
  // A change can leave the page pointer past the end; clamping keeps the footer
  // and the rows in agreement without a state-syncing effect.
  const currentPage = Math.min(page, pageCount)
  const rows = paginate(visible, currentPage, PRODUCTS_PAGE_SIZE)

  function changeQuery(value: string) {
    setQuery(value)
    setPage(1)
  }

  function changeCategory(value: string) {
    setCategory(value)
    setPage(1)
  }

  function changeStock(value: StockFilter) {
    setStock(value)
    setPage(1)
  }

  function changeVisibility(value: VisibilityFilter) {
    setVisibility(value)
    setPage(1)
  }

  function changeSort(value: ProductSort) {
    setSort(value)
    setPage(1)
  }

  function clearFilters() {
    setQuery("")
    setCategory("all")
    setStock("all")
    setVisibility("active")
    setSort("default")
    setPage(1)
  }

  function hideProduct(product: ProductSummary) {
    setProducts((current) =>
      current.map((row) =>
        row.id === product.id ? { ...row, isActive: false } : row
      )
    )
    setChange({ kind: "hidden", id: product.id, name: product.nameMy })
  }

  function showProduct(product: ProductSummary) {
    setProducts((current) =>
      current.map((row) =>
        row.id === product.id ? { ...row, isActive: true } : row
      )
    )
    // Turning the product back on makes the banner's Undo a no-op, so drop it.
    setChange((current) => (current?.id === product.id ? null : current))
  }

  function toggleProduct(product: ProductSummary, active: boolean) {
    if (active) {
      showProduct(product)
    } else {
      hideProduct(product)
    }
  }

  function duplicateProduct(product: ProductSummary) {
    copies.current += 1
    const copy = copyOfProduct(product, copies.current)

    // Right after the original, so switching SHOWING to "All" or "Hidden" finds
    // the draft where its source is instead of at the bottom of the list.
    setProducts((current) => {
      const index = current.findIndex((row) => row.id === product.id)
      if (index === -1) return [copy, ...current]

      return [...current.slice(0, index + 1), copy, ...current.slice(index + 1)]
    })
    setChange({ kind: "duplicated", id: copy.id, name: product.nameMy })
  }

  function confirmHide(product: ProductSummary) {
    hideProduct(product)
    setHideTarget(null)
  }

  function undoChange() {
    if (!change) return

    if (change.kind === "hidden") {
      setProducts((current) =>
        current.map((row) =>
          row.id === change.id ? { ...row, isActive: true } : row
        )
      )
    } else {
      setProducts((current) => current.filter((row) => row.id !== change.id))
    }

    setChange(null)
  }

  const rowActions = {
    onToggle: toggleProduct,
    onDuplicate: duplicateProduct,
    onHide: setHideTarget,
  }

  return (
    <>
      <AdminPageHeader
        title="ထုတ်ကုန်များ"
        subtitle={`Products • ${products.length} items • Asia/Yangon`}
        actions={
          <Link
            to={ROUTES.productNew}
            className={cn(
              buttonVariants(),
              "min-h-12 gap-2 px-5 text-sm font-bold"
            )}
          >
            <Plus className="size-4" strokeWidth={3} />
            Add product
          </Link>
        }
      />

      <main className="flex flex-1 flex-col gap-4 px-4 py-5 sm:px-6">
        {change ? (
          <ProductsChangeBanner
            key={`${change.kind}-${change.id}`}
            change={change}
            seconds={UNDO_SECONDS}
            onUndo={undoChange}
            onDismiss={() => setChange(null)}
          />
        ) : null}

        <ProductFilters
          query={query}
          onQueryChange={changeQuery}
          categories={categories}
          category={category}
          onCategoryChange={changeCategory}
          sort={sort}
          onSortChange={changeSort}
          stock={stock}
          onStockChange={changeStock}
          counts={counts}
          total={inScope.length}
          visibility={visibility}
          onVisibilityChange={changeVisibility}
        />

        {products.length === 0 ? (
          <ProductsEmpty />
        ) : visible.length === 0 ? (
          <ProductsListEmpty onClear={clearFilters} />
        ) : (
          <section className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="hidden md:block">
              <ProductsTable products={rows} {...rowActions} />
            </div>
            <div className="md:hidden">
              <ProductsMobileList products={rows} {...rowActions} />
            </div>
            <ProductsPagination
              page={currentPage}
              pageSize={PRODUCTS_PAGE_SIZE}
              total={visible.length}
              pageCount={pageCount}
              onPageChange={setPage}
            />
          </section>
        )}
      </main>

      <HideProductDialog
        product={hideTarget}
        onOpenChange={(open) => {
          if (!open) setHideTarget(null)
        }}
        onConfirm={confirmHide}
      />
    </>
  )
}
