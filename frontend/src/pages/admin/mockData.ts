import firstImg from '../../assets/images/product/far left.png';
import secondImg from '../../assets/images/product/left.png';
import thirdImg from '../../assets/images/product/MID.png';
import fourthImg from '../../assets/images/product/right.png';
import fifthImg from '../../assets/images/product/far right.png';
import qrImg from '../../assets/images/product/authenticity_qr.png';

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

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Noir Enchanted Vest',
    category: 'Authentic Handmade',
    price: 'IDR 1.700.000',
    numericPrice: 1700000,
    description: "Noir Enchanted Vest by Yulia Andirtia is inspired by Lombok's culture, folklore, and starlit nights. Luminous embroidery symbolizes strength, elegance, and the blend of heritage with modern style. More than a garment, it carries the soul and story of Lombok into today's world.",
    sku: '#32A53',
    stock: 1269,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    image: firstImg,
    qrCode: qrImg,
    sales: 1269
  },
  {
    id: 'p2',
    name: 'Anchronic Vest',
    category: 'Modern Fit',
    price: 'IDR 1.200.000',
    numericPrice: 1200000,
    description: 'A striking fusion of traditional Lombok weave and structured contemporary silhouettes. The Anchronic Vest is built to stand out with comfort and architectural details.',
    sku: '#32A54',
    stock: 890,
    sizes: ['M', 'L', 'XL'],
    image: secondImg,
    qrCode: qrImg,
    sales: 852
  },
  {
    id: 'p3',
    name: 'Larasana Signature',
    category: 'Exclusive Collection',
    price: 'IDR 2.400.000',
    numericPrice: 2400000,
    description: 'The pinnacle of Larasana craft. Handwoven over three months by master artisans, combining traditional golden threadwork with premium organic cotton panels.',
    sku: '#32A55',
    stock: 24,
    sizes: ['S', 'M', 'L'],
    image: thirdImg,
    qrCode: qrImg,
    sales: 45
  },
  {
    id: 'p4',
    name: 'Tenun Classic Vest',
    category: 'Traditional Craft',
    price: 'IDR 950.000',
    numericPrice: 950000,
    description: 'An elegant day-wear vest made using heritage techniques. Perfect for layering and bringing a piece of genuine culture to your everyday outfits.',
    sku: '#32A56',
    stock: 450,
    sizes: ['S', 'M', 'L', 'XL'],
    image: fourthImg,
    qrCode: qrImg,
    sales: 320
  },
  {
    id: 'p5',
    name: 'Heritage Indigo Coat',
    category: 'Premium Outerwear',
    price: 'IDR 3.100.000',
    numericPrice: 3100000,
    description: 'Dyed naturally with organic indigo plants in East Lombok, this longline coat has dynamic shades of blue and intricate symbols representing water and longevity.',
    sku: '#32A57',
    stock: 12,
    sizes: ['M', 'L', 'XL', 'XXL'],
    image: fifthImg,
    qrCode: qrImg,
    sales: 18
  }
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: '#25426',
    date: 'Jan 8th,2022',
    customerName: 'Leo Gouse',
    customerEmail: 'leogouse@gmail.com',
    customerPhone: '+62878907710150',
    shippingMethod: 'JNE Express',
    paymentMethod: 'Master Card',
    address: 'Kemanggisan, Jakarta Barat 85342 2345, JAKARTA. Block 9A',
    status: 'Delivered',
    amount: 'IDR 700.000',
    numericAmount: 700000,
    note: 'Pastikan batiknya original',
    items: [
      {
        productId: 'p1',
        name: 'Noir Enchanted Vest',
        image: firstImg,
        quantity: 1,
        price: 'IDR 700.000',
        numericPrice: 700000
      }
    ]
  },
  {
    id: '#25427',
    date: 'Jan 8th,2022',
    customerName: 'Leo Gouse',
    customerEmail: 'leogouse@gmail.com',
    customerPhone: '+62878907710150',
    shippingMethod: 'JNE Express',
    paymentMethod: 'Master Card',
    address: 'Kemanggisan, Jakarta Barat 85342 2345, JAKARTA. Block 9A',
    status: 'Canceled',
    amount: 'IDR 700.000',
    numericAmount: 700000,
    items: [
      {
        productId: 'p1',
        name: 'Noir Enchanted Vest',
        image: firstImg,
        quantity: 1,
        price: 'IDR 700.000',
        numericPrice: 700000
      }
    ]
  },
  {
    id: '#25428',
    date: 'Jan 9th,2022',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.j@gmail.com',
    customerPhone: '+6281234567890',
    shippingMethod: 'DHL International',
    paymentMethod: 'PayPal',
    address: 'Sunset Boulevard 405, Los Angeles, CA 90028, USA',
    status: 'Delivered',
    amount: 'IDR 2.400.000',
    numericAmount: 2400000,
    note: 'Please pack in the custom wooden box wrapper.',
    items: [
      {
        productId: 'p3',
        name: 'Larasana Signature',
        image: thirdImg,
        quantity: 1,
        price: 'IDR 2.400.000',
        numericPrice: 2400000
      }
    ]
  },
  {
    id: '#25429',
    date: 'Jan 10th,2022',
    customerName: 'Ahmad Subarjo',
    customerEmail: 'ahmad.subarjo@yahoo.com',
    customerPhone: '+628556677889',
    shippingMethod: 'Tiki Express',
    paymentMethod: 'Bank Transfer',
    address: 'Jl. Sudirman No. 21, Kebayoran Baru, Jakarta Selatan, 12190',
    status: 'Delivered',
    amount: 'IDR 1.200.000',
    numericAmount: 1200000,
    items: [
      {
        productId: 'p2',
        name: 'Anchronic Vest',
        image: secondImg,
        quantity: 1,
        price: 'IDR 1.200.000',
        numericPrice: 1200000
      }
    ]
  },
  {
    id: '#25430',
    date: 'Jan 12th,2022',
    customerName: 'Yuki Tanaka',
    customerEmail: 'y.tanaka@tokyomail.jp',
    customerPhone: '+819012345678',
    shippingMethod: 'EMS Cargo',
    paymentMethod: 'Visa Card',
    address: 'Shibuya 2-chome, Shibuya-ku, Tokyo, 150-0002, Japan',
    status: 'Pending',
    amount: 'IDR 3.100.000',
    numericAmount: 3100000,
    items: [
      {
        productId: 'p5',
        name: 'Heritage Indigo Coat',
        image: fifthImg,
        quantity: 1,
        price: 'IDR 3.100.000',
        numericPrice: 3100000
      }
    ]
  },
  {
    id: '#25431',
    date: 'Jan 15th,2022',
    customerName: 'Michael Brown',
    customerEmail: 'mbrown@hotmail.com',
    customerPhone: '+14155552671',
    shippingMethod: 'FedEx Express',
    paymentMethod: 'Master Card',
    address: 'Pine Street 101, San Francisco, CA 94111, USA',
    status: 'Delivered',
    amount: 'IDR 1.900.000',
    numericAmount: 1900000,
    items: [
      {
        productId: 'p4',
        name: 'Tenun Classic Vest',
        image: fourthImg,
        quantity: 2,
        price: 'IDR 950.000',
        numericPrice: 950000
      }
    ]
  }
];

