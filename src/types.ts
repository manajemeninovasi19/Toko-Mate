export interface Product {
  id: string;
  name: string;
  category: 'Minuman' | 'Makanan' | 'Sembako' | 'Roti & Kue' | 'Kebutuhan';
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  unit: string;
  image: string;
  soldCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export type PaymentMethod = 'cash' | 'qris' | 'debit';

export interface Transaction {
  id: string;
  receiptNo: string;
  timestamp: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashTendered?: number;
  change?: number;
  cashierName: string;
  customerName?: string;
}

export interface DaySales {
  dayCode: string;
  dayLabel: string;
  fullDate: string;
  sales: number;
  transactions: number;
  isPeak?: boolean;
}

export type PeriodFilter = '7d' | '1m' | 'ytd' | 'custom';

export interface Cashier {
  id: string;
  name: string;
  phone: string;
  role: 'Kasir Kepala' | 'Kasir' | 'Kasir Pengganti';
  shift: 'Shift 1 (Pagi)' | 'Shift 2 (Siang)' | 'Shift 3 (Malam)';
  avatar: string;
  isActive: boolean;
}

export interface StoreInfo {
  name: string;
  subName: string;
  address: string;
  phone: string;
  qrisImage?: string;
  nmid?: string;
}
