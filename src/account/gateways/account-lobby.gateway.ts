import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from '@nestjs/websockets';
import 'dotenv/config';

import { WsLobbySubscribeRequest, WsLobbySubscribeResponse } from './types';
import { AccountWsEvent } from '@/account/gateways/enums';

@WebSocketGateway(parseInt(process.env.WS_PORT), { path: '/account' })
export class AccountLobbyGateway {
  @SubscribeMessage(AccountWsEvent.Echo)
  echo(@MessageBody() data: string): string {
    return data;
  }

  @SubscribeMessage(AccountWsEvent.Subscribe)
  async subscribe(
    @MessageBody() data: WsLobbySubscribeRequest,
  ): Promise<WsResponse<WsLobbySubscribeResponse>> {
    let response: WsLobbySubscribeResponse = {
      redirectTo: null,
      error: null,
    };

    switch (data.subscribeTo) {
      case 'balance':
        response.redirectTo = '/account/balance';
        break;
      case 'currency':
        response.redirectTo = '/account/currency';
        break;
      case 'block-status':
        response.redirectTo = '/account/block-status';
        break;
      default:
        response.error = {
          code: 400,
          message: 'subscription not found',
        };
    }

    return {
      event: 'redirect',
      data: response,
    };
  }
}
