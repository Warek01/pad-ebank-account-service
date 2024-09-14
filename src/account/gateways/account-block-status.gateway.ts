import { WebSocketGateway } from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import 'dotenv/config';

import { AccountEvent, BlockStatusUpdatePayload } from '@/types/events';

import { BaseUpdateGateway } from './base-update-gateway';

@WebSocketGateway(parseInt(process.env.WS_PORT), {
  path: '/account/block-status',
})
export class AccountBlockStatusGateway extends BaseUpdateGateway {
  @OnEvent(AccountEvent.BlockStatusUpdate, { async: true })
  onBalanceChange(payload: BlockStatusUpdatePayload) {
    this.onUpdate(payload.cardCode, payload);
  }
}
