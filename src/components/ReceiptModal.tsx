import React, { useState } from 'react';
import { Transaction, StoreInfo } from '../types';
import { formatRupiah } from '../data/mockData';

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
  const [copied, setCopied] = useState(false);
  const [printing, setPrinting] = useState(false);

  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      setPrinting(false);
    }, 1200);
  };

  const handleShareWhatsApp = () => {
    const text = `*${storeInfo.name.toUpperCase()}*%0AStruk: ${transaction.receiptNo}%0ATanggal: ${transaction.timestamp}%0AKasir: ${transaction.cashierName}%0A------------------------%0A${transaction.items
      .map((item) => `${item.product.name} (${item.quantity}x) = ${formatRupiah(item.product.price * item.quantity)}`)
      .join('%0A')}%0A------------------------%0ATotal: ${formatRupiah(transaction.total)}%0APembayaran: ${
      transaction.paymentMethod === 'cash' ? 'Tunai' : transaction.paymentMethod === 'qris' ? 'QRIS' : 'Debit'
    }%0A%0ATerima kasih telah berbelanja!`;

    navigator.clipboard?.writeText(text.replace(/%0A/g, '\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-4 shadow-2xl border border-surface-container flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-2 border-b border-surface-container">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
            <span className="font-headline-sm text-headline-sm text-on-surface">Struk Pembayaran</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Realistic 58mm Thermal Receipt Canvas */}
        <div className="my-3 p-4 bg-[#fefefe] rounded-xl border border-dashed border-slate-300 font-mono text-[11px] leading-tight text-slate-800 shadow-inner overflow-y-auto no-scrollbar">
          <div className="text-center pb-2 border-b border-dashed border-slate-300">
            <p className="font-bold text-sm text-slate-900 tracking-wider uppercase">
              {storeInfo.name}
            </p>
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
              <div className="flex justify-between text-error">
                <span>Diskon</span>
                <span>-{formatRupiah(transaction.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs font-bold text-slate-900 pt-1 border-t border-slate-200">
              <span>TOTAL</span>
              <span>{formatRupiah(transaction.total)}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span>Metode Bayar:</span>
              <span className="font-bold uppercase">
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
            <p>Terima kasih atas kunjungan Anda!</p>
            <p>Barang yang dibeli tidak dapat ditukar</p>
            <p className="tracking-widest font-bold text-slate-400 mt-1">*** LUNAS ***</p>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              disabled={printing}
              className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                {printing ? 'hourglass_top' : 'print'}
              </span>
              <span>{printing ? 'Mencetak...' : 'Cetak Struk'}</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-2.5 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
              title="Salin rincian struk"
            >
              <span className="material-symbols-outlined text-[18px]">
                {copied ? 'check' : 'share'}
              </span>
              <span>{copied ? 'Tersalin' : 'Bagikan'}</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              if (onNewOrder) onNewOrder();
            }}
            className="w-full py-2.5 rounded-xl bg-secondary-container text-on-secondary-container font-label-md text-label-md font-bold active:scale-95 transition-all flex items-center justify-center gap-1 shadow-sm cursor-pointer"
          >
            <span>Pesanan Baru</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
