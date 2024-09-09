import { Metadata } from '@grpc/grpc-js';
import { Controller, forwardRef, Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';

import {
  AccountServiceController,
  AccountServiceControllerMethods,
  AddCurrencyOptions,
  AddCurrencyResult,
  AuthCredentials,
  AuthStatus,
  BlockCardResult,
  CanPerformTransactionResult,
  CardIdentifier,
  ChangeCurrencyOptions,
  ChangeCurrencyResult,
  GetProfileOptions,
  LoginCredentials,
  Profile,
  RegisterCredentials,
  TransactionData,
  UnblockCardResult,
} from '@ebank-account/generated/proto/account_service';
import { Card, User } from '@ebank-account/entities';
import { CardService } from '@ebank-account/card/card.service';

@Controller('account')
@AccountServiceControllerMethods()
export class AccountController implements AccountServiceController {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepo: Repository<Card>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @Inject(forwardRef(() => CardService))
    private readonly cardService: CardService,
  ) {}

  public addCurrency(
    request: AddCurrencyOptions,
    metadata?: Metadata,
  ):
    | Promise<AddCurrencyResult>
    | Observable<AddCurrencyResult>
    | AddCurrencyResult {
    return undefined!;
  }

  public blockCard(
    request: CardIdentifier,
    metadata?: Metadata,
  ): Promise<BlockCardResult> | Observable<BlockCardResult> | BlockCardResult {
    return undefined!;
  }

  public canPerformTransaction(
    request: TransactionData,
    metadata?: Metadata,
  ):
    | Promise<CanPerformTransactionResult>
    | Observable<CanPerformTransactionResult>
    | CanPerformTransactionResult {
    return undefined!;
  }

  public changeCurrency(
    request: ChangeCurrencyOptions,
    metadata?: Metadata,
  ):
    | Promise<ChangeCurrencyResult>
    | Observable<ChangeCurrencyResult>
    | ChangeCurrencyResult {
    return undefined!;
  }

  public getProfile(
    request: GetProfileOptions,
    metadata?: Metadata,
  ): Promise<Profile> | Observable<Profile> | Profile {
    return undefined!;
  }

  async login(
    request: LoginCredentials,
    metadata?: Metadata,
  ): Promise<AuthCredentials> {
    const user = await this.userRepo.findOneBy({
      email: request.email,
    });

    if (!user) {
      return {
        email: '',
        fullName: '',
        authStatus: AuthStatus.USER_NOT_FOUND,
      };
    }

    const compareResult = await bcrypt.compare(
      request.password,
      user?.password,
    );

    if (!compareResult) {
      return {
        email: '',
        fullName: '',
        authStatus: AuthStatus.INVALID_CREDENTIALS,
      };
    }

    return {
      email: user.email,
      fullName: user.fullName,
      authStatus: AuthStatus.SUCCESS,
    };
  }

  async register(
    request: RegisterCredentials,
    metadata?: Metadata,
  ): Promise<AuthCredentials> {
    const alreadyExists = await this.userRepo.exists({
      where: { email: request.email },
    });

    if (alreadyExists) {
      return {
        email: '',
        fullName: '',
        authStatus: AuthStatus.USER_ALREADY_EXISTS,
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
      email: user.email,
      fullName: user.fullName,
      authStatus: AuthStatus.SUCCESS,
    };
  }

  public unblockCard(
    request: CardIdentifier,
    metadata?: Metadata,
  ):
    | Promise<UnblockCardResult>
    | Observable<UnblockCardResult>
    | UnblockCardResult {
    return undefined!;
  }
}
