import { ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '../prisma/prisma.service.js';
import { HealthController } from './health.controller.js';

function createController(queryRaw: ReturnType<typeof vi.fn>) {
  return new HealthController({
    $queryRaw: queryRaw,
  } as unknown as PrismaService);
}

describe('HealthController', () => {
  it('reports the database as up when the ping succeeds', async () => {
    const queryRaw = vi.fn().mockResolvedValue([{ '?column?': 1 }]);

    await expect(createController(queryRaw).check()).resolves.toEqual({
      status: 'ok',
      db: 'up',
    });
  });

  it('returns 503 when the database ping fails', async () => {
    const queryRaw = vi.fn().mockRejectedValue(new Error('no connection'));

    await expect(createController(queryRaw).check()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
