import { ReflectionService } from '@grpc/reflection';
import { NestFactory } from '@nestjs/core';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { WsAdapter } from '@nestjs/platform-ws';
import { ConfigService } from '@nestjs/config';
import { INestApplication, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Express } from 'express';
import fs from 'fs/promises';
import path from 'path';

import { ACCOUNT_SERVICE_PACKAGE_NAME } from '@/generated/proto/account_service';
import { AppModule } from '@/app.module';
import { AppEnv } from '@/types/app-env';

async function bootstrap() {
  const logger = new Logger(bootstrap.name, { timestamp: true });
  const app = await NestFactory.create<INestApplication<Express>>(AppModule, {
    logger,
    cors: {
      origin: '*',
      allowedHeaders: '*',
      methods: '*',
    },
  });
  const config = app.get(ConfigService<AppEnv>);
  const httpPort = parseInt(config.get('HTTP_PORT'));
  const httpHost = config.get('HTTP_HOST');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('eBank account service')
    .setVersion('1.0.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, swaggerDocument);

  const protosPath: string = path.join(__dirname, 'proto');
  const protoFiles: string[] = await fs.readdir(protosPath);

  const accountGrpcOptions: GrpcOptions = {
    options: {
      protoPath: protoFiles,
      loader: {
        defaults: true,
        includeDirs: [protosPath],
      },
      package: ACCOUNT_SERVICE_PACKAGE_NAME,
      url: config.get('ACCOUNT_SERVICE_GRPC_URL'),
      onLoadPackageDefinition: (pkg, server) =>
        new ReflectionService(pkg).addToServer(server),
    },
    transport: Transport.GRPC,
  };

  app.connectMicroservice(accountGrpcOptions);
  app.useWebSocketAdapter(new WsAdapter());

  await Promise.all([
    app.startAllMicroservices(),
    app.listen(httpPort, httpHost, () =>
      logger.log(`HTTP listening to ${httpHost}:${httpPort}`),
    ),
  ]);
}

bootstrap();
