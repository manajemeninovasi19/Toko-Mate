import React, { useState } from 'react';
import { formatRupiah } from '../data/mockData';

interface ShiftDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'settle' | 'detail'; // 'settle' for Tutup/Setor, 'detail' for Detail Kasir
  cashInDrawer: number;
  initialCash: number;
  qrisTotal: number;
  totalSales: number;
  transactionCount: number;
  onConfirmSetor?: (amount: number) => void;
}

export const ShiftDrawerModal: React.FC<ShiftDrawerModalProps> = ({
  isOpen,
  onClose,
  mode,
  cashInDrawer,
  initialCash,
  qrisTotal,
  totalSales,
  transactionCount,
  onConfirmSetor,
}) => {
  const [setorAmount, setSetorAmount] = useState<number>(cashInDrawer - initialCash > 0 ? cashInDrawer - initialCash : cashInDrawer);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSetor = () => {
    if (onConfirmSetor) {
      onConfirmSetor(setorAmount);
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-5 shadow-2xl border border-surface-container overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">
                {mode === 'settle' ? 'lock_clock' : 'tune'}
              </span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              {mode === 'settle' ? 'Tutup Shift & Setor Laci' : 'Detail Kasir (Shift 1)'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {submitted ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-tertiary-container/20 text-tertiary flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <h4 className="font-headline-md text-on-surface mb-1">Setoran Berhasil Dicatat!</h4>
            <p className="text-sm text-on-surface-variant">
              Jumlah setor {formatRupiah(setorAmount)} telah dibukukan.
            </p>
          </div>
        ) : (
          <div className="py-4 flex flex-col gap-4">
            {/* Shift header info */}
            <div className="flex justify-between items-center p-3 rounded-xl bg-surface-container-low text-xs">
              <div>
                <p className="font-semibold text-on-surface">Budi Santoso (Shift 1)</p>
                <p className="text-on-surface-variant mt-0.5">Mulai: 07:30 WIB • Status: Seimbang</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-tertiary-container/15 text-tertiary font-bold">
                Aktif
              </span>
            </div>

            {/* Financial metrics breakdown */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-surface-container-low">
                <span className="text-xs text-on-surface-variant">Modal Awal Laci</span>
                <span className="font-title-md text-on-surface font-semibold">{formatRupiah(initialCash)}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-surface-container-low">
                <span className="text-xs text-on-surface-variant">Penjualan Tunai Bersih</span>
                <span className="font-title-md text-on-surface font-semibold">{formatRupiah(cashInDrawer - initialCash)}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-primary-fixed/20 border border-primary-fixed">
                <span className="text-xs font-semibold text-primary">Total Uang Fisik di Laci</span>
                <span className="font-headline-sm text-primary font-bold">{formatRupiah(cashInDrawer)}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-surface-container-low">
                <div>
                  <span className="text-xs text-on-surface-variant">QRIS Digital (Auto Settlement)</span>
                  <p className="text-[10px] text-tertiary">Masuk ke Rekening Toko</p>
                </div>
                <span className="font-title-md text-tertiary font-semibold">{formatRupiah(qrisTotal)}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-surface-container">
                <span className="text-xs font-semibold text-on-surface">Total Omset Kasir</span>
                <span className="font-title-md text-on-surface font-bold">{formatRupiah(totalSales)}</span>
              </div>
            </div>

            {/* Mode-specific actions */}
            {mode === 'settle' ? (
              <div className="mt-1 flex flex-col gap-2">
                <label className="text-xs font-semibold text-on-surface">
                  Nominal Setor ke Brankas Pemilik:
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-xs text-on-surface-variant font-bold">Rp</span>
                    <input
                      type="number"
                      value={setorAmount}
                      onChange={(e) => setSetorAmount(parseInt(e.target.value) || 0)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-on-surface font-headline-sm focus:outline-hidden focus:border-primary"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSetorAmount(cashInDrawer - initialCash)}
                    className="px-3 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high"
                  >
                    Setor Hasil
                  </button>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  *Sisa di laci: {formatRupiah(cashInDrawer - setorAmount)} (disimpan untuk modal shift berikutnya).
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-surface-container-low text-xs text-on-surface-variant flex items-center justify-between">
                <span>Struk Tercetak:</span>
                <span className="font-bold text-on-surface">{transactionCount} Transaksi (100% Valid)</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2 border-t border-surface-container">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-low"
              >
                Tutup
              </button>
              {mode === 'settle' ? (
                <button
                  type="button"
                  onClick={handleSetor}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                  <span>Setor & Rekonsiliasi</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    alert('Laporan Shift berhasil diekspor/cetak!');
                    onClose();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-primary-fixed text-on-primary-fixed font-label-md text-label-md font-semibold active:scale-95 transition-transform flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">print</span>
                  <span>Cetak Ringkasan</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
