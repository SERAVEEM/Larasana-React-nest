// src/shipping/shipping.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShippingMethod } from './entities/shipping-method.entity';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(ShippingMethod)
    private readonly shippingRepo: Repository<ShippingMethod>,
  ) {}

  async getAll(): Promise<ShippingMethod[]> {
    return this.shippingRepo.find({
      where: { isActive: true },
      order: { baseCost: 'ASC' },
    });
  }

  async findById(id: number): Promise<ShippingMethod> {
    const method = await this.shippingRepo.findOne({ where: { id, isActive: true } });
    if (!method) throw new NotFoundException('Metode pengiriman tidak ditemukan');
    return method;
  }
}
