import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { PaymentsAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PaymentsAppModule,
    {
      transport: Transport.TCP,
      options: { host: '0.0.0.0', port: Number(process.env.PAYMENTS_SERVICE_PORT ?? 3005) },
    },
  );
  await app.listen();
  console.log('💳 payments-service running on TCP :3005');
}
bootstrap();
