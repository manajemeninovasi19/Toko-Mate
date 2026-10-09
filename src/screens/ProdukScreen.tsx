import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { formatRupiah } from '../data/mockData';

interface ProdukScreenProps {
  products: Product[];
  onOpenRestock: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

const PRESET_GALLERY_IMAGES = [
  {
    name: 'Air Mineral / Botol',
    category: 'Minuman',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQHh90vAsWtoUwtyh6anIslYl5lwqksdhU5yxUj02xatDJpuR0EbsEwn8vkCAY5JRfZbemHvEcMjwNC_SU7R0Ydl4A_ReRgWgk6rEcn5BaIQjqP7RVeB49r6REbQMLkZJ46u5zrIrILMdJ6sE-IeVKYpAKLSt6SGn_63KRUlL2GvVEnw59Ozvdkr-gT7p5NT2bVH0nI425knvjC8uf54WSJYBmlchuN-Z-GZvYDEN6BXy12EPco41Q',
  },
  {
    name: 'Mie Instan',
    category: 'Makanan',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDajL-piTFplM4MPIPCt0nzu1hbAYq1CM7E5ikUNxc5A0HFuS60eNnSZt_QUqP2KRaxHFP9m_bLaZRkWAVYnrnPCKZ6O15nPpUpniYO-9hc0XVET1U7HWfC64aQ_Ez8y0fz7n_oiQOdNjuotIVB7SiPVCKX3DwPQcDasPAu0VmuxEe45moM9S0jpuXm0lKmNggvzx0rmfuE5nQXdIo7mdApr-aE3uoiLBsQUa87yO_dyJfcEDT9_3m1',
  },
  {
    name: 'Roti Tawar',
    category: 'Roti & Kue',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAn_Gel7li2m7gjpHgrnfco_az_TyVB_H-BfauI-zc28I9lPzOvCJNojUkttoXRUy_janHGTpJpLrTz5vTxvHc0OuWlKuJuf3VyEnmL_asGJTBmr8c7-9EB-tpR4QCe_4dYGiC0d_u3JfIvXDNvx_3Dj5-mPcsj_bSaGwMa4JMmAcVW95oMHvGmolrHm2TOtWRhjLr2Ahg44wWZz0Zr3tP_scKUYlXbQYkgnmzMUHy8W6W-2638QyK6',
  },
  {
    name: 'Minyak / Sembako',
    category: 'Sembako',
    url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&auto=format&fit=crop&q=60',
  },
  {
    name: 'Telur Ayam',
    category: 'Sembako',
    url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&auto=format&fit=crop&q=60',
  },
  {
    name: 'Kopi / Sachet',
    category: 'Minuman',
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=60',
  },
  {
    name: 'Sabun & Kebersihan',
    category: 'Kebutuhan',
    url: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=200&auto=format&fit=crop&q=60',
  },
];

export const ProdukScreen: React.FC<ProdukScreenProps> = ({
  products,
  onOpenRestock,
  onAddProduct,
  onDeleteProduct,
}) => {
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Form state for adding new product
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<Product['category']>('Minuman');
  const [newPrice, setNewPrice] = useState<number>(10000);
  const [newCostPrice, setNewCostPrice] = useState<number>(8000);
  const [newStock, setNewStock] = useState<number>(20);
  const [newMinStock, setNewMinStock] = useState<number>(5);
  const [newUnit, setNewUnit] = useState('pcs');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [imageSourceMode, setImageSourceMode] = useState<'gallery' | 'preset'>('gallery');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (stockFilter === 'low') {
      return p.stock <= p.minStock && p.stock > 0;
    }
    if (stockFilter === 'out') {
      return p.stock <= 0;
    }
    return true;
  });

  const lowStockCount = products.filter((p) => p.stock <= p.minStock && p.stock > 0).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;
  const totalInventoryValue = products.reduce((acc, p) => acc + p.costPrice * p.stock, 0);

  // File Upload from user gallery
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Mohon pilih file gambar (JPG, PNG, WEBP)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
          showToast('Gambar dari galeri berhasil dipilih!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const defaultImages: Record<string, string> = {
      Minuman: PRESET_GALLERY_IMAGES[0].url,
      Makanan: PRESET_GALLERY_IMAGES[1].url,
      'Roti & Kue': PRESET_GALLERY_IMAGES[2].url,
      Sembako: PRESET_GALLERY_IMAGES[3].url,
      Kebutuhan: PRESET_GALLERY_IMAGES[6].url,
    };

    const finalImage = selectedImage || defaultImages[newCategory] || defaultImages.Minuman;

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      price: newPrice,
      costPrice: newCostPrice,
      stock: newStock,
      minStock: newMinStock,
      unit: newUnit || 'pcs',
      image: finalImage,
      soldCount: 0,
    };

    onAddProduct(newProd);
    setIsAddModalOpen(false);
    showToast(`Produk "${newProd.name}" berhasil ditambahkan!`);

    // Reset form
    setNewName('');
    setSelectedImage('');
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      const prodName = productToDelete.name;
      onDeleteProduct(productToDelete.id);
      setProductToDelete(null);
      showToast(`Produk "${prodName}" telah dihapus.`);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 inset-x-4 z-50 max-w-sm mx-auto p-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl flex items-center justify-center gap-2 animate-fadeIn border border-slate-700">
          <span className="material-symbols-outlined text-primary-fixed text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Quick Summary */}
      <div className="px-margin pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Katalog &amp; Stok</h2>
            <p className="text-xs text-on-surface-variant">Manajemen inventaris barang Toko Berkah Abadi</p>
          </div>
          <button
            onClick={() => {
              setSelectedImage('');
              setIsAddModalOpen(true);
            }}
            className="px-3 py-2 rounded-xl bg-primary text-on-primary font-label-md text-xs font-semibold flex items-center gap-1.5 shadow-xs active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Tambah SKU</span>
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="p-2.5 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs">
            <span className="text-[11px] text-on-surface-variant block">Total Produk</span>
            <span className="font-headline-sm text-on-surface font-bold">{products.length} SKU</span>
          </div>
          <div className="p-2.5 rounded-xl bg-error-container/30 border border-error-container shadow-xs">
            <span className="text-[11px] text-error block">Stok Menipis</span>
            <span className="font-headline-sm text-error font-bold">{lowStockCount + outOfStockCount} Item</span>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs">
            <span className="text-[11px] text-on-surface-variant block">Aset Stok</span>
            <span className="font-headline-sm text-primary font-bold truncate">
              {formatRupiah(totalInventoryValue)}
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-2">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Cari nama produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface focus:outline-hidden focus:border-primary"
          />
        </div>

        {/* Stock Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setStockFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
              stockFilter === 'all'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-low text-on-surface-variant'
            }`}
          >
            Semua ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setStockFilter('low')}
            className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
              stockFilter === 'low'
                ? 'bg-error text-on-error'
                : 'bg-surface-container-low text-error'
            }`}
          >
            Perlu Restok ({lowStockCount})
          </button>
          <button
            type="button"
            onClick={() => setStockFilter('out')}
            className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
              stockFilter === 'out'
                ? 'bg-error text-on-error'
                : 'bg-surface-container-low text-on-surface-variant'
            }`}
          >
            Habis ({outOfStockCount})
          </button>
        </div>
      </div>

      {/* Product List */}
      <div className="px-margin flex flex-col gap-2 mt-1">
        {products.length === 0 ? (
          <div className="py-12 px-4 text-center text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-surface-container p-6 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-4xl">add_shopping_cart</span>
            </div>
            <p className="font-bold text-base text-on-surface">Toko Masih Bersih (Belum Ada Barang)</p>
            <p className="text-xs mt-1 max-w-sm text-on-surface-variant leading-relaxed">
              Anda telah mereset toko ke awal. Tambahkan barang pertama Anda sekarang menggunakan foto langsung dari galeri HP atau gambar siap pakai.
            </p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Tambah Produk Pertama (Bisa dari Galeri)</span>
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-surface-container p-6">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">inventory_2</span>
            <p className="font-semibold text-sm">Tidak ada produk ditemukan</p>
            <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian atau tambah produk baru.</p>
          </div>
        ) : (
          filteredProducts.map((prod) => {
            const isLow = prod.stock <= prod.minStock;
            const isOut = prod.stock <= 0;
            return (
              <div
                key={prod.id}
                className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs flex items-center justify-between gap-3 hover:border-outline-variant transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-12 h-12 rounded-lg object-cover shrink-0 bg-surface-container border border-surface-container/60"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-title-md text-xs sm:text-sm text-on-surface truncate font-semibold">
                        {prod.name}
                      </h4>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-surface-container text-on-surface-variant shrink-0">
                        {prod.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs">
                      <span className="font-bold text-primary">{formatRupiah(prod.price)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px]">
                      <span
                        className={`font-semibold ${
                          isOut ? 'text-error font-bold' : isLow ? 'text-error' : 'text-tertiary'
                        }`}
                      >
                        Stok: {prod.stock} {prod.unit}
                      </span>
                      <span className="text-on-surface-variant">• Min: {prod.minStock}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenRestock(prod)}
                    className="px-2.5 py-1.5 rounded-lg bg-secondary text-on-secondary font-label-md text-xs font-semibold flex items-center gap-1 active:scale-95 shadow-xs cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">add_box</span>
                    <span>Restok</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductToDelete(prod)}
                    className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg cursor-pointer transition-colors"
                    title="Hapus Produk"
                    aria-label={`Hapus ${prod.name}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Custom Confirmation Modal for Deletion (Fixing window.confirm iframe bug) */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-surface-container overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-error-container text-error flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">delete_forever</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-sm text-on-surface font-bold">Hapus Produk?</h3>
                <p className="text-[11px] text-on-surface-variant">Konfirmasi penghapusan data barang</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low mb-4 flex items-center gap-3">
              <img
                src={productToDelete.image}
                alt={productToDelete.name}
                className="w-10 h-10 rounded-lg object-cover bg-white shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1 text-xs">
                <p className="font-bold text-on-surface truncate">{productToDelete.name}</p>
                <p className="text-on-surface-variant">
                  {formatRupiah(productToDelete.price)} • Stok: {productToDelete.stock} {productToDelete.unit}
                </p>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
              Apakah Anda yakin ingin menghapus produk ini dari katalog? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-low cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-error text-on-error text-xs font-bold shadow-md hover:bg-error/90 active:scale-95 transition-transform flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Produk Baru dengan Fitur Upload Galeri */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-surface-container max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">add_circle</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Tambah Produk Baru
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveNewProduct} className="py-3 flex flex-col gap-3 text-xs">
              {/* Product Photo Selector: Gallery Upload + Preset */}
              <div>
                <label className="font-semibold text-on-surface mb-1.5 flex items-center justify-between">
                  <span>Foto Produk:</span>
                  <div className="flex gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageSourceMode('gallery')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        imageSourceMode === 'gallery'
                          ? 'bg-primary text-on-primary font-bold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Galeri Foto
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSourceMode('preset')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        imageSourceMode === 'preset'
                          ? 'bg-primary text-on-primary font-bold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Pilihan Gambar
                    </button>
                  </div>
                </label>

                {/* Hidden Native File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {imageSourceMode === 'gallery' ? (
                  <div className="flex flex-col gap-2">
                    {/* Image Preview & Upload Button */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low border border-dashed border-primary/40">
                      <div className="w-16 h-16 rounded-lg bg-surface-container flex items-center justify-center overflow-hidden shrink-0 border border-surface-container relative">
                        {selectedImage ? (
                          <img
                            src={selectedImage}
                            alt="Pratinjau Foto"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-outline text-3xl">image</span>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col gap-1.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-transform cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">photo_library</span>
                          <span>Ambil dari Galeri</span>
                        </button>
                        {selectedImage ? (
                          <button
                            type="button"
                            onClick={() => setSelectedImage('')}
                            className="text-[11px] text-error font-semibold hover:underline text-left cursor-pointer"
                          >
                            Hapus foto terpilih
                          </button>
                        ) : (
                          <span className="text-[10px] text-on-surface-variant">
                            Format JPG, PNG, atau WEBP dari galeri ponsel/PC
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Preset Gallery Options */
                  <div className="flex flex-col gap-1.5">
                    <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto p-1.5 rounded-xl bg-surface-container-low border border-surface-container">
                      {PRESET_GALLERY_IMAGES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedImage(preset.url)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                            selectedImage === preset.url
                              ? 'border-primary ring-2 ring-primary/40 scale-95'
                              : 'border-transparent hover:border-outline-variant'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {selectedImage === preset.url && (
                            <span className="absolute inset-0 bg-primary/30 flex items-center justify-center text-white font-bold text-xs">
                              ✓
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] text-on-surface-variant">
                      Klik salah satu gambar untuk memilih
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="font-semibold text-on-surface mb-1 block">Nama Produk</label>
                <input
                  type="text"
                  required
                  placeholder="cth: Kopi Good Day Cappuccino 25g"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-on-surface focus:outline-hidden focus:border-primary text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-on-surface mb-1 block">Kategori</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl bg-surface-container-low border border-surface-container text-on-surface text-xs focus:outline-hidden cursor-pointer"
                  >
                    <option value="Minuman">Minuman</option>
                    <option value="Makanan">Makanan</option>
                    <option value="Sembako">Sembako</option>
                    <option value="Roti & Kue">Roti & Kue</option>
                    <option value="Kebutuhan">Kebutuhan</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-on-surface mb-1 block">Satuan</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="pcs / bks / btl"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-on-surface text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-on-surface mb-1 block">Harga Modal (Rp)</label>
                  <input
                    type="number"
                    value={newCostPrice}
                    onChange={(e) => setNewCostPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-on-surface text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-on-surface mb-1 block">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-on-surface text-xs font-mono font-bold text-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-on-surface mb-1 block">Stok Awal</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-on-surface text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-on-surface mb-1 block">Batas Minimum</label>
                  <input
                    type="number"
                    value={newMinStock}
                    onChange={(e) => setNewMinStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-on-surface text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-surface-container mt-1">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-surface-container text-xs font-semibold cursor-pointer hover:bg-surface-container-low"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-bold shadow-md cursor-pointer active:scale-95 transition-transform"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
