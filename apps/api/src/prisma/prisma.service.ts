import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(configService: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: configService.getOrThrow('DATABASE_URL'),
      // On Vercel every function instance keeps its own pool, and `pg`'s
      // default of 10 connections per instance exhausts the database's slots
      // as instances scale out ("Too many database connections opened: too
      // many connections for role ..."). Hold a single connection and let it
      // go as soon as it is idle, so scaled-out instances share the budget.
      max: 1,
      allowExitOnIdle: true,
      idleTimeoutMillis: 5_000,
      connectionTimeoutMillis: 10_000,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
