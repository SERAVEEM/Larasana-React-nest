import { ProductService } from '../services/ProductService';
import { OrderService } from '../services/OrderService';
import { CheckoutService } from '../services/CheckoutService';

export class ServiceContainer {
  private static readonly services = new Map<string, any>();

  static register(key: string, instance: any): void {
    this.services.set(key, instance);
  }

  static resolve<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) {
      throw new Error(`Service not found: ${key}`);
    }
    return service as T;
  }
}

// Instantiate and register default concrete implementations
ServiceContainer.register('ProductService', new ProductService());
ServiceContainer.register('OrderService', new OrderService());
ServiceContainer.register('CheckoutService', new CheckoutService());
