
import { Product, SalesData, Transaction, PaymentMethod, CartItem, StoreProfile } from './types';

export const CATEGORIES = ['Semua', 'Nugget', 'Sosis', 'Bakso', 'Dimsum', 'Snack'];

export const TAX_RATE = 0; // Pajak dinonaktifkan

export const DEFAULT_STORE_PROFILE: StoreProfile = {
  name: 'HF Frozen Food',
  address: 'Jl. Raya Frozen No. 123, Jakarta Selatan',
  adminName: 'Admin Kasir',
  logo: '', // Empty by default
  qrisImage: '' // Empty by default
};

// Data produk dikosongkan agar pengguna bisa memulai dari nol secara profesional
export const MOCK_PRODUCTS: Product[] = [];

// Data penjualan simulasi dikosongkan untuk memulai pencatatan baru
export const SALES_DATA: SalesData[] = [];

// Riwayat transaksi dikosongkan agar laporan keuangan dimulai dari nol
export const MOCK_TRANSACTIONS: Transaction[] = [];
