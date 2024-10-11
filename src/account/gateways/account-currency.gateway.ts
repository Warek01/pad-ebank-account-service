import { WebSocketGateway } from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import { UseInterceptors } from '@nestjs/common';
import 'dotenv/config';

import { AccountEvent, CurrencyUpdatePayload } from '@/types/events';
import { BaseUpdateGateway } from '@/account/gateways/base-update-gateway';
import { LoggingInterceptor } from '@/interceptors/logging.interceptor';

@UseInterceptors(LoggingInterceptor)
@WebSocketGateway(parseInt(process.env.WS_PORT), { path: '/account/currency' })
export class AccountCurrencyGateway extends BaseUpdateGateway {
  @OnEvent(AccountEvent.CurrencyUpdate, { async: true })
  onBalanceChange(payload: CurrencyUpdatePayload) {
    this.onUpdate(payload.cardCode, payload);
  }
}
