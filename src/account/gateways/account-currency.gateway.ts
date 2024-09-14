import { WebSocketGateway } from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import 'dotenv/config';

import { AccountEvent, CurrencyUpdatePayload } from '@/types/events';
import { BaseUpdateGateway } from './base-update-gateway';

@WebSocketGateway(parseInt(process.env.WS_PORT), { path: '/account/currency' })
export class AccountCurrencyGateway extends BaseUpdateGateway {
  @OnEvent(AccountEvent.CurrencyUpdate, { async: true })
  onBalanceChange(payload: CurrencyUpdatePayload) {
    this.onUpdate(payload.cardCode, payload);
  }
}
