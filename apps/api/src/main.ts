import { StandardSchemaValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { createServer } from 'node:http';

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

  const port = configService.getOrThrow<number>('PORT');

  if (process.env.VERCEL) {
    // Vercel's Node runtime patches `net.Server#listen` while this module is
    // being imported, captures the server that calls it, and starts that
    // server on a private port itself. `app.listen()` resolves only once the
    // server emits "listening", which a captured (never actually listening)
    // server never does, so awaiting it would hang the invocation until the
    // function times out. Initialise the app, then hand the runtime a server.
    await app.init();
    // `getHttpServer()` is only populated by `listen()`, so build the server
    // from the adapter's Express instance, the same way Nest does internally.
    createServer(app.getHttpAdapter().getInstance()).listen(port);
    return;
  }

  await app.listen(port);
}

await bootstrap();
