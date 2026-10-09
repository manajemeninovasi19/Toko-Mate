import { Product, DaySales, Cashier } from '../types';

export const LOGO_URL = "https://lh3.googleusercontent.com/aida/AEtjO1U-c69Z8-bl8ACZtp2UVfAnIImB8SLxFUPNRGc0bfy2C6ubfrFFRkHmQpLO6snnhobI6SOC6xO7kcTkIhFSJ6CFlvnFCRON-QehQ4AwMOByMaPmsnjoGKt2ijhgSZEq4JV51pmBo1zy_-O4K7Auo6rTWvX7ashSQq7VDVYxl5_Cx35E88NQC4TcrZln55JA1wSiZPhNBg8IIb4qzYK1ulhjPFKORu1jmXu9ZskHLE5x12NWI0ziUTnbOV8";
export const AVATAR_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuBRE7WahoaoJlEvFCMdPWQzmPmsieBLWPI6uA-UWsTrX85yOno-7BNG8Ih5txDkSebf5QhycOfoMpMLl3yvelop8IBQzYsaQ-mz77QImTHyrS5APT_Zhgl6DkQZyBk8x8pmAyCyhZrMibm6Jra1w4Wp-8mC0WB7NLEvraW7Eo4L5rI7Ai9TOPbVtZY5iL2f2qnDBrMujP6ipSLXZp63rnE1ApoGEBF_WSu4dfA2sNOCnL0xSyLWsxOG";

