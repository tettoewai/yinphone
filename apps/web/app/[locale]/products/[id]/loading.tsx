export default function ProductLoading() {
  return (
    <div className="mx-auto w-full max-w-md min-w-0 flex-1 bg-background font-body">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="size-[44px]" />
        <div className="h-3.5 w-28 animate-pulse rounded-sm bg-secondary" />
        <div className="size-[44px] animate-pulse rounded-md bg-secondary" />
      </div>

      <div className="aspect-[4/5] w-full animate-pulse bg-secondary" />

      <div className="flex flex-col gap-2 px-4 pt-3 pb-4">
        <div className="h-5 w-3/4 animate-pulse rounded-sm bg-secondary" />
        <div className="h-3.5 w-1/2 animate-pulse rounded-sm bg-secondary" />
        <div className="h-7 w-28 animate-pulse rounded-sm bg-secondary" />
        <div className="h-6 w-40 animate-pulse rounded-sm bg-secondary" />
      </div>

      <div className="flex gap-2 px-4 pb-4">
        {["S", "M", "L"].map((size) => (
          <div
            key={size}
            className="h-[48px] flex-1 animate-pulse rounded-md bg-secondary"
          />
        ))}
      </div>

      <div className="flex flex-col gap-2 px-4">
        <div className="h-3.5 w-24 animate-pulse rounded-sm bg-secondary" />
        <div className="h-[44px] w-full animate-pulse rounded-md bg-secondary" />
        <div className="h-[44px] w-full animate-pulse rounded-md bg-secondary" />
      </div>
    </div>
  )
}
