import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type {
  CategoryGetPayload,
  CategoryOrderByWithRelationInput,
} from '../../generated/prisma/models.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { CreateCategoryInput } from './dto/create-category.schema.js';
import type { UpdateCategoryInput } from './dto/update-category.schema.js';
import { slugify, uniqueSlug } from '../slug.js';

/** The category row plus the product count the delete rule needs. */
const CATEGORY_SELECT = {
  id: true,
  slug: true,
  nameMy: true,
  nameEn: true,
  sortOrder: true,
  _count: { select: { products: true } },
} as const;

const CATEGORY_ORDER: CategoryOrderByWithRelationInput[] = [
  { sortOrder: 'asc' },
  { createdAt: 'asc' },
];

type CategoryRow = CategoryGetPayload<{ select: typeof CATEGORY_SELECT }>;

function toCategory(row: CategoryRow) {
  const { _count, ...category } = row;
  return { ...category, productCount: _count.products };
}

@Injectable()
export class AdminCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const rows = await this.prisma.category.findMany({
      orderBy: CATEGORY_ORDER,
      select: CATEGORY_SELECT,
    });

    return rows.map(toCategory);
  }

  async create(input: CreateCategoryInput) {
    let slug: string;
    if (input.slug) {
      await this.assertSlugFree(input.slug);
      slug = input.slug;
    } else {
      slug = await uniqueSlug(
        slugify(input.nameEn) || slugify(input.nameMy),
        (candidate) => this.slugTaken(candidate),
        'category',
      );
    }

    // The dialog does not pick a position, so a default (0) appends to the end
    // rather than jumping to the front of the storefront menu.
    const sortOrder =
      input.sortOrder > 0 ? input.sortOrder : await this.nextSortOrder();

    const category = await this.prisma.category.create({
      data: {
        slug,
        nameMy: input.nameMy,
        nameEn: input.nameEn,
        sortOrder,
      },
      select: CATEGORY_SELECT,
    });

    return toCategory(category);
  }

  async update(id: string, input: UpdateCategoryInput) {
    await this.assertExists(id);

    // The slug is the category's storefront URL; renames leave it alone unless
    // the caller explicitly sends a new one.
    if (input.slug !== undefined) {
      await this.assertSlugFree(input.slug, id);
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: {
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.nameMy !== undefined ? { nameMy: input.nameMy } : {}),
        ...(input.nameEn !== undefined ? { nameEn: input.nameEn } : {}),
        ...(input.sortOrder !== undefined
          ? { sortOrder: input.sortOrder }
          : {}),
      },
      select: CATEGORY_SELECT,
    });

    return toCategory(category);
  }

  /** A category may only be deleted while no product is filed under it. */
  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      select: { id: true, _count: { select: { products: true } } },
    });

    if (!category) {
      throw new NotFoundException(`Category "${id}" was not found`);
    }

    if (category._count.products > 0) {
      throw new ConflictException(
        'This category still has products. Move them to another category first.',
      );
    }

    await this.prisma.category.delete({ where: { id } });
  }

  private async assertExists(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!category) {
      throw new NotFoundException(`Category "${id}" was not found`);
    }
  }

  /** The position a new category appends to: one past the current last row. */
  private async nextSortOrder() {
    const last = await this.prisma.category.findFirst({
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    return (last?.sortOrder ?? 0) + 1;
  }

  private async slugTaken(slug: string) {
    const existing = await this.prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });

    return existing !== null;
  }

  private async assertSlugFree(slug: string, exceptId?: string) {
    const existing = await this.prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existing && existing.id !== exceptId) {
      throw new ConflictException(`Category slug "${slug}" is already in use`);
    }
  }
}
