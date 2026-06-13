export class Address {
  readonly id: string;
  readonly label: string;
  readonly name: string;
  readonly street: string;
  readonly district: string;
  readonly city: string;
  readonly province: string;
  readonly postalCode: string;
  readonly country: string;
  readonly phone: string;

  constructor(data: {
    id: string;
    label: string;
    name: string;
    street: string;
    district: string;
    city: string;
    province: string;
    postalCode: string;
    country?: string;
    phone: string;
  }) {
    this.id = data.id;
    this.label = data.label;
    this.name = data.name;
    this.street = data.street;
    this.district = data.district || '-';
    this.city = data.city || '-';
    this.province = data.province || '-';
    this.postalCode = data.postalCode || '00000';
    this.country = data.country || 'ID';
    this.phone = data.phone;
  }

  get isIndonesian(): boolean {
    return this.country === 'ID';
  }

  get formattedRecipient(): string {
    return `${this.name} (${this.phone})`;
  }

  get fullAddressSummary(): string {
    return `${this.street}, ${this.district}, ${this.city}, ${this.province}, ${this.postalCode}, ${this.country}`;
  }

  isValidPhone(): boolean {
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
    return phoneRegex.test(this.phone);
  }

  isValidStreetAddress(): boolean {
    return this.street.trim().length >= 10;
  }

  static fromRaw(addr: any): Address {
    return new Address({
      id: String(addr.id),
      label: addr.label,
      name: addr.recipientName,
      street: addr.fullAddress,
      district: addr.district,
      city: addr.city,
      province: addr.province,
      postalCode: addr.postalCode,
      country: addr.country || 'ID',
      phone: addr.phone
    });
  }
}
