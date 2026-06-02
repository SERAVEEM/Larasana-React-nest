import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AdminAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AdminAppModule,
    {
      transport: Transport.TCP,
      options: { host: '0.0.0.0', port: Number(process.env.ADMIN_SERVICE_PORT ?? 3006) },
    },
  );
  await app.listen();
  console.log('🔧 admin-service running on TCP :3006');
}
bootstrap();
