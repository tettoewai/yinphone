import { z } from 'zod';

/**
 * PATCH semantics: absent means "leave unchanged". Written out instead of
 * `.partial()` because Zod's `.partial()` still applies defaults.
 */
export const updateChannelSchema = z.object({
  nameMy: z.string().trim().min(1).max(100).optional(),
  nameEn: z.string().trim().min(1).max(100).optional(),
  slug: z.string().trim().min(1).max(120).optional(),
  url: z.string().trim().min(1).pipe(z.url().max(500)).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export type UpdateChannelInput = z.infer<typeof updateChannelSchema>;
