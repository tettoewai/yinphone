import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required').max(200),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(200),
  })
  .refine((input) => input.currentPassword !== input.newPassword, {
    message: 'The new password must be different',
    path: ['newPassword'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
