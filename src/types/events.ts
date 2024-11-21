import { Currency } from '@/enums/currency.enum';

export const enum AccountEvent {
  BalanceUpdate = 'balance.update',
  CurrencyUpdate = 'currency.update',
  BlockStatusUpdate = 'block-status.update',
}

export interface BalanceUpdatePayload {
  cardCode: string;
  oldValue: number;
  newValue: number;
}

export interface CurrencyUpdatePayload {
  cardCode: string;
  oldValue: Currency;
  newValue: Currency;
}

export interface BlockStatusUpdatePayload {
  cardCode: string;
  oldValue: boolean;
  newValue: boolean;
}
