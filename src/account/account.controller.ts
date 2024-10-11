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
  AddCurrencyOptions,
  AddCurrencyResult,
  AuthResult,
  BlockCardResult,
  CanPerformTransactionResult,
  CardIdentifier,
  ChangeCurrencyOptions,
  ChangeCurrencyResult,
  GetProfileOptions,
  GetProfileResult,
  LoginCredentials,
  RegisterCredentials,
  TransactionData,
  UnblockCardResult,
} from '@/generated/proto/account_service';
import { ServiceErrorCode } from '@/generated/proto/shared';
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
    request: AddCurrencyOptions,
    metadata?: Metadata,
  ): Promise<AddCurrencyResult> {
    const card = await this.cardRepo.findOneBy({
      code: request.cardCode,
    });

    if (!card) {
      return {
        error: {
          code: ServiceErrorCode.BAD_REQUEST,
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
            currencyForAdding,
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
    request: CardIdentifier,
    metadata?: Metadata,
  ): Promise<BlockCardResult> {
    const card = await this.cardRepo.findOneBy({
      code: request.cardCode,
    });

    if (!card) {
      return {
        error: {
          code: ServiceErrorCode.NOT_FOUND,
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
    request: TransactionData,
    metadata?: Metadata,
  ): Promise<CanPerformTransactionResult> {
    const card = await this.cardRepo.findOneBy({
      code: request.cardCode,
    });

    if (!card) {
      return {
        error: {
          code: ServiceErrorCode.NOT_FOUND,
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
    request: ChangeCurrencyOptions,
    metadata?: Metadata,
  ): Promise<ChangeCurrencyResult> {
    const card = await this.cardRepo.findOneBy({
      code: request.cardCode,
    });

    if (!card) {
      return {
        error: {
          code: ServiceErrorCode.NOT_FOUND,
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

    card.currency = newCurrency;
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
    request: GetProfileOptions,
    metadata?: Metadata,
  ): Promise<GetProfileResult> {
    const user = await this.userRepo.findOneBy({
      email: request.email,
    });

    if (!user) {
      return {
        error: {
          code: ServiceErrorCode.NOT_FOUND,
          message: 'user not found',
        },
      };
    }

    return {
      profile: {
        email: user.email,
        fullName: user.fullName,
      },
    };
  }

  async login(
    request: LoginCredentials,
    metadata?: Metadata,
  ): Promise<AuthResult> {
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
          code: ServiceErrorCode.NOT_FOUND,
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
          code: ServiceErrorCode.UNAUTHORIZED,
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
    request: RegisterCredentials,
    metadata?: Metadata,
  ): Promise<AuthResult> {
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
          code: ServiceErrorCode.CONFLICT,
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
    request: CardIdentifier,
    metadata?: Metadata,
  ): Promise<UnblockCardResult> {
    const card = await this.cardRepo.findOneBy({
      code: request.cardCode,
    });

    if (!card) {
      return {
        error: {
          code: ServiceErrorCode.NOT_FOUND,
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
