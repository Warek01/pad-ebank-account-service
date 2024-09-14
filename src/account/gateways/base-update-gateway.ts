import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
} from '@nestjs/websockets';
import { AccountWsEvent } from '@/account/gateways/enums';
import {
  WsSubscriptionRequest,
  WsSubscriptionUpdate,
} from '@/account/gateways/types';
import { WebSocket } from 'ws';

export abstract class BaseUpdateGateway {
  protected readonly socketMap = new Map<string, Set<WebSocket>>();

  @SubscribeMessage(AccountWsEvent.Subscribe)
  subscribe(
    @MessageBody() data: WsSubscriptionRequest,
    @ConnectedSocket() socket: WebSocket,
  ): void {
    const set = this.socketMap.get(data.cardCode) ?? new Set<WebSocket>();
    set.add(socket);
    this.socketMap.set(data.cardCode, set);

    socket.on('close', () => {
      this.socketMap.get(data.cardCode)?.delete(socket);
    });
  }

  @SubscribeMessage(AccountWsEvent.Unsubscribe)
  unsubscribe(
    @MessageBody() data: WsSubscriptionRequest,
    @ConnectedSocket() socket: WebSocket,
  ): void {
    this.socketMap.get(data.cardCode)?.delete(socket);
  }

  protected onUpdate<T>(
    cardCode: string,
    payload: Partial<WsSubscriptionUpdate<T>>,
  ) {
    const sockets: Set<WebSocket> | undefined = this.socketMap.get(cardCode);

    if (!sockets) {
      return;
    }

    const data: WsSubscriptionUpdate<T> = {
      unixTimestamp: Date.now(),
      newValue: payload.newValue,
      oldValue: payload.oldValue,
    };

    for (const socket of sockets) {
      if (!socket || socket.readyState !== WebSocket.OPEN || socket.isPaused) {
        sockets.delete(socket);
        continue;
      }

      socket.send(JSON.stringify(data));
    }
  }
}
