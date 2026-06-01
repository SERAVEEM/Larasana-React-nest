import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AddressesAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AddressesAppModule,
    {
      transport: Transport.TCP,
      options: { host: '0.0.0.0', port: Number(process.env.ADDRESSES_SERVICE_PORT ?? 3009) },
    },
  );
  await app.listen();
  console.log('📍 addresses-service running on TCP :3009');
}
bootstrap();
