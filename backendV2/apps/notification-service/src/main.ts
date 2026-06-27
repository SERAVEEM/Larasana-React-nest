import 'dotenv/config';
import { AllExceptionsToRpcFilter } from '../../../libs/shared/src';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { NotificationAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationAppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: Number(process.env.NOTIFICATION_SERVICE_PORT ?? 3003),
    },
  });
  app.useGlobalFilters(new AllExceptionsToRpcFilter());
  await app.startAllMicroservices();
  
  const port = process.env.NOTIFICATION_SERVICE_HTTP_PORT || 4003;
  await app.listen(port);
  console.log(`📧 Notification Service running (TCP :3003, HTTP :${port})`);
}
bootstrap();
