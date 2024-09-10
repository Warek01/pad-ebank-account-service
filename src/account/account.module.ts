import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Card, User } from '@ebank-account/entities';
import { CardModule } from '@ebank-account/card/card.module';
import { CurrencyModule } from '@ebank-account/currency/currency.module';

import { AccountController } from './account.controller';
import {
  AccountBalanceGateway,
  AccountLobbyGateway,
  AccountCurrencyGateway,
  AccountBlockStatusGateway,
} from './gateways';

@Module({
  imports: [TypeOrmModule.forFeature([Card, User]), CardModule, CurrencyModule],
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
