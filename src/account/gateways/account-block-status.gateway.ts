import { WebSocketGateway } from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';

import {
  AccountEvent,
  BlockStatusUpdatePayload,
} from '@ebank-account/types/events';

import { BaseUpdateGateway } from './base-update-gateway';

@WebSocketGateway(3001, { path: '/account/block-status' })
export class AccountBlockStatusGateway extends BaseUpdateGateway {
  @OnEvent(AccountEvent.BlockStatusUpdate, { async: true })
  onBalanceChange(payload: BlockStatusUpdatePayload) {
    this.onUpdate(payload.cardCode, payload);
  }
}
