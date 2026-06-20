import 'dotenv/config';
import { AllExceptionsToRpcFilter } from '../../../libs/shared/src';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { UsersAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(UsersAppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port: Number(process.env.USERS_SERVICE_PORT ?? 3001) },
  });
  app.useGlobalFilters(new AllExceptionsToRpcFilter());
  await app.startAllMicroservices();
  
  const port = process.env.PORT || 4001;
  await app.listen(port);
  console.log(`👤 users-service running (TCP :3001, HTTP :${port})`);
}
bootstrap();
