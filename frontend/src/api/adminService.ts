import { ServiceContainer } from '../core/di/ServiceContainer';
import { ProductService } from '../core/services/ProductService';
import { OrderService } from '../core/services/OrderService';

export { Product } from '../core/domain/models/Product';
export { Order, OrderItem } from '../core/domain/models/Order';

export interface DashboardStats {
  users: { total: number; buyers: number; sellers: number; change?: string };
  orders: { total: number; pending: number; change?: string };
  products: { total: number; change?: string };
  revenue: { total: number; change?: string };
}

// Helper format function for currency
export const formatUSD = (value: number | string): string => {
  const num = Number(value);
  if (isNaN(num)) return '$0.00';
  return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const getDashboardStatsAsync = async (): Promise<DashboardStats> => {
  return ServiceContainer.resolve<OrderService>('OrderService').getDashboardStats();
};

export const getProductsAsync = async (): Promise<any[]> => {
  return ServiceContainer.resolve<ProductService>('ProductService').getProducts();
};

export const getProductByIdAsync = async (id: string): Promise<any> => {
  return ServiceContainer.resolve<ProductService>('ProductService').getProductById(id);
};

export const saveProductAsync = async (product: any): Promise<any> => {
  return ServiceContainer.resolve<ProductService>('ProductService').saveProduct(product);
};

export const deleteProductAsync = async (id: string): Promise<boolean> => {
  return ServiceContainer.resolve<ProductService>('ProductService').deleteProduct(id);
};

export const getOrdersAsync = async (): Promise<any[]> => {
  return ServiceContainer.resolve<OrderService>('OrderService').getOrders();
};

export const getOrderByIdAsync = async (id: string): Promise<any> => {
  return ServiceContainer.resolve<OrderService>('OrderService').getOrderById(id);
};

export const updateOrderStatusAsync = async (id: string, status: any): Promise<boolean> => {
  return ServiceContainer.resolve<OrderService>('OrderService').updateOrderStatus(id, status);
};
