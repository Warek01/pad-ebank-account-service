import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyService } from './currency.service';
import { Currency } from '@/generated/proto/shared';

describe('CurrencyService', () => {
  let service: CurrencyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CurrencyService],
    }).compile();

    service = module.get<CurrencyService>(CurrencyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should convert USD to MDL', () => {
    const result = service.convert(100, Currency.USD, Currency.MDL);
    expect(result).toBe(100 * 18.5);
  });

  it('should convert MDL to USD', () => {
    const result = service.convert(1850, Currency.MDL, Currency.USD);
    expect(result).toBe(1850 / 18.5);
  });

  it('should convert USD to EUR', () => {
    const result = service.convert(100, Currency.USD, Currency.EUR);
    expect(result).toBe(100 * 0.9);
  });

  it('should convert EUR to USD', () => {
    const result = service.convert(90, Currency.EUR, Currency.USD);
    expect(result).toBe(90 / 0.9);
  });

  it('should convert MDL to EUR via USD', () => {
    const result = service.convert(1850, Currency.MDL, Currency.EUR);
    expect(result).toBe((1850 / 18.5) * 0.9);
  });

  it('should convert EUR to MDL via USD', () => {
    const result = service.convert(90, Currency.EUR, Currency.MDL);
    expect(result).toBe((90 / 0.9) * 18.5);
  });
});
