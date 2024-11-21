import { Metadata } from '@grpc/grpc-js';
import { Controller, UseGuards, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RpcException } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcryptjs';

import {
  AccountServiceController,
  AccountServiceControllerMethods,
  ProtoAddCurrencyOptions,
  ProtoAddCurrencyResult,
  ProtoAuthResult,
  ProtoBlockCardResult,
  ProtoCanPerformTransactionResult,
  ProtoCardIdentifier,
  ProtoChangeCurrencyOptions,
  ProtoChangeCurrencyResult,
  ProtoGetProfileOptions,
  ProtoGetProfileResult,
  ProtoLoginCredentials,
  ProtoRegisterCredentials,
  ProtoTransactionData,
  ProtoUnblockCardResult,
} from '@/generated/proto/account_service';
import { ProtoServiceErrorCode } from '@/generated/proto/shared';
import { Card, User } from '@/entities';
import { CardService } from '@/card/card.service';
import { CurrencyService } from '@/currency/currency.service';
import {
  AccountEvent,
  BalanceUpdatePayload,
  BlockStatusUpdatePayload,
  CurrencyUpdatePayload,
} from '@/types/events';
import { ThrottlingGrpcGuard } from '@/throttling/throttling.grpc.guard';
import { ConcurrencyGrpcInterceptor } from '@/concurrency/concurrency.grpc.interceptor';
import { AppEnv } from '@/types/app-env';
import { LoggingInterceptor } from '@/interceptors/logging.interceptor';
import { Currency } from '@/enums/currency.enum';

@Controller('account')
@AccountServiceControllerMethods()
@UseGuards(ThrottlingGrpcGuard)
@UseInterceptors(ConcurrencyGrpcInterceptor)
@UseInterceptors(LoggingInterceptor)
export class AccountController implements AccountServiceController {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepo: Repository<Card>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly config: ConfigService<AppEnv>,
    private readonly cardService: CardService,
    private readonly currencyService: CurrencyService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async addCurrency(
    request: ProtoAddCurrencyOptions,
    metadata?: Metadata,
  ): Promise<ProtoAddCurrencyResult> {
    const card = await this.cardRepo.findOneBy({
      code: request.cardCode,
    });

    if (!card) {
      return {
        error: {
          code: ProtoServiceErrorCode.BAD_REQUEST,
          message: 'card not found',
        },
      };
    }

    const currencyForAdding = request.currency;
    const oldAmount = card.currencyAmount;

    card.currencyAmount +=
      card.currency === currencyForAdding
        ? request.amount
        : this.currencyService.convert(
            request.amount,
            currencyForAdding as Currency,
            card.currency,
          );

    await this.cardRepo.save(card);

    this.eventEmitter.emit(AccountEvent.BalanceUpdate, {
      cardCode: card.code,
      oldValue: oldAmount,
      newValue: card.currencyAmount,
    } as BalanceUpdatePayload);

    return {
      error: null,
    };
  }

  async blockCard(
    request: ProtoCardIdentifier,
    metadata?: Metadata,
  ): Promise<ProtoBlockCardResult> {
    const card = await this.cardRepo.findOneBy({
      code: request.cardCode,
    });

    if (!card) {
      return {
        error: {
          code: ProtoServiceErrorCode.NOT_FOUND,
          message: 'card not found',
        },
      };
    }

    card.isBlocked = true;

    await this.cardRepo.save(card);

    this.eventEmitter.emit(AccountEvent.BlockStatusUpdate, {
      cardCode: card.code,
      oldValue: !card.isBlocked,
      newValue: card.isBlocked,
    } as BlockStatusUpdatePayload);

    return {
      error: null,
    };
  }

  async canPerformTransaction(
    request: ProtoTransactionData,
    metadata?: Metadata,
  ): Promise<ProtoCanPerformTransactionResult> {
    const card = await this.cardRepo.findOneBy({
      code: request.cardCode,
    });

    if (!card) {
      return {
        error: {
          code: ProtoServiceErrorCode.NOT_FOUND,
          message: 'card not found',
        },
      };
    }

    const requestedAmount = this.currencyService.convert(
      request.amount,
      request.currency,
      card.currency,
    );

    return {
      canPerform: requestedAmount <= card.currencyAmount,
    };
  }

