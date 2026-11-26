import { z } from 'zod';

export const ORDER_STATUSES = [
  'NEW',
  'CONFIRMED',
  'DELIVERED',
  'CANCELLED',
] as const;

export type OrderStatusId = (typeof ORDER_STATUSES)[number];

/** Date presets from the orders screen; `7d` is its default view. */
export const ORDER_DATE_RANGES = ['today', '7d', '30d', 'all'] as const;

export type OrderDateRange = (typeof ORDER_DATE_RANGES)[number];

/** Query strings send empty values for cleared filters, so treat them as absent. */
const emptyToUndefined = (value: unknown) =>
  value === '' || value === null ? undefined : value;

const optionalText = z.preprocess(
  emptyToUndefined,
  z.string().trim().min(1).optional(),
);

export const listAdminOrdersQuerySchema = z.object({
  /** Order code, customer name or phone. */
  q: optionalText,
  /** Channel slug. */
  channel: optionalText,
  status: z.preprocess(emptyToUndefined, z.enum(ORDER_STATUSES).optional()),
  range: z.preprocess(
    emptyToUndefined,
    z.enum(ORDER_DATE_RANGES).default('7d'),
  ),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ListAdminOrdersQuery = z.infer<typeof listAdminOrdersQuerySchema>;
