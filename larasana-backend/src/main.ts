import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('LARASANA API')
    .setDescription(
      'Platform Digital Terpadu untuk memasarkan Kain Tenun Lombok.\n\n' +
      '**Cara pakai JWT:**\n' +
      '1. Register atau Login\n' +
      '2. Copy `accessToken` dari response\n' +
      '3. Klik tombol **Authorize** di kanan atas\n' +
      '4. Isi: `Bearer <accessToken>`',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'access-token',
    )
    .addTag('auth',      'Register, Login, Refresh Token, OTP, Reset Password')
    .addTag('users',     'Profil user yang sedang login')
    .addTag('orders',    'Riwayat order buyer')
    .addTag('favorites', 'Produk favorit buyer')
    .addTag('addresses', 'Alamat pengiriman buyer')
    .addTag('shipping',  'Opsi kurir pengiriman')
    .addTag('checkout',  'Proses checkout & payment')
    .addTag('admin',     'Panel admin — hanya role admin')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Swagger Docs : http://localhost:${port}/api/docs\n`);
}
bootstrap();
