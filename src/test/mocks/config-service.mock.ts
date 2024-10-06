import { ConfigService } from '@nestjs/config';
import { Provider } from '@nestjs/common';

import { AppEnv } from '@/types/app-env';

export function createConfigServiceMock(): Partial<ConfigService> {
  return {
    get: jest.fn((key: keyof AppEnv) => {
      const map: Partial<Record<typeof key, string>> = {
        GRPC_RATE_LIMIT_LIMIT: '10',
        GRPC_RATE_LIMIT_TTL: '1000',
        HOSTNAME: 'localhost',
        HTTP_PORT: '3000',
        HTTP_SCHEME: 'http',
        SERVICE_DISCOVERY_HTTP_URL: 'http://service-discovery',
        SERVICE_DISCOVERY_HEALTHCHECK_INTERVAL: '60',
        SERVICE_DISCOVERY_REQUEST_TIMEOUT: '100',
        SERVICE_DISCOVERY_RETRY_INTERVAL: '100',
        GRPC_HOST: 'localhost',
        GRPC_PORT: '50051',
        GRPC_SCHEME: 'http',
        NODE_ENV: 'development',
        HTTP_HOST: '0.0.0.0',
      };

      return map[key];
    }),
  };
}

export const configServiceMockProvider: Provider = {
  provide: ConfigService,
  useFactory: createConfigServiceMock,
};
