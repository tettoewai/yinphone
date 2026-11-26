import { z } from 'zod';

/** Sort options from the admin products screen. */
export const ADMIN_PRODUCT_SORTS = [
  'default',
  'price-asc',
  'price-desc',
  'stock-asc',
] as const;

export type AdminProductSort = (typeof ADMIN_PRODUCT_SORTS)[number];

/** Stock chips; `low` uses the same threshold as the admin screen (< 5). */
export const STOCK_FILTERS = ['all', 'in', 'low', 'out'] as const;

export type StockFilter = (typeof STOCK_FILTERS)[number];

/** SHOWING chips — hidden products stay in the database, so this is a view. */
export const VISIBILITY_FILTERS = ['active', 'hidden', 'all'] as const;

export type VisibilityFilter = (typeof VISIBILITY_FILTERS)[number];

/** Query strings send empty values for cleared filters, so treat them as absent. */
const emptyToUndefined = (value: unknown) =>
  value === '' || value === null ? undefined : value;

const optionalText = z.preprocess(
  emptyToUndefined,
  z.string().trim().min(1).optional(),
);

export const listAdminProductsQuerySchema = z.object({
  q: optionalText,
  /** Category slug. */
  category: optionalText,
  stock: z.preprocess(emptyToUndefined, z.enum(STOCK_FILTERS).default('all')),
  visibility: z.preprocess(
    emptyToUndefined,
    z.enum(VISIBILITY_FILTERS).default('all'),
  ),
  sort: z.preprocess(
    emptyToUndefined,
    z.enum(ADMIN_PRODUCT_SORTS).default('default'),
  ),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ListAdminProductsQuery = z.infer<
  typeof listAdminProductsQuerySchema
>;
