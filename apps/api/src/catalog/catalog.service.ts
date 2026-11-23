import { Injectable, NotFoundException } from '@nestjs/common';

import type {
  ProductGetPayload,
  ProductSelect,
  ProductWhereInput,
} from '../generated/prisma/models.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ListProductsQuery } from './dto/list-products.query.js';

const PRODUCT_SELECT = {
  id: true,
  slug: true,
  nameMy: true,
  nameEn: true,
  descriptionMy: true,
  descriptionEn: true,
  priceMmk: true,
  stock: true,
  sizes: true,
  isActive: true,
  createdAt: true,
  category: {
    select: { id: true, slug: true, nameMy: true, nameEn: true },
  },
  images: {
    select: { id: true, url: true, altText: true },
    orderBy: { sortOrder: 'asc' },
  },
} satisfies ProductSelect;

type ProductRow = ProductGetPayload<{ select: typeof PRODUCT_SELECT }>;

const ORDER_BY = {
  newest: { createdAt: 'desc' },
  'price-asc': { priceMmk: 'asc' },
  'price-desc': { priceMmk: 'desc' },
} as const;

function toProduct(row: ProductRow) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    inStock: row.stock > 0,
  };
}

function toWhere(query: ListProductsQuery): ProductWhereInput {
  const where: ProductWhereInput = { isActive: true };

  if (query.category) {
    where.category = { slug: query.category };
  }

  if (query.size) {
    where.sizes = { has: query.size };
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.priceMmk = {
      ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
      ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
    };
  }

  if (query.q) {
    where.OR = [
      { nameMy: { contains: query.q, mode: 'insensitive' } },
      { nameEn: { contains: query.q, mode: 'insensitive' } },
    ];
  }

  return where;
}

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async listProducts(query: ListProductsQuery) {
    const where = toWhere(query);

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy: ORDER_BY[query.sort],
        skip: query.offset,
        take: query.limit,
        select: PRODUCT_SELECT,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: rows.map(toProduct),
      total,
      limit: query.limit,
      offset: query.offset,
    };
  }

  async getProduct(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, isActive: true },
      select: PRODUCT_SELECT,
    });

    if (!product) {
      throw new NotFoundException(`Product "${slug}" was not found`);
    }

    return toProduct(product);
  }

  async listCategories() {
    const categories = await this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        slug: true,
        nameMy: true,
        nameEn: true,
        sortOrder: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    });

    return categories.map(({ _count, ...category }) => ({
      ...category,
      productCount: _count.products,
    }));
  }
}
