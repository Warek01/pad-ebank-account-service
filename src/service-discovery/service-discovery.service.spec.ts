import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { Logger } from '@nestjs/common';

import { configServiceMockProvider } from '@/test/mocks/config-service.mock';
import { ServiceDiscoveryService } from '@/service-discovery/service-discovery.service';
import { AppEnv } from '@/types/app-env';

const mockHttpService = {
  post: jest.fn(),
};

describe('ServiceDiscoveryService', () => {
  let service: ServiceDiscoveryService;
  let http: HttpService;
  let config: ConfigService<AppEnv>;
  let retryInterval: number;
  let requestTimeout: number;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceDiscoveryService,
        configServiceMockProvider,
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get(ServiceDiscoveryService);
    http = module.get(HttpService);
    config = module.get(ConfigService);
    retryInterval = parseInt(config.get('SERVICE_DISCOVERY_RETRY_INTERVAL'));
    requestTimeout = parseInt(config.get('SERVICE_DISCOVERY_REQUEST_TIMEOUT'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should retry if registration fails', async () => {
    const errorResponse = throwError(() => new Error('Network error'));
    mockHttpService.post
      .mockReturnValueOnce(errorResponse)
      .mockReturnValue(of({}));

    const errorSpy = jest.spyOn(Logger.prototype, 'error');
    await service.registerService(1);

    expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));
  }, 10_000);
});
