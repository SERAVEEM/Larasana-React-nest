import { ShippingService } from './shipping.service';
import { NotFoundException } from '@nestjs/common';
import { RajaOngkirProvider } from './shipping/providers/rajaongkir.provider';
import { EasyPostProvider } from './shipping/providers/easypost.provider';
import { BiteshipProvider } from './shipping/providers/biteship.provider';

// Helper: build a service with mock repos — the static fallback paths never touch the DB
function makeService(mockRepo: Partial<{ findOne: jest.Mock }> = {}): ShippingService {
  const shippingRepo = { findOne: jest.fn().mockResolvedValue(null), ...mockRepo } as any;
  const addressRepo = {} as any;
  const rajaOngkirProvider = { fetchRates: jest.fn().mockResolvedValue([]), getCities: jest.fn().mockResolvedValue([]) } as any;
  const easyPostProvider = { fetchRates: jest.fn().mockResolvedValue([]) } as any;
  const biteshipProvider = { fetchRates: jest.fn().mockResolvedValue([]) } as any;
  return new ShippingService(shippingRepo, addressRepo, rajaOngkirProvider, easyPostProvider, biteshipProvider);
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

describe('ShippingService strategy provider delegation', () => {
  let service: ShippingService;
  let mockRajaOngkir: any;
  let mockEasyPost: any;
  let mockBiteship: any;
  let mockAddressRepo: any;

  beforeEach(() => {
    mockRajaOngkir = { fetchRates: jest.fn().mockResolvedValue([]), getCities: jest.fn().mockResolvedValue([]) };
    mockEasyPost = { fetchRates: jest.fn().mockResolvedValue([]) };
    mockBiteship = { fetchRates: jest.fn().mockResolvedValue([]) };
    mockAddressRepo = { findOne: jest.fn() };
    const mockShippingRepo = { findOne: jest.fn() } as any;
    service = new ShippingService(mockShippingRepo, mockAddressRepo, mockRajaOngkir, mockEasyPost, mockBiteship);
  });

  it('delegates getCities to RajaOngkirProvider', async () => {
    const mockCities = [{ city_id: '1', city_name: 'Test City' }];
    mockRajaOngkir.getCities.mockResolvedValue(mockCities);
    const result = await service.getCities();
    expect(mockRajaOngkir.getCities).toHaveBeenCalled();
    expect(result).toBe(mockCities);
  });

  it('delegates to BiteshipProvider first if addressId and Biteship API key are configured', async () => {
    process.env.BITESHIP_API_KEY = 'test-biteship-key';
    const mockAddress = { id: 1, country: 'ID', city: 'Mataram' } as any;
    mockAddressRepo.findOne.mockResolvedValue(mockAddress);
    const mockRates = [{ id: 5001, courier: 'JNE', service: 'REG', label: 'JNE Reg', baseCost: 1.0, estimatedDays: '1-2', isActive: true }];
    mockBiteship.fetchRates.mockResolvedValue(mockRates);

    const result = await service.getAll({ addressId: 1 });
    expect(mockBiteship.fetchRates).toHaveBeenCalledWith(mockAddress);
    expect(result).toEqual(mockRates);
    delete process.env.BITESHIP_API_KEY;
  });

  it('delegates to RajaOngkirProvider if country is ID, Biteship is not configured, and RajaOngkir API key is present', async () => {
    process.env.RAJAONGKIR_API_KEY = 'test-rajaongkir-key';
    const mockAddress = { id: 1, country: 'ID', city: 'Mataram' } as any;
    mockAddressRepo.findOne.mockResolvedValue(mockAddress);
    const mockRates = [{ id: 3001, courier: 'POS', service: 'KILAT', label: 'POS Kilat', baseCost: 1.2, estimatedDays: '3', isActive: true }];
    mockRajaOngkir.fetchRates.mockResolvedValue(mockRates);

    const result = await service.getAll({ addressId: 1 });
    expect(mockRajaOngkir.fetchRates).toHaveBeenCalledWith(mockAddress);
    expect(result).toEqual(mockRates);
    delete process.env.RAJAONGKIR_API_KEY;
  });

  it('delegates to EasyPostProvider for international addresses if EasyPost API key is present', async () => {
    process.env.EASYPOST_API_KEY = 'test-easypost-key';
    const mockAddress = { id: 2, country: 'US', city: 'New York' } as any;
    mockAddressRepo.findOne.mockResolvedValue(mockAddress);
    const mockRates = [{ id: 2001, courier: 'USPS', service: 'PRIORITY', label: 'USPS Priority', baseCost: 15.0, estimatedDays: '3', isActive: true }];
    mockEasyPost.fetchRates.mockResolvedValue(mockRates);

    const result = await service.getAll({ addressId: 2 });
    expect(mockEasyPost.fetchRates).toHaveBeenCalledWith(mockAddress);
    expect(result).toEqual(mockRates);
    delete process.env.EASYPOST_API_KEY;
  });
});

