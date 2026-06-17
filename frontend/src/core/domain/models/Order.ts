export class OrderItem {
  readonly productId: string;
  readonly name: string;
  readonly image: string;
  readonly quantity: number;
  readonly price: string;
  readonly numericPrice: number;

  constructor(data: {
    productId: string;
    name: string;
    image: string;
    quantity: number;
    numericPrice: number;
  }) {
    this.productId = data.productId;
    this.name = data.name;
    this.image = data.image;
    this.quantity = data.quantity;
    this.numericPrice = data.numericPrice;
    this.price = this.formatUSD(data.numericPrice);
  }

  getFormattedPrice(currency: 'USD' | 'IDR'): string {
    if (currency === 'IDR') {
      const idrValue = this.numericPrice * 15000;
      return 'Rp ' + idrValue.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    return this.price;
  }

  private formatUSD(value: number): string {
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  static fromRaw(item: any): OrderItem {
    return new OrderItem({
      productId: item.productId.toString(),
      name: item.product?.name || 'Noir Enchanted Vest',
      image: item.product?.thumbnailUrl || '/images/product/far left.png',
      quantity: Number(item.quantity),
      numericPrice: Number(item.unitPrice || 0)
    });
  }
}

export class Order {
  readonly id: string;
  readonly date: string;
  readonly createdAt?: string;
  readonly customerName: string;
  readonly customerEmail: string;
  readonly customerPhone: string;
  readonly customerAvatar?: string;
  readonly shippingMethod: string;
  readonly paymentMethod: string;
  readonly address: string;
  readonly status: 'Delivered' | 'Canceled' | 'Pending';
  readonly amount: string;
  readonly numericAmount: number;
  readonly note?: string;
  readonly items: OrderItem[];

  constructor(data: {
    id: string;
    date: string;
    createdAt?: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAvatar?: string;
    shippingMethod: string;
    paymentMethod: string;
    address: string;
    status: 'Delivered' | 'Canceled' | 'Pending';
    numericAmount: number;
    note?: string;
    items?: OrderItem[];
  }) {
    this.id = data.id;
    this.date = data.date;
    this.createdAt = data.createdAt;
    this.customerName = data.customerName;
    this.customerEmail = data.customerEmail;
    this.customerPhone = data.customerPhone;
    this.customerAvatar = data.customerAvatar;
    this.shippingMethod = data.shippingMethod;
    this.paymentMethod = data.paymentMethod;
    this.address = data.address;
    this.status = data.status;
    this.numericAmount = data.numericAmount;
    this.amount = this.formatUSD(data.numericAmount);
    this.note = data.note;
    this.items = data.items || [];
  }

  get isPending(): boolean {
    return this.status === 'Pending';
  }

  get isDelivered(): boolean {
    return this.status === 'Delivered';
  }

  get isCanceled(): boolean {
    return this.status === 'Canceled';
  }

  getFormattedAmount(currency: 'USD' | 'IDR'): string {
    if (currency === 'IDR') {
      const idrValue = this.numericAmount * 18000;
      return 'Rp ' + idrValue.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    return this.amount;
  }

  private formatUSD(value: number): string {
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  static fromRaw(o: any): Order {
    const rawItems = o.items || [];
    const items = rawItems.map((item: any) => OrderItem.fromRaw(item));

    return new Order({
      id: o.orderCode || `#${o.id}`,
      date: new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      createdAt: o.createdAt,
      customerName: o.buyer?.name || o.shippingName || 'Guest',
      customerEmail: o.buyer?.email || '',
      customerPhone: o.shippingPhone || '',
      shippingMethod: o.shippingMethod?.label || 'JNE Express',
      paymentMethod: o.paymentMethod || 'Bank Transfer',
      address: o.shippingAddress,
      status: o.status === 'delivered' ? 'Delivered' : (o.status === 'cancelled' ? 'Canceled' : 'Pending'),
      numericAmount: Number(o.totalAmount || 0),
      note: o.notes || undefined,
      items: items
    });
  }
}
