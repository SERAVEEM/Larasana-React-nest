import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { FavoritesAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    FavoritesAppModule,
    {
      transport: Transport.TCP,
      options: { host: '0.0.0.0', port: Number(process.env.FAVORITES_SERVICE_PORT ?? 3008) },
    },
  );
  await app.listen();
  console.log('❤️ favorites-service running on TCP :3008');
}
bootstrap();
