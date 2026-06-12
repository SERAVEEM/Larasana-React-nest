import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { GatewayAppModule } from './app.module';
import { RpcExceptionFilter } from './common/rpc-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(GatewayAppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalFilters(new RpcExceptionFilter());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, forbidNonWhitelisted: true,
    transform: true, transformOptions: { enableImplicitConversion: true },
  }));

  const allowedOrigins = [
    process.env.FRONTEND_URL ?? 'http://localhost:5173',
    'http://localhost:3000',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('LARASANA API')
    .setDescription(
      'Platform Digital Tenun Lombok\n\n' +
      '**Auth:** Register → Login → copy accessToken → Authorize → Bearer <token>',
    )
    .setVersion('2.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .addTag('auth',      'Register, Login, OTP, Reset Password')
    .addTag('users',     'Profil user')
    .addTag('orders',    'Riwayat order')
    .addTag('favorites', 'Produk favorit')
    .addTag('addresses', 'Alamat pengiriman')
    .addTag('shipping',  'Opsi kurir')
    .addTag('checkout',  'Checkout & Payment (Midtrans)')
    .addTag('admin',     'Panel admin')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.GATEWAY_PORT ?? 3000;
  await app.listen(port);
  console.log(`Swagger Docs : http://localhost:${port}/api/docs\n`);
}
bootstrap();
