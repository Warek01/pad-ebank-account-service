import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

import { ThrottlingService } from './throttling.service';
import { AppEnv } from '@/types/app-env';
import { configServiceMockProvider } from '@/test/mocks/config-service.mock';
import { sleep } from '@/utils/sleep';

describe('ThrottlingService', () => {
  let service: ThrottlingService;
  let module: TestingModule;
  let config: ConfigService<AppEnv>;
  let limit: number;
  let ttl: number;

  const ip1 = '0.0.0.0';
  const ip1path1 = '/';
  const ip1path2 = '/test';
  const ip2 = '0.0.0.1';
  const ip2path1 = '/';
  const ip2path2 = '/test';

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [ThrottlingService, configServiceMockProvider],
      imports: [],
    }).compile();

    service = module.get<ThrottlingService>(ThrottlingService);
    config = module.get(ConfigService);
    limit = parseInt(config.get('GRPC_RATE_LIMIT_LIMIT'));
    ttl = parseInt(config.get('GRPC_RATE_LIMIT_TTL'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be able to use initially', () => {
    expect(service.canUse(ip1, ip1path1)).toBe(true);
    expect(service.canUse(ip1, ip1path2)).toBe(true);
    expect(service.canUse(ip2, ip2path1)).toBe(true);
    expect(service.canUse(ip2, ip2path2)).toBe(true);
  });

  it('should not be able to use if limit reached', () => {
    for (let i = 0; i < limit; i++) {
      service.use(ip1, ip1path1);
    }

    expect(service.canUse(ip1, ip1path1)).toBe(false);
    expect(service.canUse(ip1, ip1path2)).toBe(true);
  });

  it('should be able to use if limit not reached', () => {
    for (let i = 0; i < limit - 1; i++) {
      service.use(ip1, ip1path1);
    }

    expect(service.canUse(ip1, ip1path1)).toBe(true);
    expect(service.canUse(ip1, ip1path2)).toBe(true);
  });

  it('should reset after ttl', async () => {
    for (let i = 0; i < limit - 1; i++) {
      service.use(ip1, ip1path1);
      expect(service.canUse(ip1, ip1path1)).toBe(true);
    }

    service.use(ip1, ip1path1);
    expect(service.canUse(ip1, ip1path1)).toBe(false);

    await sleep(ttl + 10);

    for (let i = 0; i < limit - 1; i++) {
      service.use(ip1, ip1path1);
      expect(service.canUse(ip1, ip1path1)).toBe(true);
    }

    service.use(ip1, ip1path1);
    expect(service.canUse(ip1, ip1path1)).toBe(false);
  });
});
