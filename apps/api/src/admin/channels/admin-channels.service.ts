import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type {
  ChannelGetPayload,
  ChannelOrderByWithRelationInput,
} from '../../generated/prisma/models.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { slugify, uniqueSlug } from '../slug.js';
import { DAY_MS, startOfYangonDay } from '../yangon-time.js';
import type { CreateChannelInput } from './dto/create-channel.schema.js';
import type { UpdateChannelInput } from './dto/update-channel.schema.js';

const CHANNEL_SELECT = {
  id: true,
  slug: true,
  nameMy: true,
  nameEn: true,
  url: true,
  isActive: true,
  sortOrder: true,
} as const;

const CHANNEL_ORDER: ChannelOrderByWithRelationInput[] = [
  { sortOrder: 'asc' },
  { createdAt: 'asc' },
];

/**
 * The card's meta line reads "N orders this week", so the count spans a week —
 * the same seven Yangon calendar days the dashboard's channel split covers.
 */
const WINDOW_DAYS = 7;

type ChannelRow = ChannelGetPayload<{ select: typeof CHANNEL_SELECT }>;

function toChannel(row: ChannelRow, orderCount: number) {
  return { ...row, orderCount };
}

@Injectable()
export class AdminChannelsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Every channel, inactive ones included — the switch on the screen edits them
   * in place — ordered as the storefront lists them. `orderCount` counts the
   * past week's orders through each channel, cancelled included, because a
   * cancelled order still arrived through a channel (mirrors the dashboard).
   */
  async list() {
    const [rows, orders] = await this.prisma.$transaction([
      this.prisma.channel.findMany({
        orderBy: CHANNEL_ORDER,
        select: CHANNEL_SELECT,
      }),
      this.prisma.order.findMany({
        where: { createdAt: { gte: this.windowStart() } },
        select: { channelId: true },
      }),
    ]);

    const counts = new Map<string, number>();
    for (const order of orders) {
      counts.set(order.channelId, (counts.get(order.channelId) ?? 0) + 1);
    }

    return rows.map((row) => toChannel(row, counts.get(row.id) ?? 0));
  }

  async create(input: CreateChannelInput) {
    let slug: string;
    if (input.slug) {
      await this.assertSlugFree(input.slug);
      slug = input.slug;
    } else {
      slug = await uniqueSlug(
        slugify(input.nameEn) || slugify(input.nameMy),
        (candidate) => this.slugTaken(candidate),
        'channel',
      );
    }

    // A dialog that does not pick a position appends rather than jumping to the
    // front of the storefront's contact buttons.
    const sortOrder =
      input.sortOrder > 0 ? input.sortOrder : await this.nextSortOrder();

    const channel = await this.prisma.channel.create({
      data: {
        slug,
        nameMy: input.nameMy,
        nameEn: input.nameEn,
        url: input.url,
        isActive: input.isActive,
        sortOrder,
      },
      select: CHANNEL_SELECT,
    });

    // A brand-new channel has no orders through it yet.
    return toChannel(channel, 0);
  }

  async update(id: string, input: UpdateChannelInput) {
    await this.assertExists(id);

    // The slug is the channel's identity on orders, so a rename leaves it alone
    // unless the caller explicitly sends a new one.
    if (input.slug !== undefined) {
      await this.assertSlugFree(input.slug, id);
    }

    const channel = await this.prisma.channel.update({
      where: { id },
      data: {
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.nameMy !== undefined ? { nameMy: input.nameMy } : {}),
        ...(input.nameEn !== undefined ? { nameEn: input.nameEn } : {}),
        ...(input.url !== undefined ? { url: input.url } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        ...(input.sortOrder !== undefined
          ? { sortOrder: input.sortOrder }
          : {}),
      },
      select: CHANNEL_SELECT,
    });

    return toChannel(channel, await this.ordersThisWeek(id));
  }

  /** The start of the seven-day window containing today, in Asia/Yangon. */
  private windowStart() {
    const todayStart = startOfYangonDay(new Date());
    return new Date(todayStart.getTime() - (WINDOW_DAYS - 1) * DAY_MS);
  }

  private async ordersThisWeek(channelId: string) {
    return this.prisma.order.count({
      where: { channelId, createdAt: { gte: this.windowStart() } },
    });
  }

  private async assertExists(id: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!channel) {
      throw new NotFoundException(`Channel "${id}" was not found`);
    }
  }

  /** The position a new channel appends to: one past the current last row. */
  private async nextSortOrder() {
    const last = await this.prisma.channel.findFirst({
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    return (last?.sortOrder ?? 0) + 1;
  }

  private async slugTaken(slug: string) {
    const existing = await this.prisma.channel.findUnique({
      where: { slug },
      select: { id: true },
    });

    return existing !== null;
  }

  private async assertSlugFree(slug: string, exceptId?: string) {
    const existing = await this.prisma.channel.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existing && existing.id !== exceptId) {
      throw new ConflictException(`Channel slug "${slug}" is already in use`);
    }
  }
}
