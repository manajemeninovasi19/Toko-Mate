import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { Product, CartItem, PaymentMethod, Transaction, StoreInfo } from '../types';
import { formatRupiah } from '../data/mockData';
import { generateDynamicQRISPayload } from '../utils/qrisHelper';

interface KasirScreenProps {
  products: Product[];
  onCompleteCheckout: (transaction: Transaction) => void;
  cashierName: string;
  storeInfo?: StoreInfo;
  onUpdateStoreInfo?: (updatedInfo: Partial<StoreInfo>) => void;
  onNavigateToProduk?: () => void;
}

export const KasirScreen: React.FC<KasirScreenProps> = ({
  products,
  onCompleteCheckout,
  cashierName,
  storeInfo,
  onUpdateStoreInfo,
  onNavigateToProduk,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [customerName, setCustomerName] = useState('Pelanggan Umum');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [isProcessingQRIS, setIsProcessingQRIS] = useState<boolean>(false);
  const [isCustomerPreviewOpen, setIsCustomerPreviewOpen] = useState<boolean>(false);
  const [dynamicQrUrl, setDynamicQrUrl] = useState<string>('');
  const [qrisMode, setQrisMode] = useState<'dynamic' | 'gallery'>('dynamic');

  const qrisInputRef = useRef<HTMLInputElement>(null);

  const handleUploadQrisFromCashier = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateStoreInfo) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdateStoreInfo({ qrisImage: event.target.result as string });
          setQrisMode('gallery');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter products by category and search query
  const categories = ['Semua', 'Minuman', 'Makanan', 'Sembako', 'Roti & Kue', 'Kebutuhan'];

  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

  // Cart operations
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // stock limit
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        if (product.stock <= 0) return prev;
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter((item) => item.product.id !== productId);
    });
  };

  const deleteItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setIsCartSheetOpen(false);
    setIsPaymentModalOpen(false);
  };

  // Calculations
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const totalToPay = Math.max(0, subtotal - discountAmount);
  const change = Math.max(0, cashTendered - totalToPay);

  // Generate dynamic QRIS with locked totalToPay
  useEffect(() => {
    if (isPaymentModalOpen && paymentMethod === 'qris') {
      const payload = generateDynamicQRISPayload(
        totalToPay,
        storeInfo?.name || 'TOKO BERKAH JAYA',
        storeInfo?.nmid || 'ID1020039485721'
      );
      QRCode.toDataURL(payload, {
        width: 256,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      })
        .then((url) => setDynamicQrUrl(url))
        .catch((err) => console.error('Error generating dynamic QRIS', err));
    }
  }, [isPaymentModalOpen, paymentMethod, totalToPay, storeInfo?.name, storeInfo?.nmid]);

  // Trigger tender modal
  const handleOpenTender = () => {
    setCashTendered(totalToPay); // Default cash is exact amount
    setIsCartSheetOpen(false);
    setIsPaymentModalOpen(true);
  };

  // Submit checkout
  const handleFinishTransaction = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')} WIB`;
    const randNum = Math.floor(1000 + Math.random() * 9000);

    const transaction: Transaction = {
      id: `TRX-${Date.now()}`,
      receiptNo: `INV/${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
        now.getDate()
      ).padStart(2, '0')}/${randNum}`,
      timestamp: timeStr,
      items: [...cart],
      subtotal,
      discount: discountAmount,
      tax: 0,
      total: totalToPay,
      paymentMethod,
      cashTendered: paymentMethod === 'cash' ? cashTendered : undefined,
      change: paymentMethod === 'cash' ? change : undefined,
      cashierName,
      customerName: customerName || 'Pelanggan Umum',
    };

    onCompleteCheckout(transaction);
    setCart([]);
    setIsPaymentModalOpen(false);
  };

  const handleSimulateQRIS = () => {
    setIsProcessingQRIS(true);
    setTimeout(() => {
      setIsProcessingQRIS(false);
      handleFinishTransaction();
    }, 1400);
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-28">
      {/* Top Search Header */}
      <div className="sticky top-16 z-20 bg-surface/95 backdrop-blur-md px-margin pt-3 pb-2 border-b border-surface-container">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Cari nama produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 rounded-xl bg-surface-container-low border border-surface-container text-on-surface text-sm focus:outline-hidden focus:border-primary transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Horizontal Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full font-label-md text-xs whitespace-nowrap transition-colors select-none ${
                  isSelected
                    ? 'bg-primary text-on-primary shadow-xs font-semibold'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="px-margin pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-on-surface-variant">
            {filteredProducts.length} Produk Tersedia
          </span>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-error font-semibold hover:underline"
            >
              Kosongkan Keranjang
            </button>
          )}
        </div>

        {products.length === 0 ? (
          <div className="py-14 px-4 text-center text-on-surface-variant flex flex-col items-center bg-surface-container-low rounded-2xl border border-surface-container my-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-4xl">inventory_2</span>
            </div>
            <p className="font-bold text-base text-on-surface">Katalog Produk Masih Kosong</p>
            <p className="text-xs mt-1 max-w-xs text-on-surface-variant">
              Toko baru Anda belum memiliki barang terdaftar. Tambahkan produk terlebih dahulu agar bisa mulai melayani transaksi kasir.
            </p>
            {onNavigateToProduk && (
              <button
                type="button"
                onClick={onNavigateToProduk}
                className="mt-4 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Tambah Produk Baru di Menu Produk</span>
              </button>
            )}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-on-surface-variant flex flex-col items-center">
            <span className="material-symbols-outlined text-4xl mb-2 text-outline">search_off</span>
            <p className="font-semibold text-sm">Produk tidak ditemukan</p>
            <p className="text-xs mt-1">Coba kata kunci lain atau periksa filter kategori</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {filteredProducts.map((prod) => {
              const inCartItem = cart.find((i) => i.product.id === prod.id);
              const qtyInCart = inCartItem ? inCartItem.quantity : 0;
              const isOutOfStock = prod.stock <= 0;

              return (
                <div
                  key={prod.id}
                  className={`bg-surface-container-lowest rounded-xl p-2.5 shadow-xs border transition-all flex flex-col justify-between ${
                    qtyInCart > 0
                      ? 'border-primary ring-1 ring-primary/40'
                      : 'border-surface-container hover:border-outline-variant'
                  }`}
                >
                  <div
                    onClick={() => !isOutOfStock && addToCart(prod)}
                    className="cursor-pointer"
                  >
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-surface-container-low mb-2">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {prod.stock <= prod.minStock && (
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-error text-on-error font-bold text-[9px]">
                          Sisa {prod.stock}
                        </span>
                      )}
                    </div>
                    <h4 className="font-title-md text-xs sm:text-sm text-on-surface line-clamp-2 font-semibold mb-1">
                      {prod.name}
                    </h4>
                    <p className="font-headline-sm text-sm text-primary font-bold">
                      {formatRupiah(prod.price)}
                    </p>
                  </div>

                  {/* Quantity Action Area */}
                  <div className="mt-2 pt-2 border-t border-surface-container/60">
                    {qtyInCart > 0 ? (
                      <div className="flex items-center justify-between bg-surface-container-low rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => removeFromCart(prod.id)}
                          className="w-7 h-7 rounded-md bg-surface-container text-on-surface flex items-center justify-center font-bold text-sm active:scale-90"
                        >
                          -
                        </button>
                        <span className="font-bold text-xs text-primary font-mono px-1">
                          {qtyInCart}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToCart(prod)}
                          disabled={qtyInCart >= prod.stock}
                          className="w-7 h-7 rounded-md bg-primary text-on-primary flex items-center justify-center font-bold text-sm active:scale-90 disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addToCart(prod)}
                        disabled={isOutOfStock}
                        className={`w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-transform active:scale-95 ${
                          isOutOfStock
                            ? 'bg-surface-container text-outline cursor-not-allowed'
                            : 'bg-primary/10 text-primary hover:bg-primary hover:text-on-primary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                        <span>{isOutOfStock ? 'Habis' : 'Tambah'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-20 inset-x-0 z-30 px-margin max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-primary to-primary-container rounded-2xl p-3 shadow-xl flex items-center justify-between text-on-primary border border-primary-fixed/30">
            <div
              onClick={() => setIsCartSheetOpen(true)}
              className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 font-bold">
                {totalItemCount}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] text-primary-fixed-dim">Total Tagihan ({totalItemCount} item)</span>
                <span className="font-headline-md text-base sm:text-lg font-bold text-white tracking-tight">
                  {formatRupiah(totalToPay)}
                </span>
              </div>
            </div>

            <button
              onClick={handleOpenTender}
              className="px-4 py-2.5 rounded-xl bg-secondary-container text-on-secondary-container font-headline-sm text-sm font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-transform shrink-0"
            >
              <span>Bayar</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* Cart Sheet Modal (Rincian Pesanan) */}
      {isCartSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-surface-container flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">shopping_cart</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Keranjang Pesanan</h3>
              </div>
              <button
                onClick={() => setIsCartSheetOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Customer input */}
            <div className="pt-3 pb-2">
              <label className="text-xs font-semibold text-on-surface-variant mb-1 block">
                Nama Pelanggan / Catatan Meja:
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="cth: Pelanggan Umum / Bu Siti"
                className="w-full px-3 py-1.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface focus:outline-hidden focus:border-primary"
              />
            </div>

            {/* Itemized List */}
            <div className="flex-1 overflow-y-auto py-2 divide-y divide-surface-container no-scrollbar">
              {cart.map((item) => (
                <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-10 h-10 rounded-lg object-cover shrink-0 bg-surface-container"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-on-surface truncate">{item.product.name}</p>
                      <p className="text-[11px] text-on-surface-variant">
                        {formatRupiah(item.product.price)} x {item.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-xs text-on-surface font-mono">
                      {formatRupiah(item.product.price * item.quantity)}
                    </span>
                    <div className="flex items-center bg-surface-container-low rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="w-6 h-6 rounded-md bg-surface-container text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-bold font-mono">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => addToCart(item.product)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-6 h-6 rounded-md bg-primary text-on-primary text-xs font-bold disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteItem(item.product.id)}
                      className="text-on-surface-variant hover:text-error p-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Discount preset */}
            <div className="pt-2 border-t border-surface-container">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-on-surface-variant">Diskon Kasir:</span>
                <div className="flex gap-1.5">
                  {[0, 5, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDiscountPercent(pct)}
                      className={`px-2 py-0.5 text-[11px] rounded-md font-semibold ${
                        discountPercent === pct
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-low text-on-surface-variant'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtotal & Total */}
              <div className="p-3 rounded-xl bg-surface-container-low flex flex-col gap-1 text-xs">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-error font-semibold">
                    <span>Diskon ({discountPercent}%)</span>
                    <span>-{formatRupiah(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-on-surface pt-1 border-t border-surface-container">
                  <span>Total Tagihan</span>
                  <span className="text-primary">{formatRupiah(totalToPay)}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setIsCartSheetOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-surface-container text-xs font-semibold"
                >
                  Tambah Barang
                </button>
                <button
                  type="button"
                  onClick={handleOpenTender}
                  className="flex-1 py-2.5 rounded-xl bg-secondary text-on-secondary text-xs font-bold shadow-md active:scale-95"
                >
                  Lanjut Bayar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Tender Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-surface-container flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Proses Pembayaran</h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Big Total Header */}
            <div className="py-3 text-center bg-primary/10 rounded-xl my-3">
              <span className="text-xs text-on-surface-variant">Total yang Harus Dibayar</span>
              <p className="font-headline-lg text-2xl text-primary font-bold tracking-tight">
                {formatRupiah(totalToPay)}
              </p>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-surface-container rounded-xl mb-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`py-2 text-xs font-semibold rounded-lg transition-colors flex flex-col items-center gap-0.5 ${
                  paymentMethod === 'cash'
                    ? 'bg-white text-on-surface shadow-xs font-bold'
                    : 'text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">payments</span>
                <span>Tunai</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('qris')}
                className={`py-2 text-xs font-semibold rounded-lg transition-colors flex flex-col items-center gap-0.5 ${
                  paymentMethod === 'qris'
                    ? 'bg-white text-primary shadow-xs font-bold'
                    : 'text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                <span>QRIS</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('debit')}
                className={`py-2 text-xs font-semibold rounded-lg transition-colors flex flex-col items-center gap-0.5 ${
                  paymentMethod === 'debit'
                    ? 'bg-white text-on-surface shadow-xs font-bold'
                    : 'text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">credit_card</span>
                <span>Debit</span>
              </button>
            </div>

            {/* Method Details */}
            {paymentMethod === 'cash' && (
              <div className="flex flex-col gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant mb-1 block">
                    Uang Diterima dari Pembeli:
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-xs text-on-surface-variant">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={cashTendered || ''}
                      onChange={(e) => setCashTendered(parseInt(e.target.value) || 0)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-base font-bold text-on-surface focus:outline-hidden focus:border-primary font-mono"
                    />
                  </div>
                </div>

                {/* Quick Nominal Presets */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCashTendered(totalToPay)}
                    className="py-1.5 px-1 bg-surface-container-low hover:bg-surface-container rounded-lg text-xs font-semibold border border-surface-container"
                  >
                    Uang Pas
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashTendered(50000)}
                    className="py-1.5 px-1 bg-surface-container-low hover:bg-surface-container rounded-lg text-xs font-semibold border border-surface-container font-mono"
                  >
                    50.000
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashTendered(100000)}
                    className="py-1.5 px-1 bg-surface-container-low hover:bg-surface-container rounded-lg text-xs font-semibold border border-surface-container font-mono"
                  >
                    100.000
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashTendered(200000)}
                    className="py-1.5 px-1 bg-surface-container-low hover:bg-surface-container rounded-lg text-xs font-semibold border border-surface-container font-mono"
                  >
                    200.000
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashTendered(500000)}
                    className="py-1.5 px-1 bg-surface-container-low hover:bg-surface-container rounded-lg text-xs font-semibold border border-surface-container font-mono"
                  >
                    500.000
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashTendered(totalToPay + 10000 - (totalToPay % 10000))}
                    className="py-1.5 px-1 bg-surface-container-low hover:bg-surface-container rounded-lg text-xs font-semibold border border-surface-container font-mono"
                  >
                    Bulatkan
                  </button>
                </div>

                {/* Kembalian */}
                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex justify-between items-center mt-1">
                  <span className="text-xs text-on-surface-variant font-medium">Uang Kembalian:</span>
                  <span
                    className={`font-headline-md text-base font-bold font-mono ${
                      cashTendered < totalToPay ? 'text-error' : 'text-primary'
                    }`}
                  >
                    {cashTendered < totalToPay
                      ? `Kurang ${formatRupiah(totalToPay - cashTendered)}`
                      : formatRupiah(change)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleFinishTransaction}
                  disabled={cashTendered < totalToPay}
                  className="w-full py-3 rounded-xl bg-primary text-on-primary font-label-md text-sm font-bold shadow-md active:scale-95 transition-all disabled:opacity-50 mt-1 flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Bayar & Cetak Struk</span>
                </button>
              </div>
            )}

            {paymentMethod === 'qris' && (
              <div className="flex flex-col items-center text-center gap-2.5">
                {/* Hidden input for gallery upload directly in cashier */}
                <input
                  type="file"
                  ref={qrisInputRef}
                  accept="image/*"
                  onChange={handleUploadQrisFromCashier}
                  className="hidden"
                />

                {/* Banner: Nominal Terkunci Otomatis */}
                <div className="w-full bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 text-left flex items-start gap-2 shadow-xs">
                  <span className="material-symbols-outlined text-emerald-700 text-[20px] shrink-0 mt-0.5">lock</span>
                  <div>
                    <span className="font-bold text-xs text-emerald-800 flex items-center gap-1">
                      <span>QRIS Dinamis • Nominal Terkunci Otomatis</span>
                    </span>
                    <span className="text-[11px] text-emerald-700 leading-tight block mt-0.5">
                      Saat kustomer scan QR ini, nominal <strong>{formatRupiah(totalToPay)}</strong> langsung terisi otomatis. Kustomer <u>tidak dapat mengedit atau mengubah</u> total bayar.
                    </span>
                  </div>
                </div>

                {/* Mode Selector if Store has uploaded QRIS */}
                {storeInfo?.qrisImage && (
                  <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-xl w-full max-w-[270px] text-xs">
                    <button
                      type="button"
                      onClick={() => setQrisMode('dynamic')}
                      className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
                        qrisMode === 'dynamic'
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      QR Dinamis (Terkunci)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQrisMode('gallery')}
                      className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
                        qrisMode === 'gallery'
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      QR Galeri
                    </button>
                  </div>
                )}

                {/* QRIS Card with Dynamic Locked Amount */}
                <div className="p-3 bg-white rounded-2xl border-2 border-emerald-500/40 shadow-sm flex flex-col items-center w-full max-w-[270px]">
                  {/* Official Indonesian QRIS Header Bar */}
                  <div className="w-full flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
                    <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-black tracking-wider">
                      QRIS
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                      PEMBAYARAN DIGITAL
                    </span>
                  </div>

                  {qrisMode === 'gallery' && storeInfo?.qrisImage ? (
                    <div className="w-48 h-48 rounded-lg overflow-hidden border border-slate-200 bg-white p-1 flex items-center justify-center">
                      <img
                        src={storeInfo.qrisImage}
                        alt="QRIS Toko"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : dynamicQrUrl ? (
                    <div className="w-48 h-48 rounded-lg overflow-hidden border border-slate-200 bg-white p-1 flex items-center justify-center">
                      <img
                        src={dynamicQrUrl}
                        alt={`QRIS Dinamis Terkunci ${formatRupiah(totalToPay)}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-48 h-48 bg-slate-900 rounded-lg p-2 flex items-center justify-center relative overflow-hidden">
                      <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  <span className="font-bold text-[11px] text-slate-800 mt-1 uppercase truncate max-w-full">
                    {storeInfo?.name || 'TOKO BERKAH JAYA'}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    NMID: {storeInfo?.nmid || 'ID1020039485721'}
                  </span>

                  {/* Locked Amount Badge inside QRIS Card */}
                  <div className="w-full bg-slate-900 text-white rounded-lg py-1.5 px-2 mt-2 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-1.5 text-left">
                      <span className="material-symbols-outlined text-amber-400 text-[16px]">lock</span>
                      <div>
                        <span className="text-[8px] text-slate-300 block uppercase font-medium">Tagihan Terkunci</span>
                        <span className="font-bold text-xs text-amber-300 font-mono">{formatRupiah(totalToPay)}</span>
                      </div>
                    </div>
                    <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">
                      Read-Only
                    </span>
                  </div>
                </div>

                {/* Simulation Button: Check Customer Phone View */}
                <button
                  type="button"
                  onClick={() => setIsCustomerPreviewOpen(true)}
                  className="w-full py-2 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs text-on-surface font-semibold flex items-center justify-center gap-1.5 border border-surface-container-high transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-primary text-[17px]">smartphone</span>
                  <span>Lihat Simulasi Layar HP Kustomer Saat Scan</span>
                </button>

                {/* Gallery QRIS Button */}
                <div className="flex items-center justify-between w-full text-[11px]">
                  <button
                    type="button"
                    onClick={() => qrisInputRef.current?.click()}
                    className="text-primary font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">photo_library</span>
                    <span>{storeInfo?.qrisImage ? 'Ganti QRIS dari Galeri' : '+ Ambil QRIS dari Galeri'}</span>
                  </button>
                  <span className="text-on-surface-variant text-[10px]">QRIS Dinamis Terkunci</span>
                </div>

                {/* Confirm Payment button */}
                <button
                  type="button"
                  onClick={handleSimulateQRIS}
                  disabled={isProcessingQRIS}
                  className="w-full py-3 rounded-xl bg-primary text-on-primary font-label-md text-sm font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                >
                  {isProcessingQRIS ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Menunggu Pembayaran Kustomer...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      <span>Konfirmasi Pembayaran Selesai ({formatRupiah(totalToPay)})</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {paymentMethod === 'debit' && (
              <div className="flex flex-col gap-3 py-2 text-center">
                <div className="p-4 bg-surface-container-low rounded-xl">
                  <span className="material-symbols-outlined text-4xl text-primary mb-1">contactless</span>
                  <p className="text-xs font-semibold text-on-surface">Silakan Gesek / Tap Kartu Debit di Mesin EDC</p>
                  <p className="text-[11px] text-on-surface-variant mt-1">BCA, Mandiri, BRI, BNI didukung</p>
                </div>
                <button
                  type="button"
                  onClick={handleFinishTransaction}
                  className="w-full py-3 rounded-xl bg-primary text-on-primary font-label-md text-sm font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  <span>Transaksi EDC Berhasil</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customer Screen Simulation Modal (Proving Nominal is Locked) */}
      {isCustomerPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-900 text-white rounded-3xl max-w-xs w-full p-4 shadow-2xl border border-slate-700 flex flex-col overflow-hidden">
            {/* Phone Speaker Notch */}
            <div className="w-16 h-1 bg-slate-700 rounded-full mx-auto mb-3" />

            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Simulasi HP Kustomer
              </span>
              <button
                type="button"
                onClick={() => setIsCustomerPreviewOpen(false)}
                className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            {/* App Header on Customer Phone */}
            <div className="bg-slate-800 rounded-xl p-3 my-3 text-center">
              <span className="text-[9px] text-emerald-400 font-bold uppercase block tracking-wider mb-0.5">
                BCA Mobile / GoPay / Livin / Dana
              </span>
              <h4 className="text-sm font-bold text-white">Konfirmasi Pembayaran QRIS</h4>
              <p className="text-xs text-slate-300 font-semibold mt-1 truncate">
                {storeInfo?.name || 'Toko Berkah Abadi'}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                NMID: {storeInfo?.nmid || 'ID1020039485721'}
              </p>
            </div>

            {/* Locked Nominal Field on Customer Screen */}
            <div className="bg-slate-800/90 rounded-xl p-3.5 border border-emerald-500/50 flex flex-col gap-1.5 text-left mb-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px] font-medium">Nominal Pembayaran</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">lock</span>
                  TERKUNCI
                </span>
              </div>

              {/* Read-only disabled amount input */}
              <div className="w-full bg-slate-900 border border-emerald-400/60 rounded-xl px-3 py-2 flex items-center justify-between">
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {formatRupiah(totalToPay)}
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded font-medium">
                  Tidak Bisa Diedit
                </span>
              </div>

              <p className="text-[10px] text-emerald-400/90 leading-tight mt-0.5">
                ✓ Total bayar langsung pas <strong>{formatRupiah(totalToPay)}</strong>. Kustomer tidak dapat mengubah nominal ini.
              </p>
            </div>

            <div className="space-y-1.5 text-xs text-slate-400 pb-3 border-b border-slate-800">
              <div className="flex justify-between text-[11px]">
                <span>Biaya Layanan</span>
                <span className="text-white font-mono">Rp 0</span>
              </div>
              <div className="flex justify-between font-bold text-white text-xs">
                <span>Total Bayar</span>
                <span className="text-emerald-400 font-mono">{formatRupiah(totalToPay)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-3">
              <button
                type="button"
                onClick={() => {
                  setIsCustomerPreviewOpen(false);
                  handleSimulateQRIS();
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">fingerprint</span>
                <span>Simulasi Bayar Rp {totalToPay.toLocaleString('id-ID')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCustomerPreviewOpen(false)}
                className="w-full py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Tutup Simulasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
