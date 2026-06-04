import 'dotenv/config';
import { AllExceptionsToRpcFilter } from '../../../libs/shared/src';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { CommerceAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CommerceAppModule,
    {
      transport: Transport.TCP,
      options: { host: '0.0.0.0', port: Number(process.env.COMMERCE_SERVICE_PORT ?? 3002) },
    },
  );
  app.useGlobalFilters(new AllExceptionsToRpcFilter());
  await app.listen();
  console.log('🛍️ commerce-service running on TCP :3002');
}
bootstrap();
