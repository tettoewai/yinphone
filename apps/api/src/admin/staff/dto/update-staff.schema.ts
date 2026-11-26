import { z } from 'zod';

import { ADMIN_ROLES } from './invite-staff.schema.js';

export const updateStaffSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    role: z.enum(ADMIN_ROLES).optional(),
  })
  .refine((input) => input.name !== undefined || input.role !== undefined, {
    message: 'Provide a name or a role to update',
  });

export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
