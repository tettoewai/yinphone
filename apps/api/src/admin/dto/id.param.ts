import { z } from 'zod';

/** Shared `:id` param for admin resources (Prisma cuid primary keys). */
export const adminIdSchema = z.string().trim().min(1).max(40);
