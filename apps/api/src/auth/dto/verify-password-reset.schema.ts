import { z } from 'zod';

/** Step 2: the code from the email, traded for a ticket. */
export const verifyPasswordResetSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email().max(200)),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit code from the email'),
});

export type VerifyPasswordResetInput = z.infer<
  typeof verifyPasswordResetSchema
>;
