import { Switch } from "@workspace/ui/components/switch"

import type { ProductSummary } from "@/lib/products"

type ProductVisibilitySwitchProps = {
  product: ProductSummary
  onChange: (product: ProductSummary, active: boolean) => void
}

/**
 * The row's Active toggle at the design's 52×30 size.
 *
 * Only the two custom properties the shared `Switch` reads are overridden —
 * thumb size and travel — so the base component keeps its compact default for
 * every other screen without a stack of descendant selectors here.
 */
export function ProductVisibilitySwitch({
  product,
  onChange,
}: ProductVisibilitySwitchProps) {
  return (
    <Switch
      checked={product.isActive}
      onCheckedChange={(checked) => onChange(product, checked)}
      aria-label={`${product.nameEn} visible in shop`}
      className="h-[30px] w-[52px] rounded-xl border-0 p-1 [--switch-thumb-size:22px] [--switch-thumb-travel:22px]"
    />
  )
}
