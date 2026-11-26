import { z } from 'zod';

/** Hide/show a product. Hidden rows stay on past orders and can return. */
export const updateProductVisibilitySchema = z.object({
  isActive: z.boolean(),
});

export type UpdateProductVisibilityInput = z.infer<
  typeof updateProductVisibilitySchema
>;
