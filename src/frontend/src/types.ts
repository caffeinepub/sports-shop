import { ProductCategory } from './backend';

export interface Product {
  id: bigint;
  name: string;
  description: string;
  price: bigint;
  category: ProductCategory;
  stock: bigint;
}

export interface CartItem {
  productId: bigint;
  quantity: bigint;
}

export type Cart = CartItem[];
