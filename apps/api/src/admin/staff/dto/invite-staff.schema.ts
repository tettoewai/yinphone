import { z } from 'zod';

export const ADMIN_ROLES = ['OWNER', 'STAFF'] as const;

export type AdminRoleId = (typeof ADMIN_ROLES)[number];

/**
 * Invites create the account with `mustChangePassword` set; the temporary
 * password is delivered out-of-band until an email flow exists.
 */
export const inviteStaffSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email().max(200)),
  name: z.string().trim().min(1, 'name is required').max(100),
  role: z.enum(ADMIN_ROLES).default('STAFF'),
});

export type InviteStaffInput = z.infer<typeof inviteStaffSchema>;
