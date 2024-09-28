import { Injectable } from '@nestjs/common';

import { Currency } from '@/generated/proto/shared';

@Injectable()
export class CurrencyService {
  private static readonly Rates = {
    UsdToMdl: 18.5,
    UsdToEur: 0.9,
  };

  convert(amount: number, from: Currency, to: Currency): number {
    let asUsd: number;

    switch (from) {
      case Currency.USD:
        asUsd = amount;
        break;
      case Currency.MDL:
        asUsd = amount / CurrencyService.Rates.UsdToMdl;
        break;
      case Currency.EUR:
        asUsd = amount / CurrencyService.Rates.UsdToEur;
        break;
    }

    switch (to) {
      case Currency.USD:
        return asUsd;
      case Currency.MDL:
        return asUsd * CurrencyService.Rates.UsdToMdl;
      case Currency.EUR:
        return asUsd * CurrencyService.Rates.UsdToEur;
    }
  }
}
