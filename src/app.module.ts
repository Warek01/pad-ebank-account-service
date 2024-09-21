import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AccountModule } from './account/account.module';
import { CardModule } from './card/card.module';
import { AppEnv } from './types/app-env';
import { CurrencyModule } from './currency/currency.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HealthModule } from '@/health/health-module';
import { ServiceDiscoveryModule } from './service-discovery/service-discovery.module';

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
    EventEmitterModule.forRoot({ global: true }),
    AccountModule,
    CardModule,
    CurrencyModule,
    HealthModule,
    ServiceDiscoveryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
