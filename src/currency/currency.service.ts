import { Injectable } from '@nestjs/common';
import { Currency } from '@ebank-account/enums/currency';

@Injectable()
export class CurrencyService {
  private static readonly Rates = {
    UsdToMdl: 18.5,
    UsdToEur: 0.9,
  };

  convert(amount: number, from: Currency, to: Currency): number {
    let asUsd: number;

    switch (from) {
      case Currency.Usd:
        asUsd = amount;
        break;
      case Currency.Mdl:
        asUsd = amount / CurrencyService.Rates.UsdToMdl;
        break;
      case Currency.Eur:
        asUsd = amount / CurrencyService.Rates.UsdToEur;
        break;
    }

    switch (to) {
      case Currency.Usd:
        return asUsd;
      case Currency.Mdl:
        return asUsd * CurrencyService.Rates.UsdToMdl;
      case Currency.Eur:
        return asUsd * CurrencyService.Rates.UsdToEur;
    }
  }
}
