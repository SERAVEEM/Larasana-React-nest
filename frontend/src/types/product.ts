export interface Weaver {
  name: string;
  bio: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  price: string;
  description: string;
  images: string[];
  sizes: string[];
  qrCode: string;
  weaver: Weaver;
}

export interface ProductListItem {
  id: number;
  name: string;
  price: string | number;
  [key: string]: any;
}
