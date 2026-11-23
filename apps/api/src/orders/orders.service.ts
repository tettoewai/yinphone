import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { OrderGetPayload } from '../generated/prisma/models.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateOrderInput } from './dto/create-order.schema.js';

const MAX_CODE_ATTEMPTS = 5;

const ORDER_INCLUDE = {
  channel: { select: { slug: true, nameMy: true, nameEn: true } },
  items: {
    orderBy: { id: 'asc' },
    select: {
      quantity: true,
      unitPriceMmk: true,
      size: true,
      product: { select: { id: true, nameMy: true, nameEn: true } },
    },
  },
} as const;

type OrderRow = OrderGetPayload<{ include: typeof ORDER_INCLUDE }>;

function toOrder(order: OrderRow) {
  return {
    code: order.code,
    status: order.status,
    totalMmk: order.totalMmk,
    note: order.note,
    createdAt: order.createdAt.toISOString(),
    channel: order.channel,
    items: order.items.map((item) => ({
      productId: item.product.id,
      size: item.size,
      nameMy: item.product.nameMy,
      nameEn: item.product.nameEn,
      quantity: item.quantity,
      unitPriceMmk: item.unitPriceMmk,
      lineTotalMmk: item.quantity * item.unitPriceMmk,
    })),
  };
}

/** Prisma reports unique-constraint violations as `code === 'P2002'`. */
function isUniqueViolation(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'P2002'
  );
}

type OrderItemInput = CreateOrderInput['items'][number];

/** Lines are unique per product *and* size, so an M and an L stay separate. */
function mergeQuantities(items: CreateOrderInput['items']) {
  const merged = new Map<
    string,
    { productId: string; size: OrderItemInput['size']; quantity: number }
  >();

  for (const item of items) {
    const key = `${item.productId}:${item.size ?? ''}`;
    const existing = merged.get(key);

    merged.set(key, {
      productId: item.productId,
      size: item.size,
      quantity: (existing?.quantity ?? 0) + item.quantity,
    });
  }

  return [...merged.values()];
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async listChannels() {
    return this.prisma.channel.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { slug: true, nameMy: true, nameEn: true, url: true },
    });
  }

  async create(input: CreateOrderInput) {
    const channel = await this.prisma.channel.findFirst({
      where: { slug: input.channel, isActive: true },
      select: { id: true },
    });

    if (!channel) {
      throw new BadRequestException(
        `Unknown or inactive channel "${input.channel}"`,
      );
    }

    const mergedItems = mergeQuantities(input.items);
    const productIds = [...new Set(mergedItems.map((item) => item.productId))];

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      select: { id: true, priceMmk: true },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products are unavailable');
    }

    const prices = new Map(products.map((p) => [p.id, p.priceMmk]));

    // Unit prices are read from the database, never from the client.
    const items = mergedItems.map((item) => ({
      productId: item.productId,
      size: item.size ?? null,
      quantity: item.quantity,
      unitPriceMmk: prices.get(item.productId) as number,
    }));

    const totalMmk = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPriceMmk,
      0,
    );

    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
      const code = await this.nextCode();

      try {
        const order = await this.prisma.order.create({
          data: {
            code,
            customerName: input.customerName,
            customerPhone: input.customerPhone,
            channelId: channel.id,
            note: input.note ?? null,
            totalMmk,
            items: { create: items },
          },
          include: ORDER_INCLUDE,
        });

        return toOrder(order);
      } catch (error) {
        // Another request took this code; try the next one.
        if (!isUniqueViolation(error)) throw error;
      }
    }

    throw new ConflictException(
      'Could not allocate an order code. Please try again.',
    );
  }

  async findByCode(code: string) {
    const order = await this.prisma.order.findUnique({
      where: { code },
      include: ORDER_INCLUDE,
    });

    if (!order) {
      throw new NotFoundException(`Order "${code}" was not found`);
    }

    return toOrder(order);
  }

  private async nextCode() {
    const year = new Date().getFullYear();
    const prefix = `YP-${year}-`;
    const count = await this.prisma.order.count({
      where: { code: { startsWith: prefix } },
    });

    return `${prefix}${String(count + 1).padStart(4, '0')}`;
  }
}
