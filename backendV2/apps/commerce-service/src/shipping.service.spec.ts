import { ShippingService } from './shipping.service';
import { NotFoundException } from '@nestjs/common';

// Helper: build a service with mock repos — the static fallback paths never touch the DB
function makeService(mockRepo: Partial<{ findOne: jest.Mock }> = {}): ShippingService {
  const shippingRepo = { findOne: jest.fn().mockResolvedValue(null), ...mockRepo } as any;
  const addressRepo = {} as any;
  return new ShippingService(shippingRepo, addressRepo);
}

describe('ShippingService.findById — static international fallback range (101-103)', () => {
  let service: ShippingService;

  beforeEach(() => {
    service = makeService();
  });

  it('returns DHL for id 101', async () => {
    const result = await service.findById(101);
    expect(result.courier).toBe('DHL');
    expect(result.id).toBe(101);
  });

  it('returns FEDEX for id 102', async () => {
    const result = await service.findById(102);
    expect(result.courier).toBe('FEDEX');
    expect(result.id).toBe(102);
  });

  it('returns EMS for id 103', async () => {
    const result = await service.findById(103);
    expect(result.courier).toBe('EMS');
    expect(result.id).toBe(103);
  });
});

describe('ShippingService.findById — static domestic fallback range (401-404)', () => {
  let service: ShippingService;

  beforeEach(() => {
    service = makeService();
  });

  it('returns JNE REG for id 401', async () => {
    const result = await service.findById(401);
    expect(result.courier).toBe('JNE');
    expect(result.service).toBe('REG');
  });

  it('returns POS KILAT for id 402', async () => {
    const result = await service.findById(402);
    expect(result.courier).toBe('POS');
  });

  it('returns TIKI REG for id 403', async () => {
    const result = await service.findById(403);
    expect(result.courier).toBe('TIKI');
  });

  it('returns JNE YES for id 404', async () => {
    const result = await service.findById(404);
    expect(result.service).toBe('YES');
  });
});

describe('ShippingService.findById — NotFoundException for unknown DB id', () => {
  it('throws NotFoundException when DB has no matching row', async () => {
    // id=1 falls through all static ranges straight to DB lookup
    const service = makeService({ findOne: jest.fn().mockResolvedValue(null) });
    await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    await expect(service.findById(1)).rejects.toThrow('Metode pengiriman tidak ditemukan');
  });

  it('returns the DB row when found', async () => {
    const dbRow = { id: 5, courier: 'JNE', service: 'REG', isActive: true };
    const service = makeService({ findOne: jest.fn().mockResolvedValue(dbRow) });
    const result = await service.findById(5);
    expect(result).toEqual(dbRow);
  });
});
