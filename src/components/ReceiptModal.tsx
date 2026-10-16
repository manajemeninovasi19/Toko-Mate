import React, { useState, useEffect, useRef } from 'react';
import { Transaction, StoreInfo } from '../types';
import { formatRupiah } from '../data/mockData';
import {
  generateReceiptImage,
  copyReceiptImageToClipboard,
  downloadReceiptFile,
  sanitizeWhatsAppPhone,
  getWhatsAppReceiptCaption,
  GeneratedReceipt,
} from '../utils/receiptImageHelper';

interface ReceiptModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onNewOrder?: () => void;
  storeInfo?: StoreInfo;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onNewOrder,
  storeInfo = {
    name: 'TOKO BERKAH ABADI',
    subName: 'Toko Berkah Jaya',
    address: 'Jl. Pahlawan No. 28, Surabaya',
    phone: '0812-3456-7890',
  },
}) => {
  const [activeView, setActiveView] = useState<'standard' | 'image'>('standard');
  const [receiptImage, setReceiptImage] = useState<GeneratedReceipt | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [printing, setPrinting] = useState(false);
  
  // Feedback states
  const [imageCopied, setImageCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccessMsg, setShareSuccessMsg] = useState<string | null>(null);

  // WhatsApp form state
  const [showWaInput, setShowWaInput] = useState(false);
  const [waPhone, setWaPhone] = useState('');
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Generate image whenever transaction or modal opens
  useEffect(() => {
    if (!isOpen || !transaction) {
      setReceiptImage(null);
      setShowWaInput(false);
      setShareSuccessMsg(null);
      return;
    }

    let isMounted = true;
    setIsGenerating(true);

    generateReceiptImage(transaction, storeInfo)
      .then((res) => {
        if (isMounted) {
          setReceiptImage(res);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate receipt image:', err);
        if (isMounted) {
          setIsGenerating(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, transaction, storeInfo]);

  if (!isOpen || !transaction) return null;

  // Print simulation
  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      setPrinting(false);
    }, 1200);
  };

  // Copy Image directly to clipboard (Ready for Ctrl+V in WhatsApp)
  const handleCopyImage = async () => {
    if (!receiptImage) return;
    const success = await copyReceiptImageToClipboard(receiptImage.blob);
    if (success) {
      setImageCopied(true);
      setShareSuccessMsg('✓ Gambar struk disalin! Tekan Ctrl+V (Paste) di chat WhatsApp');
      setTimeout(() => setImageCopied(false), 3000);
      setTimeout(() => setShareSuccessMsg(null), 5000);
    } else {
      // Fallback: download the file
      downloadReceiptFile(receiptImage.blob, `struk-${transaction.receiptNo}.png`);
      setShareSuccessMsg('Gambar struk otomatis diunduh untuk dikirim ke WhatsApp');
      setTimeout(() => setShareSuccessMsg(null), 4000);
    }
  };

  // Download image file
  const handleDownloadImage = () => {
    if (!receiptImage) return;
    downloadReceiptFile(receiptImage.blob, `struk-${transaction.receiptNo}.png`);
    setShareSuccessMsg('✓ File gambar struk PNG berhasil diunduh!');
    setTimeout(() => setShareSuccessMsg(null), 3500);
  };

  // Main WhatsApp Image Share handler
  const handleSendToWhatsApp = async (phoneToUse?: string) => {
    if (!receiptImage) return;
    setIsSharing(true);

    const caption = getWhatsAppReceiptCaption(transaction, storeInfo);
    const targetPhone = phoneToUse || waPhone.trim();

    // 1. Try Native System Share if supported (Android, iOS, or supporting desktop)
    // Web Share API with files sends the actual image directly into WhatsApp
    const canShareFiles = typeof navigator !== 'undefined' && 
      navigator.canShare && 
      navigator.canShare({ files: [receiptImage.file] });

    if (canShareFiles) {
      try {
        await navigator.share({
          files: [receiptImage.file],
          title: `Struk Belanja - ${storeInfo.name}`,
          text: `Struk belanja resmi dari ${storeInfo.name} (${transaction.receiptNo})\nTotal: ${formatRupiah(transaction.total)}`,
        });
        setShareSuccessMsg('✓ Struk gambar berhasil dikirim!');
        setIsSharing(false);
        setTimeout(() => setShareSuccessMsg(null), 4000);
        return;
      } catch (err: any) {
        // If user cancelled, just exit gracefully
        if (err.name === 'AbortError') {
          setIsSharing(false);
          return;
        }
        console.warn('Native share failed, using fallback:', err);
      }
    }

    // 2. Desktop / Fallback mode:
    // Copy image directly to clipboard, download PNG, and open WhatsApp Web with prefilled message
    await copyReceiptImageToClipboard(receiptImage.blob);
    setImageCopied(true);
    setTimeout(() => setImageCopied(false), 3000);

    const cleanPhone = targetPhone ? sanitizeWhatsAppPhone(targetPhone) : '';
    const encodedCaption = encodeURIComponent(caption);
    const waUrl = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedCaption}`
      : `https://api.whatsapp.com/send?text=${encodedCaption}`;

    window.open(waUrl, '_blank');

    setShareSuccessMsg(
      '✓ Gambar struk telah disalin ke clipboard! Silakan tekan Ctrl+V (Paste) di WhatsApp untuk mengirim gambar struk.'
    );
    setIsSharing(false);
    setTimeout(() => setShareSuccessMsg(null), 6000);
  };

  // Copy text caption
  const handleCopyTextOnly = () => {
    const text = getWhatsAppReceiptCaption(transaction, storeInfo);
    navigator.clipboard?.writeText(text);
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-4 shadow-2xl border border-surface-container flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-surface-container">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-primary text-[22px]">receipt_long</span>
            <div className="min-w-0">
              <h2 className="font-headline-sm text-sm font-bold text-on-surface truncate">Struk Pembayaran</h2>
              <span className="text-[11px] text-on-surface-variant font-mono">{transaction.receiptNo}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* View Mode Toggle: Standard vs Image */}
            <div className="flex items-center bg-surface-container p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveView('standard')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  activeView === 'standard'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Teks
              </button>
              <button
                type="button"
                onClick={() => setActiveView('image')}
                className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                  activeView === 'image'
                    ? 'bg-surface-container-lowest text-emerald-600 shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">image</span>
                <span>Gambar (WA)</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Success / Alert Toast Notification */}
        {shareSuccessMsg && (
          <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-start gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">check_circle</span>
            <span className="flex-1 leading-tight">{shareSuccessMsg}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="my-2 flex-1 overflow-y-auto no-scrollbar">
          {activeView === 'standard' ? (
            /* Realistic 58mm Thermal Receipt Canvas */
            <div className="p-4 bg-[#fefefe] rounded-xl border border-dashed border-slate-300 font-mono text-[11px] leading-tight text-slate-800 shadow-inner">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <p className="font-bold text-sm text-slate-900 tracking-wider uppercase">
                  {storeInfo.name}
                </p>
                {storeInfo.subName && storeInfo.subName !== storeInfo.name && (
                  <p className="text-[10px] text-slate-600">{storeInfo.subName}</p>
                )}
                <p className="text-[10px] text-slate-500">{storeInfo.address}</p>
                <p className="text-[10px] text-slate-500">Telp: {storeInfo.phone}</p>
              </div>

              <div className="py-2 border-b border-dashed border-slate-300 text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span>No: {transaction.receiptNo}</span>
                  <span>{transaction.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir: {transaction.cashierName}</span>
                  <span>Pelanggan: {transaction.customerName || 'Umum'}</span>
                </div>
              </div>

              {/* Itemized list */}
              <div className="py-2 border-b border-dashed border-slate-300 space-y-1.5">
                {transaction.items.map((item, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="font-semibold text-slate-900">{item.product.name}</span>
                    <div className="flex justify-between text-slate-600">
                      <span>
                        {item.quantity} x {formatRupiah(item.product.price)}
                      </span>
                      <span className="font-medium text-slate-900">
                        {formatRupiah(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals & Tender */}
              <div className="py-2 border-b border-dashed border-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatRupiah(transaction.subtotal)}</span>
                </div>
                {transaction.discount > 0 && (
                  <div className="flex justify-between text-error font-medium">
                    <span>Diskon</span>
                    <span>-{formatRupiah(transaction.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>TOTAL</span>
                  <span className="text-emerald-700">{formatRupiah(transaction.total)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Metode Bayar:</span>
                  <span className="font-bold uppercase text-slate-900">
                    {transaction.paymentMethod === 'cash'
                      ? 'TUNAI'
                      : transaction.paymentMethod === 'qris'
                      ? 'QRIS DINAMIS'
                      : 'KARTU DEBIT'}
                  </span>
                </div>
                {transaction.paymentMethod === 'cash' && transaction.cashTendered !== undefined && (
                  <>
                    <div className="flex justify-between text-slate-600">
                      <span>Uang Diterima:</span>
                      <span>{formatRupiah(transaction.cashTendered)}</span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-semibold">
                      <span>Kembalian:</span>
                      <span>{formatRupiah(transaction.change || 0)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="text-center pt-3 text-[10px] text-slate-500 space-y-0.5">
                <div className="inline-block px-3 py-0.5 border border-emerald-600 text-emerald-700 rounded font-bold text-xs tracking-wider mb-1">
                  ✓ L U N A S
                </div>
                <p>Terima kasih atas kunjungan Anda!</p>
                <p>Barang yang dibeli tidak dapat ditukar</p>
              </div>
            </div>
          ) : (
            /* Generated High-Resolution Image Preview */
            <div className="flex flex-col items-center">
              <div className="w-full bg-surface-container-low rounded-xl p-2 border border-surface-container flex flex-col items-center justify-center">
                {isGenerating ? (
                  <div className="py-16 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
                    <span className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">Merender gambar struk resolusi tinggi...</span>
                  </div>
                ) : receiptImage ? (
                  <div className="relative group flex flex-col items-center">
                    <img
                      src={receiptImage.dataUrl}
                      alt="Gambar Struk Pembayaran"
                      className="max-h-[360px] w-auto rounded-lg shadow-md border border-slate-200 object-contain"
                    />
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full">
                      <span className="material-symbols-outlined text-emerald-600 text-[15px]">verified</span>
                      <span>Gambar PNG siap dikirim ke WhatsApp</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-on-surface-variant">
                    Gagal merender gambar struk.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick WhatsApp Phone Drawer / Input (Optional) */}
          {showWaInput && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 animate-fadeIn">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">contact_phone</span>
                  <span>Kirim ke No. WhatsApp Pelanggan</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowWaInput(false)}
                  className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold"
                >
                  Batal
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  ref={phoneInputRef}
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={waPhone}
                  onChange={(e) => setWaPhone(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-on-surface focus:outline-emerald-600"
                />
                <button
                  type="button"
                  onClick={() => handleSendToWhatsApp(waPhone)}
                  disabled={isSharing}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>Kirim</span>
                </button>
              </div>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1.5">
                Struk dalam bentuk gambar akan otomatis disiapkan untuk dikirim ke chat WhatsApp pelanggan.
              </p>
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col gap-2 pt-1 border-t border-surface-container">
          {/* Main WhatsApp Image Action Button */}
          <div className="flex gap-2">
            <button
              onClick={() => handleSendToWhatsApp()}
              disabled={isSharing || isGenerating}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-label-md text-label-md font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
              title="Kirim Struk dalam bentuk gambar ke WhatsApp"
            >
              {/* WhatsApp Iconic Logo SVG */}
              <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>{isSharing ? 'Menyiapkan...' : 'Kirim Gambar ke WA'}</span>
            </button>

            {/* Quick Option to input customer phone */}
            <button
              type="button"
              onClick={() => {
                setShowWaInput((prev) => !prev);
                setTimeout(() => phoneInputRef.current?.focus(), 100);
              }}
              className="px-2.5 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              title="Kirim ke No. WA Tertentu"
            >
              <span className="material-symbols-outlined text-[20px]">dialpad</span>
            </button>
          </div>

          {/* Secondary Actions Row: Salin Gambar, Unduh Gambar, Cetak */}
          <div className="grid grid-cols-3 gap-2">
            {/* Copy image button */}
            <button
              onClick={handleCopyImage}
              disabled={isGenerating}
              className="py-2 px-2 rounded-xl bg-surface-container text-on-surface font-label-sm text-xs hover:bg-surface-container-high active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
              title="Salin Gambar Struk (Bisa langsung Paste/Ctrl+V di WhatsApp)"
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-600">
                {imageCopied ? 'done_all' : 'content_copy'}
              </span>
              <span className="truncate">{imageCopied ? 'Tersalin!' : 'Salin Gambar'}</span>
            </button>

            {/* Download PNG image */}
            <button
              onClick={handleDownloadImage}
              disabled={isGenerating}
              className="py-2 px-2 rounded-xl bg-surface-container text-on-surface font-label-sm text-xs hover:bg-surface-container-high active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
              title="Unduh struk sebagai file gambar PNG"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">download</span>
              <span className="truncate">Unduh PNG</span>
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              disabled={printing}
              className="py-2 px-2 rounded-xl bg-surface-container text-on-surface font-label-sm text-xs hover:bg-surface-container-high active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
              title="Cetak struk ke printer thermal"
            >
              <span className="material-symbols-outlined text-[16px] text-amber-600">
                {printing ? 'hourglass_top' : 'print'}
              </span>
              <span className="truncate">{printing ? 'Mencetak..' : 'Cetak'}</span>
            </button>
          </div>

          {/* Bottom Actions: Pesanan Baru */}
          <button
            onClick={() => {
              onClose();
              if (onNewOrder) onNewOrder();
            }}
            className="w-full py-2.5 rounded-xl bg-secondary-container text-on-secondary-container font-label-md text-label-md font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer mt-0.5"
          >
            <span>Transaksi / Pesanan Baru</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
