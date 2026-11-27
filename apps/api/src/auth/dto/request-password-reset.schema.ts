import { z } from 'zod';

/** Step 1 of the email-OTP reset: who to mail a code to. */
export const requestPasswordResetSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email().max(200)),
});

export type RequestPasswordResetInput = z.infer<
  typeof requestPasswordResetSchema
>;
