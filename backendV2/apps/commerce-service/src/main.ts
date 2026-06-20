import 'dotenv/config';
import { AllExceptionsToRpcFilter } from '../../../libs/shared/src';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { CommerceAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(CommerceAppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port: Number(process.env.COMMERCE_SERVICE_PORT ?? 3002) },
  });
  app.useGlobalFilters(new AllExceptionsToRpcFilter());
  await app.startAllMicroservices();
  
  const port = process.env.PORT || 4002;
  await app.listen(port);
  console.log(`🛍️ commerce-service running (TCP :3002, HTTP :${port})`);
}
bootstrap();
