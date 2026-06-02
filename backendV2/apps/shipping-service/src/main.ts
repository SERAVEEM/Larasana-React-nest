import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ShippingAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ShippingAppModule,
    {
      transport: Transport.TCP,
      options: { host: '0.0.0.0', port: Number(process.env.SHIPPING_SERVICE_PORT ?? 3010) },
    },
  );
  await app.listen();
  console.log('🚚 shipping-service running on TCP :3010');
}
bootstrap();
