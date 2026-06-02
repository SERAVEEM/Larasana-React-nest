import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { NotificationAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationAppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: Number(process.env.NOTIFICATION_SERVICE_PORT ?? 3007),
      },
    },
  );
  await app.listen();
  console.log('📧 Notification Service running on TCP :3007');
}
bootstrap();
