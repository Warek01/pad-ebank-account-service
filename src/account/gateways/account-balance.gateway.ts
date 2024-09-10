import { WebSocketGateway } from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';

import {
  AccountEvent,
  BalanceUpdatePayload,
} from '@ebank-account/types/events';

import { BaseUpdateGateway } from './base-update-gateway';

@WebSocketGateway(3001, { path: '/account/balance' })
export class AccountBalanceGateway extends BaseUpdateGateway {
  @OnEvent(AccountEvent.BalanceUpdate, { async: true })
  onBalanceChange(payload: BalanceUpdatePayload) {
    this.onUpdate(payload.cardCode, payload);
  }
}
