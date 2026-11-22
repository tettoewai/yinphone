export default function CatalogLoading() {
  return (
    <div className="mx-auto w-full max-w-md min-w-0 flex-1 bg-background font-body">
      <div className="flex items-center gap-1 border-b border-border px-3 py-2">
        <div className="size-[44px]" />
        <div className="flex flex-1 flex-col items-center gap-1.5">
          <div className="h-4 w-32 animate-pulse rounded-sm bg-secondary" />
          <div className="h-3 w-24 animate-pulse rounded-sm bg-secondary" />
        </div>
        <div className="size-[44px] animate-pulse rounded-md bg-secondary" />
      </div>

      <div className="flex gap-2 px-4 py-3">
        {[64, 48, 48, 56].map((width, index) => (
          <div
            key={index}
            className="h-[44px] animate-pulse rounded-md bg-secondary"
            style={{ width }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between px-4 pb-3">
        <div className="h-4 w-28 animate-pulse rounded-sm bg-secondary" />
        <div className="h-4 w-20 animate-pulse rounded-sm bg-secondary" />
      </div>

      <div className="grid grid-cols-2 gap-3 px-4">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="flex flex-col overflow-hidden rounded-md border border-border bg-card"
          >
            <div className="aspect-square w-full animate-pulse bg-secondary" />
            <div className="flex flex-col gap-2 p-3">
              <div className="h-3.5 w-full animate-pulse rounded-sm bg-secondary" />
              <div className="h-3 w-2/3 animate-pulse rounded-sm bg-secondary" />
              <div className="h-4 w-1/2 animate-pulse rounded-sm bg-secondary" />
              <div className="h-[44px] w-full animate-pulse rounded-md bg-secondary" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
