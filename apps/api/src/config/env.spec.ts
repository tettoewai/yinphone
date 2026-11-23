import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';

import { envSchema } from './env.js';

describe('env schema under ConfigModule', () => {
  it('keeps validated defaults when the matching env vars are blank', async () => {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/yinphone_test';
    process.env.SESSION_TTL_HOURS = '';
    process.env.SESSION_REMEMBER_DAYS = '';
    process.env.LOGIN_MAX_ATTEMPTS = '';
    process.env.LOGIN_LOCK_MINUTES = '';
    process.env.COOKIE_SECURE = '';
    process.env.COOKIE_DOMAIN = '';
    process.env.CORS_ORIGINS = '';

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          validationSchema: envSchema,
        }),
      ],
    }).compile();

    const config = moduleRef.get(ConfigService);

    expect(config.getOrThrow('SESSION_TTL_HOURS')).toBe(12);
    expect(config.getOrThrow('SESSION_REMEMBER_DAYS')).toBe(30);
    expect(config.getOrThrow('LOGIN_MAX_ATTEMPTS')).toBe(5);
    expect(config.getOrThrow('LOGIN_LOCK_MINUTES')).toBe(5);
    expect(config.get('COOKIE_SECURE')).toBeUndefined();
    expect(config.getOrThrow('CORS_ORIGINS')).toEqual([
      'http://localhost:3000',
      'http://localhost:3001',
    ]);
  });
});
