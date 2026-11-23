import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '../prisma/prisma.service.js';
import { CatalogService } from './catalog.service.js';

function createPrismaMock() {
  const prisma = {
    product: {
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
    },
    category: { findMany: vi.fn() },
    $transaction: vi.fn(),
  };

  prisma.$transaction.mockImplementation((operations: Promise<unknown>[]) =>
    Promise.all(operations),
  );

  return prisma;
}

function createService(prisma: ReturnType<typeof createPrismaMock>) {
  return new CatalogService(prisma as unknown as PrismaService);
}

const productRow = {
  id: 'p1',
  slug: 'peach-midi',
  nameMy: 'ဂါဝန်',
  nameEn: 'Peach Midi Dress',
  descriptionMy: null,
  descriptionEn: null,
  priceMmk: 45000,
  stock: 3,
  sizes: ['S', 'M', 'L'],
  isActive: true,
  createdAt: new Date('2026-02-01T00:00:00.000Z'),
  category: {
    id: 'c1',
    slug: 'dresses',
    nameMy: 'ဂါဝန်များ',
    nameEn: 'Dresses',
  },
  images: [{ id: 'i1', url: 'https://example.com/1.jpg', altText: null }],
};

const baseQuery = {
  category: undefined,
  q: undefined,
  size: undefined,
  sort: 'newest' as const,
  minPrice: undefined,
  maxPrice: undefined,
  limit: 20,
  offset: 0,
};

describe('CatalogService', () => {
  describe('listProducts', () => {
    it('returns serialized items and paging metadata', async () => {
      const prisma = createPrismaMock();
      prisma.product.findMany.mockResolvedValue([productRow]);
      prisma.product.count.mockResolvedValue(1);

      const result = await createService(prisma).listProducts(baseQuery);

      expect(result).toMatchObject({ total: 1, limit: 20, offset: 0 });
      expect(result.items[0]).toMatchObject({
        id: 'p1',
        priceMmk: 45000,
        sizes: ['S', 'M', 'L'],
        inStock: true,
        createdAt: '2026-02-01T00:00:00.000Z',
      });
    });

    it('marks out-of-stock products', async () => {
      const prisma = createPrismaMock();
      prisma.product.findMany.mockResolvedValue([{ ...productRow, stock: 0 }]);
      prisma.product.count.mockResolvedValue(1);

      const result = await createService(prisma).listProducts(baseQuery);

      expect(result.items[0]?.inStock).toBe(false);
    });

    it('maps filters, search, sort and paging onto the query', async () => {
      const prisma = createPrismaMock();
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await createService(prisma).listProducts({
        ...baseQuery,
        category: 'dresses',
        q: 'linen',
        sort: 'price-asc',
        minPrice: 20000,
        maxPrice: 50000,
        limit: 10,
        offset: 5,
      });

      const args = prisma.product.findMany.mock.calls[0]?.[0];

      expect(args).toMatchObject({
        skip: 5,
        take: 10,
        orderBy: { priceMmk: 'asc' },
        where: {
          isActive: true,
          category: { slug: 'dresses' },
          priceMmk: { gte: 20000, lte: 50000 },
        },
      });
      expect(args?.where?.OR).toHaveLength(2);
      expect(prisma.product.count).toHaveBeenCalledWith({ where: args?.where });
    });

    it('filters by size when one is requested', async () => {
      const prisma = createPrismaMock();
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await createService(prisma).listProducts({ ...baseQuery, size: 'M' });

      const args = prisma.product.findMany.mock.calls[0]?.[0];

      expect(args?.where).toMatchObject({ sizes: { has: 'M' } });
    });

    it('only filters on the price bounds that were provided', async () => {
      const prisma = createPrismaMock();
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await createService(prisma).listProducts({
        ...baseQuery,
        maxPrice: 35000,
      });

      const args = prisma.product.findMany.mock.calls[0]?.[0];

      expect(args?.where?.priceMmk).toEqual({ lte: 35000 });
    });
  });

  describe('getProduct', () => {
    it('returns the product when it exists', async () => {
      const prisma = createPrismaMock();
      prisma.product.findFirst.mockResolvedValue(productRow);

      const product = await createService(prisma).getProduct('peach-midi');

      expect(product.slug).toBe('peach-midi');
      expect(prisma.product.findFirst).toHaveBeenCalledWith({
        where: { slug: 'peach-midi', isActive: true },
        select: expect.anything(),
      });
    });

    it('throws NotFoundException for unknown or inactive products', async () => {
      const prisma = createPrismaMock();
      prisma.product.findFirst.mockResolvedValue(null);

      await expect(
        createService(prisma).getProduct('missing'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('listCategories', () => {
    it('exposes the active product count', async () => {
      const prisma = createPrismaMock();
      prisma.category.findMany.mockResolvedValue([
        {
          id: 'c1',
          slug: 'dresses',
          nameMy: 'ဂါဝန်များ',
          nameEn: 'Dresses',
          sortOrder: 1,
          _count: { products: 4 },
        },
      ]);

      const categories = await createService(prisma).listCategories();

      expect(categories).toEqual([
        {
          id: 'c1',
          slug: 'dresses',
          nameMy: 'ဂါဝန်များ',
          nameEn: 'Dresses',
          sortOrder: 1,
          productCount: 4,
        },
      ]);
    });
  });
});
