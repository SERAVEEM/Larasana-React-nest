import { BaseService } from './BaseService';
import { Order } from '../domain/models/Order';
import type { DashboardStats } from '../../api/adminService'; 

export class OrderService extends BaseService {
  async getOrders(): Promise<Order[]> {
    const response = await this.get<{ data: any[] }>('/admin/orders');
    const rawOrders = response.data || [];
    return rawOrders.map((o) => Order.fromRaw(o));
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const numericId = parseInt(id.replace(/\D/g, ''));
    if (isNaN(numericId)) return undefined;
    const response = await this.get<any>(`/admin/orders/${numericId}`);
    const { order, payment } = response;
    if (!order) return undefined;
    
    // Merge backend fields into the format expected by Order.fromRaw
    const fullOrderData = {
      ...order,
      paymentMethod: payment?.paymentMethod || order.paymentMethod
    };
    return Order.fromRaw(fullOrderData);
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<boolean> {
    const numericId = parseInt(id.replace(/\D/g, ''));
    if (isNaN(numericId)) return false;
    const backendStatus = status === 'Delivered' ? 'delivered' : (status === 'Canceled' ? 'cancelled' : 'pending');
    await this.patch<any>(`/admin/orders/${numericId}/status`, { status: backendStatus });
    return true;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    return this.get<DashboardStats>('/admin/dashboard');
  }
}
