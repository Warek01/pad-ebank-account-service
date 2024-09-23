import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Card, User } from '@/entities';
import { CardModule } from '@/card/card.module';
import { CurrencyModule } from '@/currency/currency.module';
import { ThrottlingModule } from '@/throttling/throttling.module';
import { ConcurrencyModule } from '@/concurrency/concurrency.module';

import { AccountController } from './account.controller';
import {
  AccountBalanceGateway,
  AccountBlockStatusGateway,
  AccountCurrencyGateway,
  AccountLobbyGateway,
} from './gateways';

@Module({
  imports: [
    TypeOrmModule.forFeature([Card, User]),
    CardModule,
    CurrencyModule,
    ConcurrencyModule,
    ThrottlingModule,
  ],
  exports: [],
  providers: [
    AccountLobbyGateway,
    AccountBalanceGateway,
    AccountCurrencyGateway,
    AccountBlockStatusGateway,
  ],
  controllers: [AccountController],
})
export class AccountModule {}
