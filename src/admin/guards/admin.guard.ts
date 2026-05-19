import {
  Injectable, CanActivate, ExecutionContext, ForbiddenException,
} from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user }: { user: User } = context.switchToHttp().getRequest();
    if (!user || user.role !== 'admin') {
      throw new ForbiddenException('Hanya admin yang bisa mengakses endpoint ini');
    }
    return true;
  }
}
