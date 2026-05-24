import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AuthAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthAppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: Number(process.env.AUTH_SERVICE_PORT ?? 3001),
      },
    },
  );
  await app.listen();
  console.log('🔐 Auth Service running on TCP :3001');
}
bootstrap();
