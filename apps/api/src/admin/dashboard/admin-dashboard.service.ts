import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';
import { DAY_MS, startOfYangonDay, yangonDateKey } from '../yangon-time.js';

/** The dashboard's orders table shows the five latest. */
const RECENT_ORDER_LIMIT = 5;

/** Chart and channel-split window, in calendar days including today. */
const WINDOW_DAYS = 7;

const RECENT_ORDER_SELECT = {
  id: true,
  code: true,
  customerName: true,
  totalMmk: true,
  status: true,
  createdAt: true,
  channel: { select: { slug: true } },
} as const;

/** One column of the seven-day sales chart. */
type SalesDay = {
  /** `YYYY-MM-DD` in Asia/Yangon. */
  date: string;
  /** Day-of-month label the chart prints under the bar. */
  day: string;
  /** Takings that day, excluding cancelled orders. */
  amountMmk: number;
};

type ChannelShare = {
  slug: string;
  nameMy: string;
  nameEn: string;
  /** Orders through this channel in the window, cancelled included. */
  orders: number;
  /** Rounded share of the window's orders, 0–100. */
  sharePct: number;
};

/**
 * The dashboard overview.
 *
 * Money figures exclude `CANCELLED` orders so "sales" means takings, not orders
 * that were talked away. The channel split and the orders KPI still count every
 * order, because a cancelled order did arrive through a channel.
 *
 * Aggregation happens in TypeScript over one week of orders rather than in SQL:
 * Prisma's `groupBy` typing is unreliable in this codebase (see the products
 * service) and a week of rows is small.
 */
@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const now = new Date();
    const todayStart = startOfYangonDay(now);
    const yesterdayStart = new Date(todayStart.getTime() - DAY_MS);
    const windowStart = new Date(
      todayStart.getTime() - (WINDOW_DAYS - 1) * DAY_MS,
    );

    const [windowOrders, recentRows, newCount, confirmedCount, channelRows] =
      await this.prisma.$transaction([
        this.prisma.order.findMany({
          where: { createdAt: { gte: windowStart } },
          select: {
            createdAt: true,
            totalMmk: true,
            status: true,
            channel: { select: { slug: true } },
          },
        }),
        this.prisma.order.findMany({
          orderBy: { createdAt: 'desc' },
          take: RECENT_ORDER_LIMIT,
          select: RECENT_ORDER_SELECT,
        }),
        this.prisma.order.count({ where: { status: 'NEW' } }),
        this.prisma.order.count({ where: { status: 'CONFIRMED' } }),
        this.prisma.channel.findMany({
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
          select: { slug: true, nameMy: true, nameEn: true },
        }),
      ]);

    const todayKey = yangonDateKey(todayStart);
    const yesterdayKey = yangonDateKey(yesterdayStart);

    const today = {
      orders: 0,
      salesOrders: 0,
      salesMmk: 0,
      ordersYesterday: 0,
      salesMmkYesterday: 0,
    };

    const salesByDay = new Map<string, number>();
    const ordersByChannel = new Map<string, number>();
    let windowOrderCount = 0;

    for (const order of windowOrders) {
      const key = yangonDateKey(order.createdAt);
      const countable = order.status !== 'CANCELLED';

      ordersByChannel.set(
        order.channel.slug,
        (ordersByChannel.get(order.channel.slug) ?? 0) + 1,
      );
      windowOrderCount += 1;

      if (key === todayKey) {
        today.orders += 1;
        if (countable) {
          today.salesOrders += 1;
          today.salesMmk += order.totalMmk;
        }
      } else if (key === yesterdayKey) {
        today.ordersYesterday += 1;
        if (countable) {
          today.salesMmkYesterday += order.totalMmk;
        }
      }

      if (countable) {
        salesByDay.set(key, (salesByDay.get(key) ?? 0) + order.totalMmk);
      }
    }

    const salesLast7Days: SalesDay[] = Array.from(
      { length: WINDOW_DAYS },
      (_, index) => {
        const date = new Date(windowStart.getTime() + index * DAY_MS);
        const key = yangonDateKey(date);

        return {
          date: key,
          // Strip the leading zero so the label reads "5", not "05".
          day: String(Number(key.slice(8, 10))),
          amountMmk: salesByDay.get(key) ?? 0,
        };
      },
    );

    const channels: ChannelShare[] = channelRows.map((channel) => {
      const orders = ordersByChannel.get(channel.slug) ?? 0;

      return {
        slug: channel.slug,
        nameMy: channel.nameMy,
        nameEn: channel.nameEn,
        orders,
        sharePct:
          windowOrderCount === 0
            ? 0
            : Math.round((orders / windowOrderCount) * 100),
      };
    });

    return {
      today,
      /** All-time NEW and CONFIRMED counts: the KPI cards and the nav chip. */
      pending: { new: newCount, confirmed: confirmedCount },
      salesLast7Days,
      channels,
      recentOrders: recentRows.map((row) => ({
        id: row.id,
        code: row.code,
        customerName: row.customerName,
        totalMmk: row.totalMmk,
        channel: row.channel.slug,
        status: row.status,
        /** ISO 8601; the admin renders timestamps in Asia/Yangon. */
        createdAt: row.createdAt.toISOString(),
      })),
      /** The window the chart and the split cover, for the screen's captions. */
      windowDays: WINDOW_DAYS,
    };
  }
}
