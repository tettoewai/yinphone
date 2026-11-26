import { z } from 'zod';

/** Empty optional fields are treated as absent. */
const emptyToUndefined = (value: unknown) =>
  value === '' || value === null ? undefined : value;

export const createCategorySchema = z.object({
  nameMy: z.string().trim().min(1, 'nameMy is required').max(100),
  nameEn: z.string().trim().min(1, 'nameEn is required').max(100),
  /** Generated from the name server-side when omitted. */
  slug: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(1).max(120).optional(),
  ),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
