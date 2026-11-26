import { z } from 'zod';

import { PRODUCT_SIZES } from '../../../catalog/dto/list-products.query.js';

/** Empty optional fields (e.g. an untouched description box) are treated as absent. */
const emptyToUndefined = (value: unknown) =>
  value === '' || value === null ? undefined : value;

export const createProductSchema = z.object({
  nameMy: z.string().trim().min(1, 'nameMy is required').max(200),
  nameEn: z.string().trim().min(1, 'nameEn is required').max(200),
  descriptionMy: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(2000).optional(),
  ),
  descriptionEn: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(2000).optional(),
  ),
  /** Generated from the name server-side when omitted. */
  slug: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(1).max(120).optional(),
  ),
  priceMmk: z.coerce.number().int().min(0),
  stock: z.coerce.number().int().min(0).default(0),
  /** Empty = one size / not applicable (e.g. longyi). */
  sizes: z.array(z.enum(PRODUCT_SIZES)).max(4).default([]),
  categoryId: z.string().trim().min(1, 'categoryId is required'),
  isActive: z.boolean().default(true),
  images: z
    .array(
      z.object({
        url: z.string().trim().min(1).max(500),
        altText: z.preprocess(
          emptyToUndefined,
          z.string().trim().max(200).optional(),
        ),
        sortOrder: z.coerce.number().int().min(0).default(0),
      }),
    )
    .max(20)
    .default([]),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
