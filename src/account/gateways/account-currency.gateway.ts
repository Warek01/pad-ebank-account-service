import { WebSocketGateway } from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';

import {
  AccountEvent,
  CurrencyUpdatePayload,
} from '@ebank-account/types/events';
import { BaseUpdateGateway } from './base-update-gateway';

@WebSocketGateway(3001, { path: '/account/currency' })
export class AccountCurrencyGateway extends BaseUpdateGateway {
  @OnEvent(AccountEvent.CurrencyUpdate, { async: true })
  onBalanceChange(payload: CurrencyUpdatePayload) {
    this.onUpdate(payload.cardCode, payload);
  }
}
