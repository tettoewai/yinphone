import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import type { CreateOrderInput } from '../../orders/dto/create-order.schema.js';
import type { OrdersService } from '../../orders/orders.service.js';
import type { PrismaService } from '../../prisma/prisma.service.js';
import { AdminOrdersService } from './admin-orders.service.js';

function createPrismaMock() {
  return {
    order: {
      findUnique: vi.fn(),
      count: vi.fn(),
    },
  };
}

function createOrdersMock() {
  return { create: vi.fn() };
}

function createService(
  prisma: ReturnType<typeof createPrismaMock>,
  orders: ReturnType<typeof createOrdersMock>,
) {
  return new AdminOrdersService(
    prisma as unknown as PrismaService,
    orders as unknown as OrdersService,
  );
}

const input: CreateOrderInput = {
  customerName: 'Ma Thida',
  customerPhone: '09400000001',
  channel: 'messenger',
  note: undefined,
  items: [{ productId: 'p1', quantity: 2, size: 'M' }],
};

const detailRow = {
  id: 'o1',
  code: 'YP-2026-0001',
  customerName: 'Ma Thida',
  customerPhone: '09400000001',
  totalMmk: 90000,
  status: 'NEW' as const,
  note: null,
  createdAt: new Date('2026-02-01T00:00:00.000Z'),
  updatedAt: new Date('2026-02-01T00:00:00.000Z'),
  channel: { slug: 'messenger' },
  items: [
    {
      id: 'i1',
      quantity: 2,
      unitPriceMmk: 45000,
      size: 'M' as const,
      product: {
        id: 'p1',
        slug: 'dress',
        nameMy: 'ဂါဝန်',
        nameEn: 'Dress',
      },
    },
  ],
};

describe('AdminOrdersService', () => {
  describe('create', () => {
    it('records the order through the shared pricing path', async () => {
      const prisma = createPrismaMock();
      const orders = createOrdersMock();
      orders.create.mockResolvedValue({ code: 'YP-2026-0001' });
      prisma.order.findUnique.mockResolvedValue(detailRow);
      prisma.order.count.mockResolvedValue(0);

      const created = await createService(prisma, orders).create(input);

      expect(orders.create).toHaveBeenCalledWith(input);
      expect(created).toMatchObject({
        code: 'YP-2026-0001',
        itemCount: 2,
        totalMmk: 90000,
      });
    });

    it('surfaces the service rejection instead of a fresh order', async () => {
      const prisma = createPrismaMock();
      const orders = createOrdersMock();
      orders.create.mockRejectedValue(
        new BadRequestException('One or more products are unavailable'),
      );

      await expect(
        createService(prisma, orders).create(input),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.order.findUnique).not.toHaveBeenCalled();
    });
  });
});
