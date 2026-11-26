import { z } from 'zod';

/**
 * PATCH semantics: absent means "leave unchanged". Written out instead of
 * `.partial()` because Zod's `.partial()` still applies defaults.
 */
export const updateCategorySchema = z.object({
  nameMy: z.string().trim().min(1).max(100).optional(),
  nameEn: z.string().trim().min(1).max(100).optional(),
  slug: z.string().trim().min(1).max(120).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
