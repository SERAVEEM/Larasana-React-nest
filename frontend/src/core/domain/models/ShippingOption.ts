export class ShippingOption {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly eta: string;
  readonly logo: string;

  constructor(data: {
    id: string;
    name: string;
    price: number;
    eta: string;
    logo: string;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.price = data.price;
    this.eta = data.eta;
    this.logo = data.logo;
  }

  getFormattedPrice(currency: 'USD' | 'IDR'): string {
    if (currency === 'IDR') {
      const idrValue = this.price * 15000;
      return 'Rp ' + idrValue.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    return '$' + this.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  static fromRaw(ship: any): ShippingOption {
    return new ShippingOption({
      id: String(ship.id),
      name: ship.label,
      price: Number(ship.baseCost),
      eta: ship.estimatedDays,
      logo: ship.courier.toUpperCase()
    });
  }
}
