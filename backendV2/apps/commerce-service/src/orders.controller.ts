import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { ORDERS_PATTERNS } from '../../../libs/shared/src';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern(ORDERS_PATTERNS.GET_MY_ORDERS)
  getMyOrders(@Payload() data: { userId: number; status?: string; search?: string; page?: number; limit?: number }) {
    return this.ordersService.getMyOrders(data);
  }

  @MessagePattern(ORDERS_PATTERNS.GET_DETAIL)
  getDetail(@Payload() data: { userId: number; orderId: number }) {
    return this.ordersService.getOrderDetail(data.userId, data.orderId);
  }

  @MessagePattern(ORDERS_PATTERNS.CANCEL)
  cancel(@Payload() data: { userId: number; orderId: number; reason?: string }) {
    return this.ordersService.cancelOrder(data.userId, data.orderId, data.reason);
  }
}
