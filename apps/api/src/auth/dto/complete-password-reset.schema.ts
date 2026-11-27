import { z } from 'zod';

/**
 * Step 3: the ticket proves the code was verified. The password floor matches
 * `POST /api/auth/change-password`; the screens ask for 10 characters plus a
 * digit, which is a stronger rule than the API needs to enforce.
 */
export const completePasswordResetSchema = z.object({
  ticket: z.string().trim().min(16, 'Ticket is required').max(200),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(200),
});

export type CompletePasswordResetInput = z.infer<
  typeof completePasswordResetSchema
>;
