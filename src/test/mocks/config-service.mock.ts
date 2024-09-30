import { ConfigService } from '@nestjs/config';
import { Provider } from '@nestjs/common';

import { AppEnv } from '@/types/app-env';

export function createConfigServiceMock(): Partial<ConfigService> {
  return {
    get: jest.fn((key: keyof AppEnv | string) => {
      const map: Record<typeof key, string> = {
        GRPC_RATE_LIMIT_LIMIT: '10',
        GRPC_RATE_LIMIT_TTL: '1000',
        SERVICE_DISCOVERY_HEALTHCHECK_INTERVAL: '0.5',
        HOSTNAME: 'localhost',
        ACCOUNT_SERVICE_GRPC_PORT: '50051',
        HTTP_PORT: '3000',
        HTTP_SCHEME: 'http',
        SERVICE_DISCOVERY_HTTP_URL: 'http://discovery-service',
        SERVICE_DISCOVERY_REQUEST_TIMEOUT: '100',
        SERVICE_DISCOVERY_RETRY_INTERVAL: '100',
      };

      return map[key];
    }),
  };
}

export const configServiceMockProvider: Provider = {
  provide: ConfigService,
  useFactory: createConfigServiceMock,
};