export const INITIAL_CASHIERS: Cashier[] = [
  {
    id: 'kasir-1',
    name: 'Budi Santoso',
    phone: '0812-3456-7890',
    role: 'Kasir Kepala',
    shift: 'Shift 1 (Pagi)',
    avatar: AVATAR_URL,
    isActive: true,
  },
  {
    id: 'kasir-2',
    name: 'Siti Aminah',
    phone: '0857-8901-2345',
    role: 'Kasir',
    shift: 'Shift 2 (Siang)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    isActive: false,
  },
  {
    id: 'kasir-3',
    name: 'Ahmad Fauzi',
    phone: '0813-9988-7766',
    role: 'Kasir Pengganti',
    shift: 'Shift 3 (Malam)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isActive: false,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Aqua 600ml',
    category: 'Minuman',
    price: 5000,
    costPrice: 3800,
    stock: 42,
    minStock: 12,
    unit: 'btl',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQHh90vAsWtoUwtyh6anIslYl5lwqksdhU5yxUj02xatDJpuR0EbsEwn8vkCAY5JRfZbemHvEcMjwNC_SU7R0Ydl4A_ReRgWgk6rEcn5BaIQjqP7RVeB49r6REbQMLkZJ46u5zrIrILMdJ6sE-IeVKYpAKLSt6SGn_63KRUlL2GvVEnw59Ozvdkr-gT7p5NT2bVH0nI425knvjC8uf54WSJYBmlchuN-Z-GZvYDEN6BXy12EPco41Q',
    soldCount: 18,
  },
  {
    id: 'prod-2',
    name: 'Mie Instan Goreng',
    category: 'Makanan',
    price: 3000,
    costPrice: 2400,
    stock: 35,
    minStock: 10,
    unit: 'bks',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDajL-piTFplM4MPIPCt0nzu1hbAYq1CM7E5ikUNxc5A0HFuS60eNnSZt_QUqP2KRaxHFP9m_bLaZRkWAVYnrnPCKZ6O15nPpUpniYO-9hc0XVET1U7HWfC64aQ_Ez8y0fz7n_oiQOdNjuotIVB7SiPVCKX3DwPQcDasPAu0VmuxEe45moM9S0jpuXm0lKmNggvzx0rmfuE5nQXdIo7mdApr-aE3uoiLBsQUa87yO_dyJfcEDT9_3m1',
    soldCount: 12,
  },
  {
    id: 'prod-3',
    name: 'Roti Tawar Kupas',
    category: 'Roti & Kue',
    price: 12000,
    costPrice: 9500,
    stock: 15,
    minStock: 5,
    unit: 'bks',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAn_Gel7li2m7gjpHgrnfco_az_TyVB_H-BfauI-zc28I9lPzOvCJNojUkttoXRUy_janHGTpJpLrTz5vTxvHc0OuWlKuJuf3VyEnmL_asGJTBmr8c7-9EB-tpR4QCe_4dYGiC0d_u3JfIvXDNvx_3Dj5-mPcsj_bSaGwMa4JMmAcVW95oMHvGmolrHm2TOtWRhjLr2Ahg44wWZz0Zr3tP_scKUYlXbQYkgnmzMUHy8W6W-2638QyK6',
    soldCount: 6,
  },
  {
    id: 'prod-4',
    name: 'Minyak Goreng 1L',
    category: 'Sembako',
    price: 18500,
    costPrice: 16000,
    stock: 3,
    minStock: 10,
    unit: 'bks',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&auto=format&fit=crop&q=60',
    soldCount: 4,
  },
  {
    id: 'prod-5',
    name: 'Telur Ayam 1kg',
    category: 'Sembako',
    price: 29000,
    costPrice: 25000,
    stock: 2,
    minStock: 5,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&auto=format&fit=crop&q=60',
    soldCount: 3,
  },
  {
    id: 'prod-6',
    name: 'Gula Pasir Gulaku 1kg',
    category: 'Sembako',
    price: 17500,
    costPrice: 15200,
    stock: 18,
    minStock: 8,
    unit: 'bks',
    image: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=200&auto=format&fit=crop&q=60',
    soldCount: 2,
  },
  {
    id: 'prod-7',
    name: 'Teh Botol Sosro 350ml',
    category: 'Minuman',
    price: 4500,
    costPrice: 3300,
    stock: 28,
    minStock: 10,
    unit: 'btl',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&auto=format&fit=crop&q=60',
    soldCount: 5,
  },
  {
    id: 'prod-8',
    name: 'Kopi Kapal Api Spesial 165g',
    category: 'Minuman',
    price: 14000,
    costPrice: 11800,
    stock: 22,
    minStock: 6,
    unit: 'bks',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=60',
    soldCount: 3,
  },
  {
    id: 'prod-9',
    name: 'Beras Pandan Wangi 5kg',
    category: 'Sembako',
    price: 74000,
    costPrice: 65000,
    stock: 8,
    minStock: 4,
    unit: 'sak',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&auto=format&fit=crop&q=60',
    soldCount: 1,
  },
  {
    id: 'prod-10',
    name: 'Sabun Cuci Piring Sunlight 700ml',
    category: 'Kebutuhan',
    price: 15500,
    costPrice: 13000,
    stock: 14,
    minStock: 5,
    unit: 'pch',
    image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=200&auto=format&fit=crop&q=60',
    soldCount: 2,
  },
  {
    id: 'prod-11',
    name: 'Susu Kental Manis Frisian Flag 370g',
    category: 'Makanan',
    price: 13000,
    costPrice: 10800,
    stock: 20,
    minStock: 8,
    unit: 'klg',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&auto=format&fit=crop&q=60',
    soldCount: 4,
  },
  {
    id: 'prod-12',
    name: 'Biskuit Roma Kelapa 300g',
    category: 'Roti & Kue',
    price: 11500,
    costPrice: 9200,
    stock: 16,
    minStock: 6,
    unit: 'bks',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&auto=format&fit=crop&q=60',
    soldCount: 3,
  }
];

export const WEEKLY_SALES_DATA: DaySales[] = [
  { dayCode: 'Sen', dayLabel: 'Senin', fullDate: 'Senin, 20 Mei', sales: 1150000, transactions: 14 },
  { dayCode: 'Sel', dayLabel: 'Selasa', fullDate: 'Selasa, 21 Mei', sales: 1280000, transactions: 16 },
  { dayCode: 'Rab', dayLabel: 'Rabu', fullDate: 'Rabu, 22 Mei', sales: 1220000, transactions: 15 },
  { dayCode: 'Kam', dayLabel: 'Kamis', fullDate: 'Kamis, 23 Mei', sales: 1350000, transactions: 18 },
  { dayCode: 'Jum', dayLabel: 'Jumat', fullDate: 'Jumat, 24 Mei', sales: 1550000, transactions: 20 },
  { dayCode: 'Sab', dayLabel: 'Sabtu', fullDate: 'Sabtu, 25 Mei', sales: 1850000, transactions: 25, isPeak: true },
  { dayCode: 'Min', dayLabel: 'Minggu', fullDate: 'Minggu, 26 Mei', sales: 1450000, transactions: 19 }
];

