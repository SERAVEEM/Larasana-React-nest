import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { UsersAppModule } from './app.module';
import { DataSource } from 'typeorm';



async function bootstrap() {
  const app = await NestFactory.create(UsersAppModule);

  try {
    const ds = app.get(DataSource);
    await ds.query(`
      UPDATE users 
      SET password_hash = '$2a$12$OOA8cO8aoKAuAS.Q8CGwweTxgxNBfQ5vTyJxcosgldZ9qL8AQ96d2' 
      WHERE id = 1 AND password_hash = '$2b$12$KIXq3G1eG0uvGj.fz3o5fO7J9BQZS5Bl7ZqkbGkCpV7XcA1QbV9m'
    `);
    console.log('✅ Admin password hash verified/updated.');
  } catch (err) {
    console.error('⚠️ Failed to update admin hash:', err);
  }
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port: Number(process.env.USERS_SERVICE_PORT ?? 3001) },
  });

  await app.startAllMicroservices();
  
  const port = process.env.USERS_SERVICE_HTTP_PORT || 4001;
  await app.listen(port, '0.0.0.0');
  console.log(`👤 users-service running (TCP :3001, HTTP :${port})`);
}
bootstrap();
