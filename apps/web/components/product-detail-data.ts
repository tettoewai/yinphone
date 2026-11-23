import type { Locale } from "next-intl"

import type { ApiProduct } from "@/lib/api"
import {
  toCatalogProduct,
  type CatalogProduct,
} from "@/components/catalog-data"

export type ProductColor = {
  id: string
  name: string
  hex: string
}

export type ProductDetail = CatalogProduct & {
  gallery: string[]
  description: string
  /** Category name in the active locale. */
  categoryName: string
  /** Empty until the database models colours; the picker hides itself. */
  colors: ProductColor[]
  defaultColorId: string
  defaultSize?: CatalogProduct["sizes"][number]
}

/** Maps a product from the API onto the detail page's shape. */
export function toProductDetail(
  product: ApiProduct,
  locale: Locale
): ProductDetail {
  const base = toCatalogProduct(product, locale)
  const description =
    locale === "my"
      ? (product.descriptionMy ?? product.descriptionEn)
      : (product.descriptionEn ?? product.descriptionMy)

  return {
    ...base,
    gallery:
      product.images.length > 0
        ? product.images.map((image) => image.url)
        : [base.image],
    description: description ?? "",
    categoryName:
      locale === "my"
        ? product.category.nameMy || product.category.nameEn
        : product.category.nameEn || product.category.nameMy,
    colors: [],
    defaultColorId: "",
    defaultSize: base.sizes[0],
  }
}
