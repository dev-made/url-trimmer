import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
    {
      cors: {
        origin: '*',
        methods: ['GET, POST, OPTIONS, PUT, PATCH, DELETE'],
      },
    },
  );
  await app.listen(3000, '0.0.0.0');
}
bootstrap().catch((e) => console.log(e));
