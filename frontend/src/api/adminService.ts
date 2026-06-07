import { client } from './client';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  numericPrice: number;
  description: string;
  sku: string;
  stock: number;
  sizes: string[];
  image: string;
  qrCode?: string;
  sales: number;
  weaverName?: string;
  weaverBio?: string;
  weaverImageUrl?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  quantity: number;
  price: string;
  numericPrice: number;
}

export interface Order {
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
  amount: string;
  numericAmount: number;
  note?: string;
  items: OrderItem[];
}

export interface DashboardStats {
  users: { total: number; buyers: number; sellers: number };
  orders: { total: number; pending: number };
  products: { total: number };
  revenue: { total: number };
}

// Helper format function for currency
export const formatUSD = (value: number | string): string => {
  const num = Number(value);
  if (isNaN(num)) return '$0.00';
  return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const getDashboardStatsAsync = async (): Promise<DashboardStats> => {
  const response = await client.get('/admin/dashboard');
  return response.data;
};

export const getProductsAsync = async (): Promise<Product[]> => {
  const response = await client.get('/admin/products');
  const rawProducts = response.data.data || [];
  return rawProducts.map((p: any) => ({
    id: p.id.toString(),
    name: p.name,
    category: p.category || '',
    price: formatUSD(p.price),
    numericPrice: Number(p.price),
    description: p.description || '',
    sku: p.sku || '',
    stock: Number(p.stock),
    sizes: p.sizes ? (typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes) : [],
    image: p.thumbnailUrl || (p.images && p.images[0]?.url) || '',
    qrCode: p.qrCodeUrl || undefined,
    sales: Number(p.sales || 0),
    weaverName: p.weaverName || '',
    weaverBio: p.weaverBio || '',
    weaverImageUrl: p.weaverImageUrl || ''
  }));
};

export const getProductByIdAsync = async (id: string): Promise<Product | undefined> => {
  const numericId = parseInt(id.replace(/\D/g, ''));
  if (isNaN(numericId)) return undefined;
  const response = await client.get(`/products/${numericId}`);
  const p = response.data;
  if (!p) return undefined;
  return {
    id: p.id.toString(),
    name: p.name,
    category: p.category || '',
    price: formatUSD(p.price),
    numericPrice: Number(p.price),
    description: p.description || '',
    sku: p.sku || '',
    stock: Number(p.stock),
    sizes: p.sizes ? (typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes) : [],
    image: p.thumbnailUrl || (p.images && p.images[0]?.url) || '',
    qrCode: p.qrCodeUrl || undefined,
    sales: Number(p.sales || 0),
    weaverName: p.weaverName || '',
    weaverBio: p.weaverBio || '',
    weaverImageUrl: p.weaverImageUrl || ''
  };
};

export const saveProductAsync = async (product: Omit<Product, 'id' | 'price'> & { id?: string }): Promise<Product> => {
  const isEdit = !!product.id && !product.id.startsWith('p_') && !isNaN(Number(product.id));
  const payload = {
    name: product.name,
    category: product.category,
    description: product.description,
    sku: product.sku,
    stock: Number(product.stock),
    numericPrice: Number(product.numericPrice),
    sizes: product.sizes,
    image: product.image,
    qrCode: product.qrCode,
    sales: Number(product.sales || 0),
    weaverName: product.weaverName,
    weaverBio: product.weaverBio,
    weaverImageUrl: product.weaverImageUrl
  };

  let response;
  if (isEdit) {
    response = await client.put(`/admin/products/${product.id}`, payload);
  } else {
    response = await client.post('/admin/products', payload);
  }
  
  const p = response.data;
  return {
    id: p.id.toString(),
    name: p.name,
    category: p.category || '',
    price: formatUSD(p.price),
    numericPrice: Number(p.price),
    description: p.description || '',
    sku: p.sku || '',
    stock: Number(p.stock),
    sizes: p.sizes ? (typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes) : [],
    image: p.thumbnailUrl || (p.images && p.images[0]?.url) || '',
    qrCode: p.qrCodeUrl || undefined,
    sales: Number(p.sales || 0),
    weaverName: p.weaverName || '',
    weaverBio: p.weaverBio || '',
    weaverImageUrl: p.weaverImageUrl || ''
  };
};

export const deleteProductAsync = async (id: string): Promise<boolean> => {
  const numericId = parseInt(id);
  if (isNaN(numericId)) return false;
  await client.delete(`/admin/products/${numericId}`);
  return true;
};

export const getOrdersAsync = async (): Promise<Order[]> => {
  const response = await client.get('/admin/orders');
  const rawOrders = response.data.data || [];
  return rawOrders.map((o: any) => ({
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
    amount: formatUSD(o.totalAmount),
    numericAmount: Number(o.totalAmount),
    note: o.notes || undefined,
    items: (o.items || []).map((item: any) => ({
      productId: item.productId.toString(),
      name: item.product?.name || 'Noir Enchanted Vest',
      image: item.product?.thumbnailUrl || '/images/product/far left.png',
      quantity: Number(item.quantity),
      price: formatUSD(item.unitPrice),
      numericPrice: Number(item.unitPrice)
    }))
  }));
};

export const getOrderByIdAsync = async (id: string): Promise<Order | undefined> => {
  const numericId = parseInt(id.replace(/\D/g, ''));
  if (isNaN(numericId)) return undefined;
  const response = await client.get(`/admin/orders/${numericId}`);
  const { order, payment } = response.data;
  if (!order) return undefined;
  return {
    id: order.orderCode || `#${order.id}`,
    date: new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    customerName: order.buyer?.name || order.shippingName || 'Guest',
    customerEmail: order.buyer?.email || '',
    customerPhone: order.shippingPhone || '',
    shippingMethod: order.shippingMethod?.label || 'JNE Express',
    paymentMethod: payment?.paymentMethod || order.paymentMethod || 'Bank Transfer',
    address: order.shippingAddress,
    status: order.status === 'delivered' ? 'Delivered' : (order.status === 'cancelled' ? 'Canceled' : 'Pending'),
    amount: formatUSD(order.totalAmount),
    numericAmount: Number(order.totalAmount),
    note: order.notes || undefined,
    items: (order.items || []).map((item: any) => ({
      productId: item.productId.toString(),
      name: item.product?.name || 'Noir Enchanted Vest',
      image: item.product?.thumbnailUrl || '/images/product/far left.png',
      quantity: Number(item.quantity),
      price: formatUSD(item.unitPrice),
      numericPrice: Number(item.unitPrice)
    }))
  };
};

export const updateOrderStatusAsync = async (id: string, status: Order['status']): Promise<boolean> => {
  const numericId = parseInt(id.replace(/\D/g, ''));
  if (isNaN(numericId)) return false;
  const backendStatus = status === 'Delivered' ? 'delivered' : (status === 'Canceled' ? 'cancelled' : 'pending');
  await client.patch(`/admin/orders/${numericId}/status`, { status: backendStatus });
  return true;
};
