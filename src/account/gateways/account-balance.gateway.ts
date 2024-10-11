import { WebSocketGateway } from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import { UseInterceptors } from '@nestjs/common';
import 'dotenv/config';

import { AccountEvent, BalanceUpdatePayload } from '@/types/events';
import { BaseUpdateGateway } from '@/account/gateways/base-update-gateway';
import { LoggingInterceptor } from '@/interceptors/logging.interceptor';

@WebSocketGateway(parseInt(process.env.WS_PORT), { path: '/account/balance' })
@UseInterceptors(LoggingInterceptor)
export class AccountBalanceGateway extends BaseUpdateGateway {
  @OnEvent(AccountEvent.BalanceUpdate, { async: true })
  onBalanceChange(payload: BalanceUpdatePayload) {
    this.onUpdate(payload.cardCode, payload);
  }
}
