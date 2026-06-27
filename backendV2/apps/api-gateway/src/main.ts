import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { GatewayAppModule } from './app.module';
import { RpcExceptionFilter } from './common/rpc-exception.filter';
import { TimeoutInterceptor } from './common/timeout.interceptor';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(GatewayAppModule);

  app.use(helmet());
  app.setGlobalPrefix('api/v1');

  app.useGlobalFilters(new RpcExceptionFilter());
  app.useGlobalInterceptors(new TimeoutInterceptor());

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
      const isAllowed = allowedOrigins.includes(origin) || /^https:\/\/larasana-[a-zA-Z0-9-]+\.vercel\.app$/.test(origin);
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // Client secret key validation middleware
  app.use((req: any, res: any, next: any) => {
    // Allow OPTIONS requests (CORS preflight checks)
    if (req.method === 'OPTIONS') {
      return next();
    }

    //  Allow Swagger API Documentation
    if (req.path === '/api/docs' || req.path.startsWith('/api/docs/')) {
      return next();
    }

    //  Allow Midtrans Webhook notifications
    if (req.path.includes('/checkout/webhook/midtrans')) {
      return next();
    }

    //  Validate Client Secret Key
    const expectedKey = process.env.FRONTEND_CLIENT_SECRET;
    if (!expectedKey) {
      // If not configured in the environment, skip the check
      return next();
    }

    const clientKey = req.headers['x-larasana-client-key'];
    if (clientKey !== expectedKey) {
      return res.status(403).json({
        statusCode: 403,
        message: 'Forbidden: Invalid or missing API Client Key',
      });
    }

    next();
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

  const port = process.env.PORT || process.env.GATEWAY_PORT || 3000;
  await app.listen(port);
  console.log(`Swagger Docs : http://localhost:${port}/api/docs\n`);
}
bootstrap();
