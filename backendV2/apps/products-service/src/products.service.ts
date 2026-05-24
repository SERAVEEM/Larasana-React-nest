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
}
