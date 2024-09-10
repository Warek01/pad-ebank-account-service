export interface WsLobbySubscribeRequest {
  subscribeTo: 'balance' | 'currency' | 'block-status';
}

export interface WsLobbySubscribeResponse {
  redirectTo?:
    | '/account/balance'
    | '/account/currency'
    | '/account/block-status';
  error?: {
    code: number;
    message: string;
  };
}

export interface WsSubscriptionRequest {
  cardCode?: string;
}

export interface WsSubscriptionUpdate<T> {
  unixTimestamp: number;
  oldValue: T;
  newValue: T;
}
