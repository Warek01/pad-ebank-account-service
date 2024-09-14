import { WebSocketGateway } from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import 'dotenv/config';

import { AccountEvent, BalanceUpdatePayload } from '@/types/events';

import { BaseUpdateGateway } from './base-update-gateway';

@WebSocketGateway(parseInt(process.env.WS_PORT), { path: '/account/balance' })
export class AccountBalanceGateway extends BaseUpdateGateway {
  @OnEvent(AccountEvent.BalanceUpdate, { async: true })
  onBalanceChange(payload: BalanceUpdatePayload) {
    this.onUpdate(payload.cardCode, payload);
  }
}
