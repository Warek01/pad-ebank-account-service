export interface AppEnv {
  NODE_ENV: string;

  HOSTNAME: string;

  DB_NAME: string;
  DB_PORT: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_HOST: string;

  WS_PORT: string;

  HTTP_PORT: string;
  HTTP_HOST: string;
  HTTP_SCHEME: string;

  SERVICE_DISCOVERY_HTTP_URL: string;
  SERVICE_DISCOVERY_HEALTHCHECK_INTERVAL: string;
  SERVICE_DISCOVERY_RETRY_INTERVAL: string;
  SERVICE_DISCOVERY_REQUEST_TIMEOUT: string;

  MAX_CONCURRENT_TASKS: string;

  UNHEALTHY: string;

  GRPC_HOST: string;
  GRPC_PORT: string;
  GRPC_SCHEME: string;
  GRPC_RATE_LIMIT_TTL: string;
  GRPC_RATE_LIMIT_LIMIT: string;
}
