import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { OrdersAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    OrdersAppModule,
    {
      transport: Transport.TCP,
      options: { host: '0.0.0.0', port: Number(process.env.ORDERS_SERVICE_PORT ?? 3003) },
    },
  );
  await app.listen();
  console.log('📦 orders-service running on TCP :3003');
}
bootstrap();