export const MONTHLY_SALES_DATA: DaySales[] = [
  { dayCode: 'M1', dayLabel: 'Minggu 1', fullDate: '1 - 7 Mei', sales: 8400000, transactions: 110 },
  { dayCode: 'M2', dayLabel: 'Minggu 2', fullDate: '8 - 14 Mei', sales: 9100000, transactions: 124 },
  { dayCode: 'M3', dayLabel: 'Minggu 3', fullDate: '15 - 21 Mei', sales: 9850000, transactions: 138, isPeak: true },
  { dayCode: 'M4', dayLabel: 'Minggu 4', fullDate: '22 - 28 Mei', sales: 8900000, transactions: 118 },
];

export const YTD_SALES_DATA: DaySales[] = [
  { dayCode: 'Jan', dayLabel: 'Januari', fullDate: 'Januari 2024', sales: 48500000, transactions: 650 },
  { dayCode: 'Feb', dayLabel: 'Februari', fullDate: 'Februari 2024', sales: 52100000, transactions: 710 },
  { dayCode: 'Mar', dayLabel: 'Maret', fullDate: 'Maret 2024', sales: 56300000, transactions: 780 },
  { dayCode: 'Apr', dayLabel: 'April', fullDate: 'April 2024', sales: 62400000, transactions: 840, isPeak: true },
  { dayCode: 'Mei', dayLabel: 'Mei', fullDate: '1 - 24 Mei 2024', sales: 58900000, transactions: 790 },
];

export function generateCustomSalesData(startDateStr: string, endDateStr: string): DaySales[] {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return WEEKLY_SALES_DATA;
  }

  const daysDiff = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const fullDayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  const result: DaySales[] = [];
  const count = Math.min(daysDiff, 10);
  const step = Math.max(1, Math.floor(daysDiff / count));

  let maxSales = 0;
  let peakIndex = 0;

  for (let i = 0; i < count; i++) {
    const d = new Date(start.getTime() + i * step * (1000 * 60 * 60 * 24));
    if (d > end) break;

    const dayCode = `${dayNames[d.getDay()]} ${d.getDate()}`;
    const fullDate = `${fullDayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]}`;

    // Deterministic pseudo-random sales curve based on date
    const seed = d.getDate() * 7 + (d.getDay() === 6 || d.getDay() === 0 ? 45 : 12);
    const sales = 900000 + (seed % 65) * 10000;
    const transactions = 12 + (seed % 15);

    if (sales > maxSales) {
      maxSales = sales;
      peakIndex = i;
    }

    result.push({
      dayCode,
      dayLabel: fullDayNames[d.getDay()],
      fullDate,
      sales,
      transactions,
    });
  }

  if (result.length > 0) {
    result[peakIndex].isPeak = true;
  }

  return result.length > 0 ? result : WEEKLY_SALES_DATA;
}

export const INITIAL_TRANSACTIONS = [
  {
    id: 'TRX-20240524-0018',
    receiptNo: 'INV/20240524/0018',
    timestamp: '14:22 WIB',
    customerName: 'Pelanggan Umum',
    cashierName: 'Budi Santoso',
    items: [
      { product: INITIAL_PRODUCTS[0], quantity: 2 },
      { product: INITIAL_PRODUCTS[1], quantity: 3 }
    ],
    subtotal: 19000,
    discount: 0,
    tax: 0,
    total: 19000,
    paymentMethod: 'qris' as const
  },
  {
    id: 'TRX-20240524-0017',
    receiptNo: 'INV/20240524/0017',
    timestamp: '13:50 WIB',
    customerName: 'Ibu Ratna',
    cashierName: 'Budi Santoso',
    items: [
      { product: INITIAL_PRODUCTS[2], quantity: 1 },
      { product: INITIAL_PRODUCTS[3], quantity: 1 }
    ],
    subtotal: 30500,
    discount: 0,
    tax: 0,
    total: 30500,
    paymentMethod: 'cash' as const,
    cashTendered: 50000,
    change: 19500
  },
  {
    id: 'TRX-20240524-0016',
    receiptNo: 'INV/20240524/0016',
    timestamp: '12:15 WIB',
    customerName: 'Pak Joko',
    cashierName: 'Budi Santoso',
    items: [
      { product: INITIAL_PRODUCTS[0], quantity: 4 },
      { product: INITIAL_PRODUCTS[4], quantity: 1 }
    ],
    subtotal: 49000,
    discount: 0,
    tax: 0,
    total: 49000,
    paymentMethod: 'qris' as const
  }
];

export function formatRupiah(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID');
}
