import { z } from 'zod';

import { PRODUCT_SIZES } from '../../catalog/dto/list-products.query.js';

/** Empty optional fields (e.g. an untouched note box) are treated as absent. */
const emptyToUndefined = (value: unknown) =>
  value === '' || value === null ? undefined : value;

export const createOrderSchema = z.object({
  customerName: z.string().trim().min(1, 'customerName is required').max(100),
  customerPhone: z.string().trim().min(5, 'customerPhone is required').max(30),
  channel: z.string().trim().min(1, 'channel is required'),
  note: z.preprocess(emptyToUndefined, z.string().trim().max(500).optional()),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(99),
        /** Omitted for one-size items (e.g. longyi) and accessories. */
        size: z.preprocess(emptyToUndefined, z.enum(PRODUCT_SIZES).optional()),
      }),
    )
    .min(1, 'items must contain at least one item')
    .max(50),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const orderCodeSchema = z.string().trim().min(1).max(40);
