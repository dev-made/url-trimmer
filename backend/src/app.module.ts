import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
// import { RouterModule } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DrizzleModule } from './drizzle/drizzle.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          // 30 req/min
          ttl: 60000,
          limit: 30,
        },
      ],
    }),
    DrizzleModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