  async changeCurrency(
    request: ProtoChangeCurrencyOptions,
    metadata?: Metadata,
  ): Promise<ProtoChangeCurrencyResult> {
    const card = await this.cardRepo.findOneBy({
      code: request.cardCode,
    });

    if (!card) {
      return {
        error: {
          code: ProtoServiceErrorCode.NOT_FOUND,
          message: 'card not found',
        },
      };
    }

    const newCurrency = request.currency;
    const oldCurrency = card.currency;
    const newAmount = this.currencyService.convert(
      card.currencyAmount,
      card.currency,
      newCurrency,
    );

    card.currency = newCurrency as Currency;
    card.currencyAmount = newAmount;
    await this.cardRepo.save(card);

    this.eventEmitter.emit(AccountEvent.CurrencyUpdate, {
      cardCode: card.code,
      oldValue: oldCurrency,
      newValue: newCurrency,
    } as CurrencyUpdatePayload);

    return {
      error: null,
    };
  }

  async getProfile(
    request: ProtoGetProfileOptions,
    metadata?: Metadata,
  ): Promise<ProtoGetProfileResult> {
    const user = await this.userRepo.findOneBy({
      email: request.email,
    });

    if (!user) {
      return {
        error: {
          code: ProtoServiceErrorCode.NOT_FOUND,
          message: 'user not found',
        },
      };
    }

    return {
      profile: {
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt.getTime(),
      },
    };
  }

  async login(
    request: ProtoLoginCredentials,
    metadata?: Metadata,
  ): Promise<ProtoAuthResult> {
    // Circuit breaker test
    if (this.config.get('UNHEALTHY') === 'true') {
      // await sleep(60_000);
      throw new RpcException('Account Service Unavailable');
    }

    const user = await this.userRepo.findOneBy({
      email: request.email,
    });

    if (!user) {
      return {
        error: {
          code: ProtoServiceErrorCode.NOT_FOUND,
          message: 'user not found',
        },
      };
    }

    const compareResult = await bcrypt.compare(
      request.password,
      user?.password,
    );

    if (!compareResult) {
      return {
        error: {
          code: ProtoServiceErrorCode.UNAUTHORIZED,
          message: 'invalid password',
        },
      };
    }

    return {
      credentials: {
        email: user.email,
        fullName: user.fullName,
      },
    };
  }

  async register(
    request: ProtoRegisterCredentials,
    metadata?: Metadata,
  ): Promise<ProtoAuthResult> {
    // Circuit breaker test
    if (this.config.get('UNHEALTHY') === 'true') {
      // await sleep(60_000);
      throw new RpcException('Account Service Unavailable');
    }

    const alreadyExists = await this.userRepo.exists({
      where: { email: request.email },
    });

    if (alreadyExists) {
      return {
        error: {
          code: ProtoServiceErrorCode.CONFLICT,
          message: 'user already exists',
        },
      };
    }

    const user = new User();

    user.email = request.email;
    user.fullName = request.fullName;
    user.password = await bcrypt.hash(
      request.password,
      await bcrypt.genSalt(10),
    );
    user.card = this.cardService.createCard(user);

    await this.userRepo.save(user);
    await this.cardRepo.save(user.card);

    return {
      credentials: {
        email: user.email,
        fullName: user.fullName,
      },
    };
  }

  async unblockCard(
    request: ProtoCardIdentifier,
    metadata?: Metadata,
  ): Promise<ProtoUnblockCardResult> {
    const card = await this.cardRepo.findOneBy({
      code: request.cardCode,
    });

    if (!card) {
      return {
        error: {
          code: ProtoServiceErrorCode.NOT_FOUND,
          message: 'card not found',
        },
      };
    }

    card.isBlocked = false;

    await this.cardRepo.save(card);

    this.eventEmitter.emit(AccountEvent.BlockStatusUpdate, {
      cardCode: card.code,
      oldValue: !card.isBlocked,
      newValue: card.isBlocked,
    } as BlockStatusUpdatePayload);

    return {
      error: null,
    };
  }
}
