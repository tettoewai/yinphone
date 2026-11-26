import { z } from 'zod';

import { ORDER_STATUSES } from './list-orders.query.js';

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