const STORAGE_KEYS = {
  PRODUCTS: 'larasana_admin_products',
  ORDERS: 'larasana_admin_orders'
};

// Initialize localStorage if not present
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
  }
};

// Helper format function for currency
export const formatIDR = (value: number): string => {
  return 'IDR ' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const getProducts = (): Product[] => {
  initializeStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
  } catch {
    return DEFAULT_PRODUCTS;
  }
};

export const getProductById = (id: string): Product | undefined => {
  return getProducts().find(p => p.id === id);
};

export const saveProduct = (product: Omit<Product, 'id' | 'price'> & { id?: string }): Product => {
  initializeStorage();
  const products = getProducts();
  const isEdit = !!product.id;
  const formattedPrice = formatIDR(product.numericPrice);
  
  let savedProduct: Product;
  if (isEdit) {
    savedProduct = {
      ...product,
      id: product.id!,
      price: formattedPrice
    } as Product;
    const index = products.findIndex(p => p.id === product.id);
    if (index !== -1) {
      products[index] = savedProduct;
    }
  } else {
    const newId = 'p_' + Math.random().toString(36).substr(2, 9);
    savedProduct = {
      ...product,
      id: newId,
      price: formattedPrice,
      sales: product.sales || 0
    } as Product;
    products.push(savedProduct);
  }
  
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  return savedProduct;
};

export const deleteProduct = (id: string): boolean => {
  initializeStorage();
  const products = getProducts();
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === products.length) return false;
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
  return true;
};

export const getOrders = (): Order[] => {
  initializeStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
  } catch {
    return DEFAULT_ORDERS;
  }
};

export const getOrderById = (id: string): Order | undefined => {
  // Allow id with or without '#' prefix
  const targetId = id.startsWith('#') ? id : '#' + id;
  return getOrders().find(o => o.id === targetId || o.id === id);
};

export const updateOrderStatus = (id: string, status: 'Delivered' | 'Canceled' | 'Pending'): boolean => {
  initializeStorage();
  const orders = getOrders();
  const targetId = id.startsWith('#') ? id : '#' + id;
  const index = orders.findIndex(o => o.id === targetId || o.id === id);
  if (index !== -1) {
    orders[index].status = status;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return true;
  }
  return false;
};

/*
===========================================================================
BACKEND INTEGRATION GUIDANCE (As requested by the USER)
===========================================================================
To connect the admin interface to a live Node.js / Express backend in the future:
1. Install an HTTP client (e.g. axios): `npm install axios`
2. Replace local storage calls with asynchronous fetch/axios requests.
3. Update components to await the Promise returned by the API services.

Here is a template of how the asynchronous service functions would look:

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/admin'; // adjust as needed

export const getProductsAsync = async (): Promise<Product[]> => {
  const response = await axios.get<Product[]>(`${API_BASE_URL}/products`);
  return response.data;
};

export const getProductByIdAsync = async (id: string): Promise<Product> => {
  const response = await axios.get<Product>(`${API_BASE_URL}/products/${id}`);
  return response.data;
};

export const saveProductAsync = async (product: Omit<Product, 'price'> & { id?: string }): Promise<Product> => {
  if (product.id) {
    const response = await axios.put<Product>(`${API_BASE_URL}/products/${product.id}`, product);
    return response.data;
  } else {
    const response = await axios.post<Product>(`${API_BASE_URL}/products`, product);
    return response.data;
  }
};

export const deleteProductAsync = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/products/${id}`);
};

export const getOrdersAsync = async (): Promise<Order[]> => {
  const response = await axios.get<Order[]>(`${API_BASE_URL}/orders`);
  return response.data;
};

export const getOrderByIdAsync = async (id: string): Promise<Order> => {
  const response = await axios.get<Order>(`${API_BASE_URL}/orders/${id}`);
  return response.data;
};

export const updateOrderStatusAsync = async (id: string, status: Order['status']): Promise<Order> => {
  const response = await axios.patch<Order>(`${API_BASE_URL}/orders/${id}/status`, { status });
  return response.data;
};
```
*/

