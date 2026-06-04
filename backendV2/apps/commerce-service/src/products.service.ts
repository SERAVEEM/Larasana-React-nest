import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from '../../../libs/shared/src';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private productRepo: Repository<Product>) {}

  async findAll(query: { search?: string; page?: number; limit?: number }) {
    const { search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;
    const where = search ? { name: Like(`%${search}%`), isActive: true } : { isActive: true };

    const [data, total] = await this.productRepo.findAndCount({
      where, relations: ['images'], order: { createdAt: 'DESC' }, skip, take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(productId: number) {
    const product = await this.productRepo.findOne({
      where: { id: productId, isActive: true },
      relations: ['images', 'seller'],
    });
    if (!product) throw new NotFoundException('Produk tidak ditemukan');
    return product;
  }

  async create(data: any) {
    const product = new Product();
    product.name = data.name;
    product.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 7);
    product.description = data.description || null;
    product.price = Number(data.numericPrice || 0);
    product.stock = Number(data.stock || 0);
    product.sku = data.sku || null;
    product.sizes = data.sizes || null;
    product.qrCodeUrl = data.qrCode || null;
    product.sales = Number(data.sales || 0);
    product.category = data.category || null;
    product.thumbnailUrl = data.image || null;
    product.weaverName = data.weaverName || null;
    product.weaverBio = data.weaverBio || null;
    product.weaverImageUrl = data.weaverImageUrl || null;
    product.sellerId = 1; // Default Admin user

    if (data.image) {
      const img = {
        url: data.image,
        sortOrder: 0,
      } as any;
      product.images = [img];
    } else {
      product.images = [];
    }

    return this.productRepo.save(product);
  }

  async update(productId: number, data: any) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
      relations: ['images'],
    });
    if (!product) throw new NotFoundException('Produk tidak ditemukan');

    product.name = data.name;
    product.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 7);
    product.description = data.description || null;
    product.price = Number(data.numericPrice || 0);
    product.stock = Number(data.stock || 0);
    product.sku = data.sku || null;
    product.sizes = data.sizes || null;
    product.qrCodeUrl = data.qrCode || null;
    product.sales = Number(data.sales || 0);
    product.category = data.category || null;
    product.thumbnailUrl = data.image || null;
    product.weaverName = data.weaverName || null;
    product.weaverBio = data.weaverBio || null;
    product.weaverImageUrl = data.weaverImageUrl || null;

    if (data.image) {
      const img = {
        url: data.image,
        sortOrder: 0,
      } as any;
      product.images = [img];
    }

    return this.productRepo.save(product);
  }

  async delete(productId: number) {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Produk tidak ditemukan');
    await this.productRepo.softRemove(product);
    return { success: true };
  }
}
