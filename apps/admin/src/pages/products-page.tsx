import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { Plus } from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { AdminPageHeader } from "@/components/admin-page-header"
import { FormAlert } from "@/components/form-alert"
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
import { TableSkeleton } from "@/components/states/dashboard-skeleton"
import { RequestError } from "@/components/states/request-error"
import { useCategories } from "@/hooks/use-categories"
import { useProductList } from "@/hooks/use-products"
import { ApiError, productsApi } from "@/lib/api"
import { pageCountFor } from "@/lib/paging"
import {
  PRODUCTS_PAGE_SIZE,
  UNDO_SECONDS,
  type ProductCategory,
  type ProductChange,
  type ProductSort,
  type ProductSummary,
  type StockFilter,
  type VisibilityFilter,
} from "@/lib/products"
import { ROUTES } from "@/lib/routes"

const EMPTY_COUNTS = { in: 0, low: 0, out: 0 }

/**
 * The products list (`/products`).
 *
 * Rows, counts, sorting and paging come from `GET /api/admin/products`; the
 * search box is debounced in the hook and every other facet applies at once.
 * Hiding updates the row in place, duplicating inserts a hidden draft, and both
 * report through one banner with a ten-second Undo (a hide re-shows the row, a
 * duplicate deletes the copy).
 */
export function ProductsPage() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [stock, setStock] = useState<StockFilter>("all")
  const [visibility, setVisibility] = useState<VisibilityFilter>("active")
  const [sort, setSort] = useState<ProductSort>("default")
  const [page, setPage] = useState(1)
  const [change, setChange] = useState<ProductChange | null>(null)
  const [hideTarget, setHideTarget] = useState<ProductSummary | null>(null)
  const [pending, setPending] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const {
    page: list,
    error,
    loading,
    refreshing,
    reload,
  } = useProductList({
    q: query,
    category,
    stock,
    visibility,
    sort,
    page,
    pageSize: PRODUCTS_PAGE_SIZE,
  })

  // The dropdown reads the real categories, so a new one shows up here at once.
  const { categories } = useCategories()
  const categoryOptions = useMemo<ProductCategory[]>(
    () =>
      (categories ?? []).map(({ slug, nameMy, nameEn }) => ({
        slug,
        nameMy,
        nameEn,
      })),
    [categories]
  )

  const counts = list?.counts ?? EMPTY_COUNTS
  const pageTotal = list?.total ?? 0
  const scopeTotal = counts.in + counts.low + counts.out
  const pageCount = pageCountFor(pageTotal, PRODUCTS_PAGE_SIZE)
  const rows = list?.items ?? []
  const busy = pending || refreshing

  const hasFilters =
    query.trim() !== "" ||
    category !== "all" ||
    stock !== "all" ||
    visibility !== "active" ||
    sort !== "default"

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

  /** Stay inside the pages the current result actually has. */
  function changePage(value: number) {
    setPage(Math.min(Math.max(1, value), pageCount))
  }

  /** Runs a write, reports a failure, then refetches whatever the list is. */
  async function mutate(
    action: () => Promise<unknown>,
    onSuccess?: () => void
  ) {
    setPending(true)
    setActionError(null)

    try {
      await action()
      onSuccess?.()
    } catch (failure) {
      setActionError(
        failure instanceof ApiError
          ? failure.message
          : "Something went wrong. Please try again."
      )
    } finally {
      setPending(false)
      reload()
    }
  }

  function hideProduct(product: ProductSummary) {
    void mutate(
      () => productsApi.setVisibility(product.id, false),
      () => setChange({ kind: "hidden", id: product.id, name: product.nameMy })
    )
  }

  function showProduct(product: ProductSummary) {
    // Turning the product back on makes the banner's Undo a no-op, so drop it.
    setChange((current) => (current?.id === product.id ? null : current))
    void mutate(() => productsApi.setVisibility(product.id, true))
  }

  function toggleProduct(product: ProductSummary, active: boolean) {
    if (active) {
      showProduct(product)
    } else {
      hideProduct(product)
    }
  }

  function duplicateProduct(product: ProductSummary) {
    void mutate(async () => {
      const copy = await productsApi.duplicate(product.id)
      setChange({ kind: "duplicated", id: copy.id, name: product.nameMy })
    })
  }

  function confirmHide(product: ProductSummary) {
    hideProduct(product)
    setHideTarget(null)
  }

  function undoChange() {
    const current = change
    if (!current) return

    setChange(null)
    void mutate(() =>
      current.kind === "hidden"
        ? productsApi.setVisibility(current.id, true)
        : productsApi.remove(current.id)
    )
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
        subtitle={`Products • ${pageTotal} items • Asia/Yangon`}
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
        {actionError ? (
          <FormAlert
            title="မအောင်မြင်ပါ • Action failed"
            detail={actionError}
          />
        ) : null}

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
          categories={categoryOptions}
          category={category}
          onCategoryChange={changeCategory}
          sort={sort}
          onSortChange={changeSort}
          stock={stock}
          onStockChange={changeStock}
          counts={counts}
          total={scopeTotal}
          visibility={visibility}
          onVisibilityChange={changeVisibility}
        />

        {error ? (
          <RequestError
            detail={error instanceof ApiError ? error.message : undefined}
            onRetry={reload}
          />
        ) : loading ? (
          <TableSkeleton rows={PRODUCTS_PAGE_SIZE} className="rounded-lg" />
        ) : rows.length === 0 ? (
          hasFilters ? (
            <ProductsListEmpty onClear={clearFilters} />
          ) : (
            <ProductsEmpty />
          )
        ) : (
          <section
            aria-busy={busy}
            className={cn(
              "overflow-hidden rounded-lg border border-border bg-card transition-opacity",
              busy && "opacity-60"
            )}
          >
            <div className="hidden md:block">
              <ProductsTable products={rows} {...rowActions} />
            </div>
            <div className="md:hidden">
              <ProductsMobileList products={rows} {...rowActions} />
            </div>
            <ProductsPagination
              page={page}
              pageSize={PRODUCTS_PAGE_SIZE}
              total={pageTotal}
              pageCount={pageCount}
              onPageChange={changePage}
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
