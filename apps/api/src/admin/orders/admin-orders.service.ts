import { Injectable, NotFoundException } from '@nestjs/common';

import type {
  OrderGetPayload,
  OrderWhereInput,
} from '../../generated/prisma/models.js';
import type { OrderStatus } from '../../generated/prisma/enums.js';
import type { CreateOrderInput } from '../../orders/dto/create-order.schema.js';
import { OrdersService } from '../../orders/orders.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { DAY_MS, startOfYangonDay } from '../yangon-time.js';
import type {
  ListAdminOrdersQuery,
  OrderDateRange,
} from './dto/list-orders.query.js';
import type { UpdateOrderStatusInput } from './dto/update-status.schema.js';

/**
 * Preset widths in days, mirroring `apps/admin/src/lib/orders.ts`: `1` means
 * today only, and `null` means no lower bound.
 */
const RANGE_DAYS: Record<OrderDateRange, number | null> = {
  today: 1,
  '7d': 7,
  '30d': 30,
  all: null,
};

/** Lower bound for a preset, or `null` for "All time". */
function rangeStart(range: OrderDateRange, now: Date): Date | null {
  const days = RANGE_DAYS[range];

  if (days === null) return null;

  return new Date(startOfYangonDay(now).getTime() - (days - 1) * DAY_MS);
}

/**
 * Row shape for the orders table. `itemCount` is summed from the order lines
 * rather than taken from `_count`, which counts lines, not units.
 */
const ORDER_SUMMARY_SELECT = {
  id: true,
  code: true,
  customerName: true,
  customerPhone: true,
  totalMmk: true,
  status: true,
  createdAt: true,
  channel: { select: { slug: true } },
  items: { select: { quantity: true } },
} as const;

const ORDER_DETAIL_INCLUDE = {
  channel: { select: { slug: true } },
  items: {
    orderBy: { id: 'asc' },
    select: {
      id: true,
      quantity: true,
      unitPriceMmk: true,
      size: true,
      product: {
        select: {
          id: true,
          slug: true,
          nameMy: true,
          nameEn: true,
          images: {
            select: { url: true },
            orderBy: { sortOrder: 'asc' },
            take: 1,
          },
        },
      },
    },
  },
} as const;

type OrderSummaryRow = OrderGetPayload<{ select: typeof ORDER_SUMMARY_SELECT }>;

type OrderDetailRow = OrderGetPayload<{ include: typeof ORDER_DETAIL_INCLUDE }>;

function itemCount(items: readonly { quantity: number }[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function toSummary(row: OrderSummaryRow) {
  return {
    id: row.id,
    code: row.code,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    itemCount: itemCount(row.items),
    totalMmk: row.totalMmk,
    /** A slug, so a row stays the admin screen's `OrderSummary`. */
    channel: row.channel.slug,
    status: row.status,
    /** ISO 8601; the admin renders every timestamp in Asia/Yangon. */
    createdAt: row.createdAt.toISOString(),
  };
}

function toDetail(row: OrderDetailRow, priorOrderCount: number) {
  return {
    ...toSummary(row),
    updatedAt: row.updatedAt.toISOString(),
    note: row.note,
    /** Orders this phone number placed before this one. */
    priorOrderCount,
    items: row.items.map((item) => ({
      id: item.id,
      productId: item.product.id,
      slug: item.product.slug,
      nameMy: item.product.nameMy,
      nameEn: item.product.nameEn,
      /** The product's MAIN photo URL, or null when it has none. */
      imageUrl: item.product.images[0]?.url ?? null,
      size: item.size,
      quantity: item.quantity,
      unitPriceMmk: item.unitPriceMmk,
      lineTotalMmk: item.quantity * item.unitPriceMmk,
    })),
  };
}

/**
 * Every facet except status. The status pills count against this set, so their
 * numbers do not collapse to the selected status once one is chosen.
 */
function toFilters(query: ListAdminOrdersQuery, now: Date): OrderWhereInput {
  const where: OrderWhereInput = {};

  if (query.channel) {
    where.channel = { slug: query.channel };
  }

  const since = rangeStart(query.range, now);
  if (since) {
    where.createdAt = { gte: since };
  }

  if (query.q) {
    // One box searches the code, the customer and the phone. Phones are stored
    // with spaces, so a server-side `contains` only matches what was typed.
    where.OR = [
      { code: { contains: query.q, mode: 'insensitive' } },
      { customerName: { contains: query.q, mode: 'insensitive' } },
      { customerPhone: { contains: query.q, mode: 'insensitive' } },
    ];
  }

  return where;
}

@Injectable()
export class AdminOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orders: OrdersService,
  ) {}

  /**
   * Manual orders taken over chat. Creation is the storefront's path — the
   * prices are read from the database there too — so this reuses
   * `OrdersService.create` and answers with the detail the screen opens.
   */
  async create(input: CreateOrderInput) {
    const created = await this.orders.create(input);

    return this.findByCode(created.code);
  }

  async list(query: ListAdminOrdersQuery) {
    const now = new Date();
    const filters = toFilters(query, now);
    const where: OrderWhereInput = query.status
      ? { ...filters, status: query.status }
      : filters;

    // One query per status is what powers the filter pills; each is indexed and
    // the whole set runs in a single transaction with the page itself.
    const [rows, total, newCount, confirmedCount, deliveredCount, cancelled] =
      await this.prisma.$transaction([
        this.prisma.order.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: query.offset,
          take: query.limit,
          select: ORDER_SUMMARY_SELECT,
        }),
        this.prisma.order.count({ where }),
        this.prisma.order.count({ where: { ...filters, status: 'NEW' } }),
        this.prisma.order.count({
          where: { ...filters, status: 'CONFIRMED' },
        }),
        this.prisma.order.count({
          where: { ...filters, status: 'DELIVERED' },
        }),
        this.prisma.order.count({
          where: { ...filters, status: 'CANCELLED' },
        }),
      ]);

    return {
      items: rows.map(toSummary),
      total,
      limit: query.limit,
      offset: query.offset,
      counts: {
        NEW: newCount,
        CONFIRMED: confirmedCount,
        DELIVERED: deliveredCount,
        CANCELLED: cancelled,
      } satisfies Record<OrderStatus, number>,
    };
  }

  async findByCode(code: string) {
    const order = await this.prisma.order.findUnique({
      where: { code },
      include: ORDER_DETAIL_INCLUDE,
    });

    if (!order) {
      throw new NotFoundException(`Order "${code}" was not found`);
    }

    const priorOrderCount = await this.prisma.order.count({
      where: {
        customerPhone: order.customerPhone,
        createdAt: { lt: order.createdAt },
      },
    });

    return toDetail(order, priorOrderCount);
  }

  async updateStatus(code: string, input: UpdateOrderStatusInput) {
    const existing = await this.prisma.order.findUnique({
      where: { code },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(`Order "${code}" was not found`);
    }

    // Any status is accepted: staff correct data by hand too, and the admin
    // screen already limits the offered transitions to the happy path + cancel.
    await this.prisma.order.update({
      where: { id: existing.id },
      data: { status: input.status },
    });

    return this.findByCode(code);
  }
}
