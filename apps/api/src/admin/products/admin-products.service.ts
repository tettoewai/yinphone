import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type {
  ProductGetPayload,
  ProductOrderByWithRelationInput,
  ProductWhereInput,
} from '../../generated/prisma/models.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { CreateProductInput } from './dto/create-product.schema.js';
import type {
  AdminProductSort,
  ListAdminProductsQuery,
  StockFilter,
} from './dto/list-products.query.js';
import type { UpdateProductInput } from './dto/update-product.schema.js';
import type { UpdateProductVisibilityInput } from './dto/update-visibility.schema.js';
import { slugify, uniqueSlug } from '../slug.js';

/** Same threshold the admin screen uses, so the "Low" chip means the same thing. */
const LOW_STOCK_THRESHOLD = 5;

/** Row shape for the products table; the category travels with the row. */
const PRODUCT_SUMMARY_SELECT = {
  id: true,
  slug: true,
  nameMy: true,
  nameEn: true,
  priceMmk: true,
  stock: true,
  // Carried on the row so the manual-order picker can offer the right sizes
  // without a second request per selection.
  sizes: true,
  isActive: true,
  category: { select: { id: true, slug: true, nameMy: true, nameEn: true } },
  // Just the MAIN photo (lowest sort order): the list row shows one thumbnail
  // and never needs the rest. `PRODUCT_DETAIL_SELECT` below re-selects the full
  // gallery, so a detail row's `images[0]` is still the MAIN photo.
  images: { select: { url: true }, orderBy: { sortOrder: 'asc' }, take: 1 },
} as const;

/** Detail adds what the product form and the storefront card need. */
const PRODUCT_DETAIL_SELECT = {
  ...PRODUCT_SUMMARY_SELECT,
  descriptionMy: true,
  descriptionEn: true,
  sizes: true,
  createdAt: true,
  updatedAt: true,
  images: {
    select: { id: true, url: true, altText: true, sortOrder: true },
    orderBy: { sortOrder: 'asc' },
  },
} as const;

const SORT_ORDER: Record<AdminProductSort, ProductOrderByWithRelationInput[]> =
  {
    default: [{ createdAt: 'desc' }, { id: 'asc' }],
    'price-asc': [{ priceMmk: 'asc' }, { id: 'asc' }],
    'price-desc': [{ priceMmk: 'desc' }, { id: 'asc' }],
    'stock-asc': [{ stock: 'asc' }, { id: 'asc' }],
  };

type ProductSummaryRow = ProductGetPayload<{
  select: typeof PRODUCT_SUMMARY_SELECT;
}>;

type ProductDetailRow = ProductGetPayload<{
  select: typeof PRODUCT_DETAIL_SELECT;
}>;

function toSummary(row: ProductSummaryRow) {
  return {
    id: row.id,
    slug: row.slug,
    nameMy: row.nameMy,
    nameEn: row.nameEn,
    priceMmk: row.priceMmk,
    stock: row.stock,
    sizes: row.sizes,
    isActive: row.isActive,
    category: row.category,
    /** The MAIN photo's URL, or null when the product has none. */
    imageUrl: row.images[0]?.url ?? null,
  };
}

function toDetail(row: ProductDetailRow) {
  return {
    ...toSummary(row),
    descriptionMy: row.descriptionMy,
    descriptionEn: row.descriptionEn,
    /** ISO 8601; the admin renders every timestamp in Asia/Yangon. */
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    images: row.images.map((image) => ({
      id: image.id,
      url: image.url,
      altText: image.altText,
      sortOrder: image.sortOrder,
    })),
  };
}

/** Everything except the stock chip: search, category and the SHOWING view. */
function toBaseWhere(query: ListAdminProductsQuery): ProductWhereInput {
  const where: ProductWhereInput = {};

  if (query.visibility === 'active') {
    where.isActive = true;
  } else if (query.visibility === 'hidden') {
    where.isActive = false;
  }

  if (query.category) {
    where.category = { slug: query.category };
  }

  if (query.q) {
    where.OR = [
      { nameMy: { contains: query.q, mode: 'insensitive' } },
      { nameEn: { contains: query.q, mode: 'insensitive' } },
    ];
  }

  return where;
}

/** Prisma predicate for each stock chip. */
type StockBucket = Exclude<StockFilter, 'all'>;

const STOCK_BUCKETS: Record<StockBucket, ProductWhereInput> = {
  in: { stock: { gte: LOW_STOCK_THRESHOLD } },
  low: { stock: { gte: 1, lt: LOW_STOCK_THRESHOLD } },
  out: { stock: { lte: 0 } },
};

/** The selected chip's predicate, or `null` for "All". */
function stockWhere(filter: StockFilter): ProductWhereInput | null {
  return filter === 'all' ? null : STOCK_BUCKETS[filter];
}

function imageData(
  images: readonly {
    url: string;
    altText?: string | null;
    sortOrder?: number;
  }[],
) {
  return images.map((image) => ({
    url: image.url,
    altText: image.altText ?? null,
    sortOrder: image.sortOrder ?? 0,
  }));
}

@Injectable()
export class AdminProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListAdminProductsQuery) {
    const base = toBaseWhere(query);
    const stock = stockWhere(query.stock);
    const where: ProductWhereInput = stock ? { ...base, ...stock } : base;

