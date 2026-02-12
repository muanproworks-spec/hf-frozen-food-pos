export interface Product {
  id: string;
  name: string;
  barcode: string;   // New Field
  price: number;     // Harga Jual
  costPrice: number; // Harga Modal (HPP)
  category: string;
  image: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  date: string; // ISO String
  total: number;
  items: CartItem[];
  paymentMethod: PaymentMethod;
  customerName: string;  
  customerPhone: string; 
  amountGiven?: number; // Uang yang diterima
  change?: number;      // Kembalian
}

export interface SalesData {
  time: string;
  sales: number;
}

export interface StoreProfile {
  name: string;
  address: string;
  adminName: string;
  logo: string; // Base64
  qrisImage: string; // Base64
}

export enum PaymentMethod {
  CASH = 'CASH',
  QRIS = 'QRIS'
}

export interface ReceiptData {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  date: string;
  id: string;
}