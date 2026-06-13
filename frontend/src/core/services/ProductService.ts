import { BaseService } from './BaseService';
import { Product } from '../domain/models/Product';

export class ProductService extends BaseService {
  async getProducts(): Promise<Product[]> {
    const response = await this.get<{ data: any[] }>('/admin/products');
    const rawProducts = response.data || [];
    return rawProducts.map((p) => Product.fromRaw(p));
  }

  async getPublicProducts(): Promise<Product[]> {
    const response = await this.get<{ data: any[] }>('/products');
    const rawProducts = response.data || [];
    return rawProducts.map((p) => Product.fromRaw(p));
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const numericId = parseInt(id.replace(/\D/g, ''));
    if (isNaN(numericId)) return undefined;
    const rawProduct = await this.get<any>(`/products/${numericId}`);
    if (!rawProduct) return undefined;
    return Product.fromRaw(rawProduct);
  }

  async saveProduct(product: Omit<Product, 'id' | 'price' | 'isOutOfStock' | 'hasSizes' | 'weaverDisplayName' | 'getFormattedPrice' | 'images' | 'weaver'> & { id?: string }): Promise<Product> {
    const isEdit = !!product.id && !product.id.startsWith('p_') && !isNaN(Number(product.id));
    const payload = {
      name: product.name,
      category: product.category,
      description: product.description,
      sku: product.sku,
      stock: Number(product.stock),
      numericPrice: Number(product.numericPrice),
      sizes: product.sizes,
      image: product.image,
      qrCode: product.qrCode,
      sales: Number(product.sales || 0),
      weaverName: product.weaverName,
      weaverBio: product.weaverBio,
      weaverImageUrl: product.weaverImageUrl
    };

    let p: any;
    if (isEdit) {
      p = await this.put<any>(`/admin/products/${product.id}`, payload);
    } else {
      p = await this.post<any>('/admin/products', payload);
    }

    return Product.fromRaw(p);
  }

  async deleteProduct(id: string): Promise<boolean> {
    const numericId = parseInt(id);
    if (isNaN(numericId)) return false;
    await this.delete<any>(`/admin/products/${numericId}`);
    return true;
  }

  async getFavorites(): Promise<any[]> {
    const response = await this.get<{ data: any[] }>('/favorites');
    return response.data || [];
  }

  async checkFavoriteStatus(productId: string): Promise<boolean> {
    const numericId = productId.replace(/\D/g, '');
    if (!numericId) return false;
    const res = await this.get<{ isFavorited: boolean }>(`/favorites/check/${numericId}`);
    return !!res?.isFavorited;
  }

  async toggleFavorite(productId: string, shouldFavorite: boolean): Promise<void> {
    const numericId = productId.replace(/\D/g, '');
    if (!numericId) return;
    if (shouldFavorite) {
      await this.post(`/favorites/${numericId}`);
    } else {
      await this.delete(`/favorites/${numericId}`);
    }
  }
}
