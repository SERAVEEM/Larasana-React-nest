import { describe, it, expect } from 'vitest';
import { Address } from './Address';

// Helper to build a minimal valid Address
const makeAddress = (overrides: Partial<ConstructorParameters<typeof Address>[0]> = {}) =>
  new Address({
    id: '1',
    label: 'Home',
    name: 'Test User',
    street: 'Jl. Raya Senggigi No. 12',
    district: 'Batu Layar',
    city: 'Lombok Barat',
    province: 'Nusa Tenggara Barat',
    postalCode: '83355',
    phone: '081234567890',
    ...overrides,
  });

describe('Address.isValidPhone', () => {
  it('accepts a valid number starting with 08', () => {
    expect(makeAddress({ phone: '081234567890' }).isValidPhone()).toBe(true);
  });

  it('accepts a number starting with +62', () => {
    expect(makeAddress({ phone: '+6281234567890' }).isValidPhone()).toBe(true);
  });

  it('accepts a number starting with 62', () => {
    expect(makeAddress({ phone: '6281234567890' }).isValidPhone()).toBe(true);
  });

  it('rejects a number that does not start with a valid prefix', () => {
    expect(makeAddress({ phone: '12345678901' }).isValidPhone()).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(makeAddress({ phone: '' }).isValidPhone()).toBe(false);
  });

  it('rejects a landline-style number without 8 after prefix', () => {
    expect(makeAddress({ phone: '021234567' }).isValidPhone()).toBe(false);
  });
});

describe('Address.isValidStreetAddress', () => {
  it('accepts a street address of 10+ characters', () => {
    expect(makeAddress({ street: 'Jl. Test No. 123' }).isValidStreetAddress()).toBe(true);
  });

  it('accepts a street address of exactly 10 characters', () => {
    expect(makeAddress({ street: '1234567890' }).isValidStreetAddress()).toBe(true);
  });

  it('rejects a street address under 10 characters', () => {
    expect(makeAddress({ street: 'short' }).isValidStreetAddress()).toBe(false);
  });

  it('rejects a whitespace-padded short address', () => {
    expect(makeAddress({ street: '   abc   ' }).isValidStreetAddress()).toBe(false);
  });
});

describe('Address computed properties', () => {
  it('defaults country to ID when not provided', () => {
    expect(makeAddress().country).toBe('ID');
  });

  it('isIndonesian is true for ID country', () => {
    expect(makeAddress().isIndonesian).toBe(true);
  });

  it('isIndonesian is false for non-ID country', () => {
    expect(makeAddress({ country: 'US' }).isIndonesian).toBe(false);
  });
});
