import React, { useState, useRef } from 'react';
import { Cashier, StoreInfo } from '../types';

interface LainnyaScreenProps {
  cashiers: Cashier[];
  activeCashier: Cashier;
  onSelectActiveCashier: (cashierId: string) => void;
  onOpenAddCashier: () => void;
  onDeleteCashier: (cashierId: string) => void;
  onResetToZero: () => void;
  onLoadDemoData: () => void;
  storeStatus: 'open' | 'closed';
  onToggleStoreStatus: () => void;
  storeInfo: StoreInfo;
  onOpenEditStore: () => void;
  onUpdateStoreInfo: (updatedInfo: Partial<StoreInfo>) => void;
}

export const LainnyaScreen: React.FC<LainnyaScreenProps> = ({
  cashiers,
  activeCashier,
  onSelectActiveCashier,
  onOpenAddCashier,
  onDeleteCashier,
  onResetToZero,
  onLoadDemoData,
  storeStatus,
  onToggleStoreStatus,
  storeInfo,
  onOpenEditStore,
  onUpdateStoreInfo,
}) => {
  const [autoPrint, setAutoPrint] = useState(true);
  const [soundBeep, setSoundBeep] = useState(true);
  const [printerStatus, setPrinterStatus] = useState<'connected' | 'testing'>('connected');
  const [toastMsg, setToastMsg] = useState('');
  const [cashierToDelete, setCashierToDelete] = useState<Cashier | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const qrisFileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleTestPrint = () => {
    setPrinterStatus('testing');
    setTimeout(() => {
      setPrinterStatus('connected');
      showToast('Printer Bluetooth RP-58A: Uji cetak struk berhasil!');
    }, 1200);
  };

  const handleConfirmDeleteCashier = () => {
    if (cashierToDelete) {
      if (cashierToDelete.id === activeCashier.id) {
        showToast('Tidak dapat menghapus kasir yang sedang aktif bertugas!');
        setCashierToDelete(null);
        return;
      }
      onDeleteCashier(cashierToDelete.id);
      showToast(`Kasir ${cashierToDelete.name} berhasil dihapus.`);
      setCashierToDelete(null);
    }
  };

  const handleQrisUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Mohon pilih file gambar QRIS (JPG, PNG, WEBP)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdateStoreInfo({ qrisImage: event.target.result as string });
          showToast('Gambar QRIS toko dari galeri berhasil disimpan!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-24">
      {/* Toast alert */}
      {toastMsg && (
        <div className="fixed top-20 inset-x-4 z-50 max-w-md mx-auto p-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl flex items-center justify-center gap-2 animate-fadeIn border border-slate-700">
          <span className="material-symbols-outlined text-primary-fixed text-[18px]">info</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="px-margin pt-4 pb-2">
        <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
          Pengaturan &amp; Operasional
        </h2>
        <p className="text-xs text-on-surface-variant">
          Konfigurasi profil toko, kasir, QRIS toko, printer, dan reset data
        </p>
      </div>

      <div className="px-margin flex flex-col gap-3 mt-1">
        {/* Toko Profile Card with Edit Capability */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0">
                <span className="material-symbols-outlined text-[28px]">storefront</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-title-md text-sm text-on-surface font-bold truncate">
                  {storeInfo.name}
                </h3>
                <p className="text-xs text-on-surface-variant line-clamp-1">{storeInfo.address}</p>
                <p className="text-[11px] text-on-surface-variant font-mono">Telp: {storeInfo.phone}</p>
              </div>
            </div>

            <button
              onClick={onToggleStoreStatus}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                storeStatus === 'open'
                  ? 'bg-tertiary-container/15 text-tertiary hover:bg-tertiary-container/25'
                  : 'bg-error-container text-error hover:bg-error-container/80'
              }`}
            >
              {storeStatus === 'open' ? 'Buka' : 'Tutup'}
            </button>
          </div>

          <div className="pt-2 border-t border-surface-container flex justify-end">
            <button
              type="button"
              onClick={onOpenEditStore}
              className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>Ubah Nama, Alamat &amp; No. Telp Toko</span>
            </button>
          </div>
        </div>

        {/* Kanal Pembayaran Digital & Upload QRIS dari Galeri */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-headline-sm text-xs font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">qr_code_2</span>
              <span>Kanal Pembayaran Digital (QRIS Toko)</span>
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-tertiary-container/15 text-tertiary font-bold text-[11px]">
              Aktif
            </span>
          </div>

          <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">
            Tambahkan gambar kode QRIS resmi toko Anda (dari BCA, GoPay, OVO, ShopeePay, Dana, dll.) langsung dari galeri HP atau laptop. Sistem kasir secara otomatis mengunci nominal transaksi (QRIS Dinamis), sehingga saat kustomer scan, total bayar langsung terisi otomatis sesuai kasir dan kustomer tidak dapat mengubah total.
          </p>

          {/* Hidden QRIS input from gallery */}
          <input
            type="file"
            ref={qrisFileInputRef}
            accept="image/*"
            onChange={handleQrisUpload}
            className="hidden"
          />

          <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl bg-surface-container-low border border-dashed border-primary/40">
            <div className="w-28 h-28 bg-white rounded-xl p-1.5 flex items-center justify-center shrink-0 border border-surface-container shadow-xs overflow-hidden">
              {storeInfo.qrisImage ? (
                <img
                  src={storeInfo.qrisImage}
                  alt="QRIS Toko"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-slate-900 rounded-lg p-2 flex flex-col items-center justify-center text-white text-center">
                  <span className="material-symbols-outlined text-3xl text-primary-fixed">qr_code_scanner</span>
                  <span className="text-[9px] mt-1 font-bold text-slate-300">Belum Ada QRIS</span>
                  <span className="text-[8px] text-slate-400">Pilih dari Galeri</span>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col gap-1.5 text-center sm:text-left w-full">
              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                <span className="font-bold text-xs text-on-surface">
                  {storeInfo.qrisImage ? '✓ QRIS Toko Aktif (Siap Pakai)' : 'Gunakan QRIS Pribadi Toko'}
                </span>
                {storeInfo.qrisImage && (
                  <span className="px-1.5 py-0.2 rounded-full bg-tertiary-container/20 text-tertiary font-bold text-[10px]">
                    Galeri
                  </span>
                )}
              </div>
              <p className="text-[11px] text-on-surface-variant">
                {storeInfo.name} • {storeInfo.address}
              </p>

              <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => qrisFileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-transform cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">photo_library</span>
                  <span>{storeInfo.qrisImage ? 'Ganti QRIS dari Galeri' : 'Ambil QRIS dari Galeri'}</span>
                </button>

                {storeInfo.qrisImage && (
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateStoreInfo({ qrisImage: '' });
                      showToast('QRIS kustom dihapus, kembali ke default.');
                    }}
                    className="px-2.5 py-2 rounded-xl border border-surface-container text-xs text-on-surface-variant hover:text-error hover:bg-error-container/20 cursor-pointer"
                  >
                    Hapus QRIS
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick preset QRIS options for testing */}
          <div className="mt-3 pt-3 border-t border-surface-container">
            <span className="text-[11px] font-semibold text-on-surface-variant block mb-1.5">
              Atau Gunakan Contoh Template QRIS Bank / E-Wallet:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { name: 'QRIS BCA', nmid: 'ID1020039485721-BCA' },
                { name: 'QRIS Mandiri', nmid: 'ID1020088192031-MDR' },
                { name: 'QRIS GoPay', nmid: 'ID1020055201948-GPY' },
                { name: 'QRIS ShopeePay', nmid: 'ID1020077391024-SPY' },
              ].map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    // Generate simulated QRIS data-url pattern
                    const svgData = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" fill="#ffffff"/><rect x="15" y="15" width="55" height="55" fill="#000000"/><rect x="25" y="25" width="35" height="35" fill="#ffffff"/><rect x="35" y="35" width="15" height="15" fill="#000000"/><rect x="130" y="15" width="55" height="55" fill="#000000"/><rect x="140" y="25" width="35" height="35" fill="#ffffff"/><rect x="150" y="35" width="15" height="15" fill="#000000"/><rect x="15" y="130" width="55" height="55" fill="#000000"/><rect x="25" y="140" width="35" height="35" fill="#ffffff"/><rect x="35" y="150" width="15" height="15" fill="#000000"/><rect x="85" y="25" width="15" height="25" fill="#000000"/><rect x="85" y="65" width="30" height="15" fill="#000000"/><rect x="25" y="85" width="25" height="15" fill="#000000"/><rect x="65" y="85" width="30" height="30" fill="#000000"/><rect x="110" y="85" width="20" height="40" fill="#000000"/><rect x="145" y="85" width="35" height="15" fill="#000000"/><rect x="85" y="130" width="15" height="45" fill="#000000"/><rect x="115" y="140" width="30" height="15" fill="#000000"/><rect x="160" y="125" width="25" height="40" fill="#000000"/><rect x="140" y="170" width="35" height="15" fill="#000000"/><text x="100" y="196" font-size="8" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="#00685f">${preset.name}</text></svg>`;
                    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgData)}`;
                    onUpdateStoreInfo({ qrisImage: dataUrl, nmid: preset.nmid });
                    showToast(`${preset.name} aktif!`);
                  }}
                  className="p-1.5 rounded-lg border border-surface-container bg-surface-container-low hover:bg-surface-container text-xs text-on-surface font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-primary text-[14px]">qr_code</span>
                  <span className="truncate">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Manajemen Kasir & Karyawan (Add & Manage Cashiers) */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-headline-sm text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">badge</span>
                <span>Manajemen Kasir ({cashiers.length} Terdaftar)</span>
              </h4>
              <p className="text-[11px] text-on-surface-variant">
                Kelola kasir shift &amp; tentukan kasir yang aktif melayani
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenAddCashier}
              className="px-2.5 py-1.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95 transition-transform cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              <span>Tambah Kasir</span>
            </button>
          </div>

          {/* Cashier List */}
          <div className="flex flex-col gap-2">
            {cashiers.map((c) => {
              const isActive = c.id === activeCashier.id;
              return (
                <div
                  key={c.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    isActive
                      ? 'bg-primary/5 border-primary ring-1 ring-primary/30'
                      : 'bg-surface-container-low border-surface-container hover:border-outline-variant'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-surface-container"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-on-surface truncate">{c.name}</span>
                        {isActive && (
                          <span className="px-1.5 py-0.2 rounded-full bg-tertiary-container/15 text-tertiary text-[10px] font-bold">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-primary font-semibold truncate">{c.role} • {c.shift}</p>
                      <p className="text-[10px] text-on-surface-variant font-mono">{c.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isActive ? (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectActiveCashier(c.id);
                          showToast(`Kasir aktif berganti ke ${c.name}`);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold active:scale-95 transition-all cursor-pointer"
                      >
                        Pilih
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-tertiary px-2 py-1 bg-tertiary-container/10 rounded-lg">
                        Sedang Tugas
                      </span>
                    )}

                    {cashiers.length > 1 && !isActive && (
                      <button
                        type="button"
                        onClick={() => setCashierToDelete(c)}
                        className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg cursor-pointer transition-colors"
                        title={`Hapus ${c.name}`}
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hardware & Perangkat */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs">
          <h4 className="font-headline-sm text-xs font-bold text-on-surface mb-3 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">print</span>
            <span>Perangkat Struk Kasir</span>
          </h4>

          <div className="flex items-center justify-between py-2 border-b border-surface-container text-xs">
            <div>
              <span className="font-semibold text-on-surface block">Printer Bluetooth POS</span>
              <span className="text-[11px] text-tertiary flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                RP-58A Thermal (Terhubung)
              </span>
            </div>
            <button
              type="button"
              onClick={handleTestPrint}
              disabled={printerStatus === 'testing'}
              className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-semibold hover:bg-primary/20 active:scale-95 transition-all cursor-pointer"
            >
              {printerStatus === 'testing' ? 'Mencetak...' : 'Tes Cetak'}
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-surface-container text-xs">
            <div>
              <span className="font-semibold text-on-surface block">Cetak Struk Otomatis</span>
              <span className="text-[11px] text-on-surface-variant">Cetak setiap pesanan tuntas</span>
            </div>
            <input
              type="checkbox"
              checked={autoPrint}
              onChange={(e) => setAutoPrint(e.target.checked)}
              className="w-4 h-4 accent-primary rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-2 text-xs">
            <div>
              <span className="font-semibold text-on-surface block">Suara Bip Pemindai</span>
              <span className="text-[11px] text-on-surface-variant">Nada saat scan &amp; pembayaran</span>
            </div>
            <input
              type="checkbox"
              checked={soundBeep}
              onChange={(e) => setSoundBeep(e.target.checked)}
              className="w-4 h-4 accent-primary rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Reset Data Awal Banget (Mulai dari Nol) vs Muat Demo */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs">
          <h4 className="font-headline-sm text-xs font-bold text-on-surface mb-1.5 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-error text-[18px]">restart_alt</span>
            <span>Pemeliharaan &amp; Reset Toko</span>
          </h4>
          <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">
            Mulai toko baru dari awal dengan mengosongkan semua barang, riwayat transaksi, dan mengembalikan pendapatan ke Rp 0.
          </p>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="w-full py-2.5 rounded-xl bg-error text-on-error font-bold text-xs shadow-xs hover:bg-error/90 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
              <span>Reset Toko ke Awal Banget (Semua 0 &amp; Kosongkan Produk)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onLoadDemoData();
                showToast('Data contoh demo (Rp 8.6M) berhasil dimuat!');
              }}
              className="w-full py-2 rounded-xl border border-surface-container hover:bg-surface-container-low text-xs text-on-surface-variant font-semibold cursor-pointer"
            >
              Muat Ulang Data Contoh Demo
            </button>
          </div>
        </div>

        <div className="text-center py-4 text-xs text-on-surface-variant">
          <p className="font-bold">TokoMate POS &amp; Retail Engine v2.4</p>
          <p className="text-[11px] mt-0.5">Dirancang untuk UMKM &amp; Toko Kelontong Indonesia</p>
        </div>
      </div>

      {/* Delete Cashier Confirmation Modal */}
      {cashierToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-surface-container overflow-hidden">
            <h3 className="font-headline-sm text-sm text-on-surface font-bold mb-2">
              Hapus Data Kasir?
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Apakah Anda yakin ingin menghapus akun kasir <strong>{cashierToDelete.name}</strong> ({cashierToDelete.shift})?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCashierToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-surface-container text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCashier}
                className="flex-1 py-2.5 rounded-xl bg-error text-on-error text-xs font-bold shadow-md cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset to Zero Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-surface-container overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-error-container text-error flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">warning</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-sm text-on-surface font-bold">
                  Reset Toko dari Awal?
                </h3>
                <p className="text-[11px] text-on-surface-variant">Tindakan ini akan mengosongkan seluruh data</p>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
              Semua produk inventaris akan <strong>dikosongkan (0 barang)</strong>, riwayat transaksi dibersihkan, dan saldo laci kasir dijadikan <strong>Rp 0</strong>. Toko Anda akan mulai bersih seperti toko yang baru dibuka.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-surface-container text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetToZero();
                  setIsResetConfirmOpen(false);
                  showToast('Toko telah direset bersih: semua 0 dan barang kosong!');
                }}
                className="flex-1 py-2.5 rounded-xl bg-error text-on-error text-xs font-bold shadow-md cursor-pointer"
              >
                Ya, Reset Total
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
