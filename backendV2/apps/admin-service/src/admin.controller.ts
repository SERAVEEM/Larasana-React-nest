import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AdminService } from './admin.service';
import { ADMIN_PATTERNS } from '../../../libs/shared/src';

@Controller()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @MessagePattern(ADMIN_PATTERNS.DASHBOARD)
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @MessagePattern(ADMIN_PATTERNS.GET_USERS)
  getUsers(@Payload() query: any) {
    return this.adminService.getAllUsers(query);
  }

  @MessagePattern(ADMIN_PATTERNS.GET_USER_DETAIL)
  getUserDetail(@Payload() data: { userId: number }) {
    return this.adminService.getUserDetail(data.userId);
  }

  @MessagePattern(ADMIN_PATTERNS.TOGGLE_USER)
  toggleUser(
    @Payload()
    data: { userId: number; isActive: boolean },
  ) {
    return this.adminService.toggleUserActive(
      data.userId,
      data.isActive,
    );
  }

  @MessagePattern(ADMIN_PATTERNS.GET_SELLERS)
  getSellers(@Payload() query: any) {
    return this.adminService.getSellerApplications(query);
  }

  @MessagePattern(ADMIN_PATTERNS.REVIEW_SELLER)
  reviewSeller(
    @Payload()
    data: {
      userId: number;
      decision: string;
      reason?: string;
      adminId: number;
    },
  ) {
    return this.adminService.reviewSeller(
      data.userId,
      data.decision as any,
      data.reason,
      data.adminId,
    );
  }

  @MessagePattern(ADMIN_PATTERNS.GET_ORDERS)
  getOrders(@Payload() query: any) {
    return this.adminService.getAllOrders(query);
  }

  @MessagePattern(ADMIN_PATTERNS.GET_ORDER_DETAIL)
  getOrderDetail(@Payload() data: { orderId: number }) {
    return this.adminService.getOrderDetail(data.orderId);
  }

  @MessagePattern(ADMIN_PATTERNS.UPDATE_ORDER_STATUS)
  updateOrderStatus(
    @Payload()
    data: {
      orderId: number;
      status: string;
      adminId: number;
    },
  ) {
    return this.adminService.updateOrderStatus(
      data.orderId,
      data.status,
      data.adminId,
    );
  }

  @MessagePattern(ADMIN_PATTERNS.GET_PRODUCTS)
  getProducts(@Payload() query: any) {
    return this.adminService.getAllProducts(
      query.search,
      query.page,
      query.limit,
    );
  }

  @MessagePattern(ADMIN_PATTERNS.TOGGLE_PRODUCT)
  toggleProduct(
    @Payload()
    data: { productId: number; isActive: boolean },
  ) {
    return this.adminService.toggleProductActive(
      data.productId,
      data.isActive,
    );
  }
}