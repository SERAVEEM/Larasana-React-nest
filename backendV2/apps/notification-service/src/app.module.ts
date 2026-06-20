import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { HealthModule } from './health/health.module';

@Module({
  imports: [HealthModule],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationAppModule {}
