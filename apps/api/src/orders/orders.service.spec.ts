import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '../prisma/prisma.service.js';
import type { CreateOrderInput } from './dto/create-order.schema.js';
import { OrdersService } from './orders.service.js';

function createPrismaMock() {
  return {
    channel: { findFirst: vi.fn(), findMany: vi.fn() },
    product: { findMany: vi.fn() },
    order: {
      count: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  };
}

function createService(prisma: ReturnType<typeof createPrismaMock>) {
  return new OrdersService(prisma as unknown as PrismaService);
}

const createdOrder = {
  code: 'YP-2026-0001',
  status: 'NEW' as const,
  totalMmk: 90000,
  note: null,
  createdAt: new Date('2026-02-01T00:00:00.000Z'),
  channel: { slug: 'messenger', nameMy: 'Messenger', nameEn: 'Messenger' },
  items: [
    {
      quantity: 2,
      unitPriceMmk: 45000,
      size: 'M' as const,
      product: { id: 'p1', nameMy: 'ဂါဝန်', nameEn: 'Dress' },
    },
  ],
};

const input: CreateOrderInput = {
  customerName: 'Ma Thida',
  customerPhone: '09400000001',
  channel: 'messenger',
  note: undefined,
  items: [{ productId: 'p1', quantity: 2 }],
};

describe('OrdersService', () => {
  describe('create', () => {
    it('prices the order from the database, not the request', async () => {
      const prisma = createPrismaMock();
      prisma.channel.findFirst.mockResolvedValue({ id: 'ch1' });
      prisma.product.findMany.mockResolvedValue([
        { id: 'p1', priceMmk: 45000 },
      ]);
      prisma.order.count.mockResolvedValue(0);
      prisma.order.create.mockResolvedValue(createdOrder);

      const order = await createService(prisma).create(input);

      const data = prisma.order.create.mock.calls[0]?.[0]?.data;

      expect(data).toMatchObject({
        code: 'YP-2026-0001',
        channelId: 'ch1',
        totalMmk: 90000,
        items: {
          create: [
            { productId: 'p1', size: null, quantity: 2, unitPriceMmk: 45000 },
          ],
        },
      });
      expect(order).toMatchObject({
        code: 'YP-2026-0001',
        totalMmk: 90000,
        createdAt: '2026-02-01T00:00:00.000Z',
      });
      expect(order.items[0]?.lineTotalMmk).toBe(90000);
    });

    it('merges duplicate lines for the same product and size', async () => {
      const prisma = createPrismaMock();
      prisma.channel.findFirst.mockResolvedValue({ id: 'ch1' });
      prisma.product.findMany.mockResolvedValue([
        { id: 'p1', priceMmk: 45000 },
      ]);
      prisma.order.count.mockResolvedValue(0);
      prisma.order.create.mockResolvedValue(createdOrder);

      await createService(prisma).create({
        ...input,
        items: [
          { productId: 'p1', quantity: 1, size: 'M' },
          { productId: 'p1', quantity: 1, size: 'M' },
        ],
      });

      const data = prisma.order.create.mock.calls[0]?.[0]?.data;

      expect(data?.items?.create).toEqual([
        { productId: 'p1', size: 'M', quantity: 2, unitPriceMmk: 45000 },
      ]);
      expect(data?.totalMmk).toBe(90000);
    });

    it('keeps the same product in separate lines when sizes differ', async () => {
      const prisma = createPrismaMock();
      prisma.channel.findFirst.mockResolvedValue({ id: 'ch1' });
      prisma.product.findMany.mockResolvedValue([
        { id: 'p1', priceMmk: 45000 },
      ]);
      prisma.order.count.mockResolvedValue(0);
      prisma.order.create.mockResolvedValue(createdOrder);

      await createService(prisma).create({
        ...input,
        items: [
          { productId: 'p1', quantity: 1, size: 'M' },
          { productId: 'p1', quantity: 1, size: 'L' },
        ],
      });

      const data = prisma.order.create.mock.calls[0]?.[0]?.data;

      expect(data?.items?.create).toEqual([
        { productId: 'p1', size: 'M', quantity: 1, unitPriceMmk: 45000 },
        { productId: 'p1', size: 'L', quantity: 1, unitPriceMmk: 45000 },
      ]);
      expect(data?.totalMmk).toBe(90000);
    });

    it('rejects unknown or inactive channels', async () => {
      const prisma = createPrismaMock();
      prisma.channel.findFirst.mockResolvedValue(null);

      await expect(createService(prisma).create(input)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(prisma.product.findMany).not.toHaveBeenCalled();
    });

    it('rejects products that are missing or inactive', async () => {
      const prisma = createPrismaMock();
      prisma.channel.findFirst.mockResolvedValue({ id: 'ch1' });
      prisma.product.findMany.mockResolvedValue([]);

      await expect(createService(prisma).create(input)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('retries when another request claimed the order code', async () => {
      const prisma = createPrismaMock();
      prisma.channel.findFirst.mockResolvedValue({ id: 'ch1' });
      prisma.product.findMany.mockResolvedValue([
        { id: 'p1', priceMmk: 45000 },
      ]);
      prisma.order.count.mockResolvedValue(0);
      prisma.order.create
        .mockRejectedValueOnce(
          Object.assign(new Error('duplicate'), { code: 'P2002' }),
        )
        .mockResolvedValueOnce(createdOrder);

      const order = await createService(prisma).create(input);

      expect(prisma.order.create).toHaveBeenCalledTimes(2);
      expect(order.code).toBe('YP-2026-0001');
    });

    it('gives up after repeated code collisions', async () => {
      const prisma = createPrismaMock();
      prisma.channel.findFirst.mockResolvedValue({ id: 'ch1' });
      prisma.product.findMany.mockResolvedValue([
        { id: 'p1', priceMmk: 45000 },
      ]);
      prisma.order.count.mockResolvedValue(0);
      prisma.order.create.mockRejectedValue(
        Object.assign(new Error('duplicate'), { code: 'P2002' }),
      );

      await expect(createService(prisma).create(input)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prisma.order.create).toHaveBeenCalledTimes(5);
    });

    it('rethrows unexpected database errors', async () => {
      const prisma = createPrismaMock();
      prisma.channel.findFirst.mockResolvedValue({ id: 'ch1' });
      prisma.product.findMany.mockResolvedValue([
        { id: 'p1', priceMmk: 45000 },
      ]);
      prisma.order.count.mockResolvedValue(0);
      prisma.order.create.mockRejectedValue(new Error('connection lost'));

      await expect(createService(prisma).create(input)).rejects.toThrow(
        'connection lost',
      );
    });
  });

  describe('findByCode', () => {
    it('returns the order summary', async () => {
      const prisma = createPrismaMock();
      prisma.order.findUnique.mockResolvedValue(createdOrder);

      const order = await createService(prisma).findByCode('YP-2026-0001');

      expect(order.code).toBe('YP-2026-0001');
      expect(order.items).toHaveLength(1);
      expect(order.items[0]?.size).toBe('M');
    });

    it('throws NotFoundException for unknown codes', async () => {
      const prisma = createPrismaMock();
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(
        createService(prisma).findByCode('YP-9999-0001'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
