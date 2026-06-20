import { IDR_PER_USD } from '../../config/currency';

export class Product {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly price: string;
  readonly numericPrice: number;
  readonly description: string;
  readonly sku: string;
  readonly stock: number;
  readonly sizes: string[];
  readonly image: string;
  readonly images: string[];
  readonly averageRating: number;
  readonly qrCode?: string;
  readonly sales: number;
  readonly weaverName?: string;
  readonly weaverBio?: string;
  readonly weaverImageUrl?: string;

  constructor(data: {
    id: string;
    name: string;
    category?: string;
    numericPrice: number;
    description?: string;
    sku?: string;
    stock?: number;
    sizes?: string[];
    image?: string;
    images?: string[];
    averageRating?: number;
    qrCode?: string;
    sales?: number;
    weaverName?: string;
    weaverBio?: string;
    weaverImageUrl?: string;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.category = data.category || '';
    this.numericPrice = data.numericPrice;
    this.price = this.formatUSD(data.numericPrice);
    this.description = data.description || '';
    this.sku = data.sku || '';
    this.stock = Number(data.stock ?? 0);
    this.sizes = data.sizes || [];
    this.image = data.image || '';
    this.images = data.images || (data.image ? [data.image] : []);
    this.averageRating = data.averageRating ?? 5.0;
    this.qrCode = data.qrCode || '/images/product/authenticity_qr.png';
    this.sales = Number(data.sales ?? 0);
    this.weaverName = data.weaverName;
    this.weaverBio = data.weaverBio;
    this.weaverImageUrl = data.weaverImageUrl;
  }

  get isOutOfStock(): boolean {
    return this.stock <= 0;
  }

  get hasSizes(): boolean {
    return this.sizes.length > 0;
  }

  get weaverDisplayName(): string {
    return this.weaverName || 'Local Sasak Artisan';
  }

  get weaver(): { name: string; bio: string; image: string } {
    return {
      name: this.weaverName || 'Yulia Andirtia',
      bio: this.weaverBio || 'Crafted by Yulia Andirtia from the edge of Lombok, this vest carries fragments of ancestral memory through every woven thread. Inspired by volcanic landscapes, island folklore, and starlit nights, this piece reflects the harmony between timeless heritage and contemporary elegance.',
      image: this.weaverImageUrl || '/images/product/weaver_portrait.png'
    };
  }

  getFormattedPrice(currency: 'USD' | 'IDR'): string {
    if (currency === 'IDR') {
      const idrValue = this.numericPrice * IDR_PER_USD;
      return 'Rp ' + idrValue.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    return this.price;
  }

  private formatUSD(value: number): string {
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /**
   * Factory method to instantiate Product from raw backend DTO data.
   */
  static fromRaw(p: any): Product {
    const sizeParsed = p.sizes 
      ? (typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes)
      : [];
    const imageParsed = p.thumbnailUrl || (p.images && p.images[0]?.url) || '';

    const imageList = p.images && p.images.length > 0
      ? (typeof p.images[0] === 'string' ? p.images : p.images.map((img: any) => img.url))
      : [imageParsed || '/images/product/far left.png'];

    return new Product({
      id: p.id.toString(),
      name: p.name,
      category: p.category || '',
      numericPrice: Number(p.price || 0),
      description: p.description || '',
      sku: p.sku || '',
      stock: Number(p.stock ?? 0),
      sizes: sizeParsed,
      image: imageParsed,
      images: imageList,
      averageRating: p.averageRating ? Number(p.averageRating) : 5.0,
      qrCode: p.qrCodeUrl || undefined,
      sales: Number(p.sales || 0),
      weaverName: p.weaverName || '',
      weaverBio: p.weaverBio || '',
      weaverImageUrl: p.weaverImageUrl || ''
    });
  }
}
