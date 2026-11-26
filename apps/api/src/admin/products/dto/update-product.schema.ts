import { z } from 'zod';

import { PRODUCT_SIZES } from '../../../catalog/dto/list-products.query.js';

/**
 * PATCH semantics: an absent field means "leave unchanged". Written out
 * instead of `createProductSchema.partial()` because Zod's `.partial()`
 * still applies defaults, which would silently reset stock/sizes/images.
 */
export const updateProductSchema = z.object({
  nameMy: z.string().trim().min(1).max(200).optional(),
  nameEn: z.string().trim().min(1).max(200).optional(),
  descriptionMy: z.string().trim().max(2000).optional(),
  descriptionEn: z.string().trim().max(2000).optional(),
  slug: z.string().trim().min(1).max(120).optional(),
  priceMmk: z.coerce.number().int().min(0).optional(),
  stock: z.coerce.number().int().min(0).optional(),
  sizes: z.array(z.enum(PRODUCT_SIZES)).max(4).optional(),
  categoryId: z.string().trim().min(1).optional(),
  isActive: z.boolean().optional(),
  images: z
    .array(
      z.object({
        url: z.string().trim().min(1).max(500),
        altText: z.string().trim().max(200).optional(),
        sortOrder: z.coerce.number().int().min(0).optional(),
      }),
    )
    .max(20)
    .optional(),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;
