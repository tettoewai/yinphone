import { StandardSchemaValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  app.enableCors({
    origin: configService.getOrThrow<string[]>('CORS_ORIGINS'),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    // The admin app signs in with an httpOnly cookie, so browsers must be
    // allowed to send credentials on cross-origin requests.
    credentials: true,
  });
  app.enableShutdownHooks();

  await app.listen(configService.getOrThrow<number>('PORT'));
}

await bootstrap();
