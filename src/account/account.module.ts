import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Card, User } from '@/entities';
import { CardModule } from '@/card/card.module';
import { CurrencyModule } from '@/currency/currency.module';

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