    // Stock counts are measured against the search, category and SHOWING view
    // but before the stock chip, so the chips never collapse to the selected one.
    const [rows, total, inCount, lowCount, outCount] =
      await this.prisma.$transaction([
        this.prisma.product.findMany({
          where,
          orderBy: SORT_ORDER[query.sort],
          skip: query.offset,
          take: query.limit,
          select: PRODUCT_SUMMARY_SELECT,
        }),
        this.prisma.product.count({ where }),
        this.prisma.product.count({
          where: { ...base, ...STOCK_BUCKETS.in },
        }),
        this.prisma.product.count({
          where: { ...base, ...STOCK_BUCKETS.low },
        }),
        this.prisma.product.count({
          where: { ...base, ...STOCK_BUCKETS.out },
        }),
      ]);

    return {
      items: rows.map(toSummary),
      total,
      limit: query.limit,
      offset: query.offset,
      counts: { in: inCount, low: lowCount, out: outCount },
    };
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: PRODUCT_DETAIL_SELECT,
    });

    if (!product) {
      throw new NotFoundException(`Product "${id}" was not found`);
    }

    return toDetail(product);
  }

  async create(input: CreateProductInput) {
    await this.assertCategory(input.categoryId);

    let slug: string;
    if (input.slug) {
      await this.assertSlugFree(input.slug);
      slug = input.slug;
    } else {
      slug = await uniqueSlug(
        slugify(input.nameEn) || slugify(input.nameMy),
        (candidate) => this.slugTaken(candidate),
        'product',
      );
    }

    const product = await this.prisma.product.create({
      data: {
        slug,
        nameMy: input.nameMy,
        nameEn: input.nameEn,
        descriptionMy: input.descriptionMy ?? null,
        descriptionEn: input.descriptionEn ?? null,
        priceMmk: input.priceMmk,
        stock: input.stock,
        sizes: input.sizes,
        isActive: input.isActive,
        categoryId: input.categoryId,
        images: input.images.length
          ? { create: imageData(input.images) }
          : undefined,
      },
      select: PRODUCT_DETAIL_SELECT,
    });

    return toDetail(product);
  }

  async update(id: string, input: UpdateProductInput) {
    await this.assertExists(id);

    if (input.categoryId !== undefined) {
      await this.assertCategory(input.categoryId);
    }

    if (input.slug !== undefined) {
      await this.assertSlugFree(input.slug, id);
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.nameMy !== undefined ? { nameMy: input.nameMy } : {}),
        ...(input.nameEn !== undefined ? { nameEn: input.nameEn } : {}),
        ...(input.descriptionMy !== undefined
          ? { descriptionMy: input.descriptionMy || null }
          : {}),
        ...(input.descriptionEn !== undefined
          ? { descriptionEn: input.descriptionEn || null }
          : {}),
        ...(input.priceMmk !== undefined ? { priceMmk: input.priceMmk } : {}),
        ...(input.stock !== undefined ? { stock: input.stock } : {}),
        ...(input.sizes !== undefined ? { sizes: input.sizes } : {}),
        ...(input.categoryId !== undefined
          ? { categoryId: input.categoryId }
          : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        // Images are a full replacement: the form submits its ordered list.
        ...(input.images !== undefined
          ? { images: { deleteMany: {}, create: imageData(input.images) } }
          : {}),
      },
      select: PRODUCT_DETAIL_SELECT,
    });

    return toDetail(product);
  }

  async updateVisibility(id: string, input: UpdateProductVisibilityInput) {
    await this.assertExists(id);

    const product = await this.prisma.product.update({
      where: { id },
      data: { isActive: input.isActive },
      select: PRODUCT_DETAIL_SELECT,
    });

    return toDetail(product);
  }

  /** The copy lands hidden so a half-edited product never reaches shoppers. */
  async duplicate(id: string) {
    const source = await this.prisma.product.findUnique({
      where: { id },
      select: PRODUCT_DETAIL_SELECT,
    });

    if (!source) {
      throw new NotFoundException(`Product "${id}" was not found`);
    }

    const slug = await uniqueSlug(`${source.slug}-copy`, (candidate) =>
      this.slugTaken(candidate),
    );

    const copy = await this.prisma.product.create({
      data: {
        slug,
        nameMy: `${source.nameMy} (မိတ္တူ)`,
        nameEn: `${source.nameEn} (copy)`,
        descriptionMy: source.descriptionMy,
        descriptionEn: source.descriptionEn,
        priceMmk: source.priceMmk,
        stock: source.stock,
        sizes: source.sizes,
        isActive: false,
        categoryId: source.category.id,
        images: source.images.length
          ? {
              create: source.images.map((image) => ({
                url: image.url,
                altText: image.altText,
                sortOrder: image.sortOrder,
              })),
            }
          : undefined,
      },
      select: PRODUCT_DETAIL_SELECT,
    });

    return toDetail(copy);
  }

  /**
   * Deletes a product, but only one that never appeared on an order: order
   * items reference the product, so removing a sold row would rewrite history.
   */
  async remove(id: string) {
    await this.assertExists(id);

    const usedOnOrders = await this.prisma.orderItem.count({
      where: { productId: id },
    });

    if (usedOnOrders > 0) {
      throw new ConflictException(
        'This product appears on existing orders and cannot be deleted. Hide it instead.',
      );
    }

    await this.prisma.product.delete({ where: { id } });
  }

  private async assertExists(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException(`Product "${id}" was not found`);
    }
  }

  private async assertCategory(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });

    if (!category) {
      throw new BadRequestException(`Category "${categoryId}" does not exist`);
    }
  }

  private async slugTaken(slug: string) {
    const existing = await this.prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    return existing !== null;
  }

  /** A caller-supplied slug is a hard claim: a collision is a 409, not a suffix. */
  private async assertSlugFree(slug: string, exceptId?: string) {
    const existing = await this.prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existing && existing.id !== exceptId) {
      throw new ConflictException(`Product slug "${slug}" is already in use`);
    }
  }
}
