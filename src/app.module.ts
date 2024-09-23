import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import {
  minutes,
  seconds,
  ThrottlerGuard,
  ThrottlerModule,
} from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { HealthModule } from '@/health/health-module';
import { TimeoutInterceptor } from '@/interceptors/timeout.interceptor';
import { LoggingInterceptor } from '@/interceptors/logging.interceptor';
import { AccountModule } from '@/account/account.module';
import { CardModule } from '@/card/card.module';
import { AppEnv } from '@/types/app-env';
import { CurrencyModule } from '@/currency/currency.module';
import { ServiceDiscoveryModule } from '@/service-discovery/service-discovery.module';
import { AppController } from '@/app.controller';
import { ConcurrencyModule } from './concurrency/concurrency.module';
import { ConcurrencyInterceptor } from '@/concurrency/concurrency.interceptor';
import { ThrottlingModule } from './throttling/throttling.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: false,
      isGlobal: true,
      envFilePath: ['.env', '.env.development', '.env.production'],
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (conf: ConfigService<AppEnv>) => ({
        type: 'postgres',
        host: conf.get('DB_HOST'),
        port: conf.get('DB_PORT'),
        database: conf.get('DB_NAME'),
        username: conf.get('DB_USER'),
        password: conf.get('DB_PASSWORD'),
        entities: ['**/*.entity.js'],
        synchronize: true,
        namingStrategy: new SnakeNamingStrategy(),
      }),
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (conf: ConfigService<AppEnv>) => [
        {
          name: 'default',
          ttl: minutes(1),
          limit: 100,
        },
        {
          name: 'short',
          ttl: seconds(10),
          limit: 5,
        },
      ],
    }),
    EventEmitterModule.forRoot({ global: true }),
    AccountModule,
    CardModule,
    CurrencyModule,
    HealthModule,
    ServiceDiscoveryModule,
    ConcurrencyModule,
    ThrottlingModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ConcurrencyInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useValue: new TimeoutInterceptor(seconds(10)),
    },
  ],
})
export class AppModule {}
