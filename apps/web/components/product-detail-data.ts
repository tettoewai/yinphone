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
  categoryNameMy: string
  categoryNameEn: string
  /** Empty until the database models colours; the picker hides itself. */
  colors: ProductColor[]
  defaultColorId: string
  defaultSize?: CatalogProduct["sizes"][number]
}

/** Maps a product from the API onto the detail page's shape. */
export function toProductDetail(product: ApiProduct): ProductDetail {
  const base = toCatalogProduct(product)

  return {
    ...base,
    gallery:
      product.images.length > 0
        ? product.images.map((image) => image.url)
        : [base.image],
    description: product.descriptionMy ?? product.descriptionEn ?? "",
    categoryNameMy: product.category.nameMy,
    categoryNameEn: product.category.nameEn,
    colors: [],
    defaultColorId: "",
    defaultSize: base.sizes[0],
  }
}
