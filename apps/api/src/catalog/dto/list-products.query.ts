import { z } from 'zod';

export const CATALOG_SORTS = ['newest', 'price-asc', 'price-desc'] as const;

export type CatalogSort = (typeof CATALOG_SORTS)[number];

export const PRODUCT_SIZES = ['S', 'M', 'L', 'XL'] as const;

export type ProductSizeId = (typeof PRODUCT_SIZES)[number];

/** Query strings send empty values for cleared filters, so treat them as absent. */
const emptyToUndefined = (value: unknown) =>
  value === '' || value === null ? undefined : value;

const optionalText = z.preprocess(
  emptyToUndefined,
  z.string().trim().min(1).optional(),
);

const optionalInt = (min: number) =>
  z.preprocess(emptyToUndefined, z.coerce.number().int().min(min).optional());

export const listProductsQuerySchema = z.object({
  category: optionalText,
  q: optionalText,
  size: z.preprocess(emptyToUndefined, z.enum(PRODUCT_SIZES).optional()),
  sort: z.preprocess(emptyToUndefined, z.enum(CATALOG_SORTS).default('newest')),
  minPrice: optionalInt(0),
  maxPrice: optionalInt(0),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;

export const productSlugSchema = z.string().trim().min(1).max(120);
