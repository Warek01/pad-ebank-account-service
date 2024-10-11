import { WebSocketGateway } from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import 'dotenv/config';
import { UseInterceptors } from '@nestjs/common';

import { AccountEvent, BlockStatusUpdatePayload } from '@/types/events';
import { BaseUpdateGateway } from '@/account/gateways/base-update-gateway';
import { LoggingInterceptor } from '@/interceptors/logging.interceptor';

@WebSocketGateway(parseInt(process.env.WS_PORT), {
  path: '/account/block-status',
})
@UseInterceptors(LoggingInterceptor)
export class AccountBlockStatusGateway extends BaseUpdateGateway {
  @OnEvent(AccountEvent.BlockStatusUpdate, { async: true })
  onBalanceChange(payload: BlockStatusUpdatePayload) {
    this.onUpdate(payload.cardCode, payload);
  }
}
