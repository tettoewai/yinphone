import { z } from 'zod';

/**
 * The design's login form: email + password, an optional "remember this
 * device" tick, and a minimum password length of 8.
 */
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email().max(200)),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(200),
  rememberDevice: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
