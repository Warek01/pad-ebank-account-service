import { ReflectionService } from '@grpc/reflection';
import { NestFactory } from '@nestjs/core';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import fs from 'fs';
import path from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
  const protosPath = path.join(__dirname, 'proto');
  const protoFiles = fs.readdirSync(protosPath);

  const app = await NestFactory.createMicroservice<GrpcOptions>(AppModule, {
    options: {
      protoPath: protoFiles,
      loader: {
        includeDirs: [protosPath],
      },
      package: ['account_service', 'shared'],
      url: `${process.env.HOST}:${process.env.PORT || 3000}`,
      onLoadPackageDefinition: (pkg, server) =>
        new ReflectionService(pkg).addToServer(server),
    },
    transport: Transport.GRPC,
  });

  await app.listen();
}

bootstrap();
