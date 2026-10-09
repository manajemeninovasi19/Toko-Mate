import React, { useState } from 'react';
import { Transaction } from '../types';
import { formatRupiah } from '../data/mockData';
import {
  exportSalesToExcelCSV,
  exportSalesToNativeExcel,
  exportSalesToStandardCSV,
} from '../utils/exportHelper';

interface LaporanScreenProps {
  transactions: Transaction[];
  totalSales: number;
  cashInDrawer: number;
  initialCash: number;
  qrisTotal: number;
  onViewReceipt: (transaction: Transaction) => void;
}

export const LaporanScreen: React.FC<LaporanScreenProps> = ({
  transactions,
  totalSales,
  cashInDrawer,
  initialCash,
  qrisTotal,
  onViewReceipt,
}) => {
  const [filterDate] = useState('2024-05-24');
  const [exportNotice, setExportNotice] = useState<string>('');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const cashSales = Math.max(0, cashInDrawer - initialCash);
  const qrisPercentage = totalSales > 0 ? Math.round((qrisTotal / totalSales) * 100) : 0;
  const cashPercentage = totalSales > 0 ? Math.round((cashSales / totalSales) * 100) : 0;

  const handleDownload = (format: 'excel-csv' | 'excel-native' | 'standard-csv') => {
    setIsExportMenuOpen(false);

    if (transactions.length === 0) {
      setExportNotice('Belum ada transaksi untuk diexport.');
      setTimeout(() => setExportNotice(''), 3000);
      return;
    }

    if (format === 'excel-native') {
      exportSalesToNativeExcel(transactions, filterDate);
      setExportNotice(
        'File Excel (.xls) berhasil diunduh! 100% rapi berkolom saat dibuka di Microsoft Excel.'
      );
    } else if (format === 'excel-csv') {
      exportSalesToExcelCSV(transactions, filterDate);
      setExportNotice(
        'File CSV (Pemisah Titik Koma) berhasil diunduh! Otomatis terbagi ke Kolom A, B, C di Excel Indonesia.'
      );
    } else {
      exportSalesToStandardCSV(transactions, filterDate);
      setExportNotice('File CSV Standar (Koma) berhasil diunduh untuk Google Sheets.');
    }

    setTimeout(() => setExportNotice(''), 4000);
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-24">
      {/* Top Header */}
      <div className="px-margin pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
              Laporan Penjualan
            </h2>
            <p className="text-xs text-on-surface-variant">
              Ringkasan kasir shift & transaksi Toko Berkah Abadi
            </p>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen((prev) => !prev)}
              className="px-3.5 py-2 rounded-xl bg-primary text-on-primary font-label-md text-xs font-semibold flex items-center gap-1.5 shadow-xs active:scale-95 transition-transform cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Unduh Laporan</span>
              <span className="material-symbols-outlined text-[16px]">
                {isExportMenuOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {/* Dropdown Menu Format Unduhan */}
            {isExportMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-2xl p-2 z-30 animate-fadeIn">
                <div className="px-2.5 py-1.5 border-b border-surface-container mb-1">
                  <span className="text-[11px] font-bold text-on-surface block">
                    Pilih Format Unduh Excel / CSV
                  </span>
                  <span className="text-[10px] text-on-surface-variant block">
                    Hasil download terbagi rapi ke kolom A, B, C, D (tidak jadi 1 kolom)
                  </span>
                </div>

                <button
                  onClick={() => handleDownload('excel-native')}
                  className="w-full text-left p-2 rounded-xl hover:bg-surface-container-low transition-colors flex items-start gap-2.5 cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[18px]">table_chart</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-on-surface flex items-center gap-1">
                      <span>Excel Workbook (.xls)</span>
                      <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold">
                        Paling Rapi
                      </span>
                    </span>
                    <span className="text-[10px] text-on-surface-variant block leading-tight mt-0.5">
                      Buka langsung di Microsoft Excel, otomatis rapi per kolom dengan tabel warna
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => handleDownload('excel-csv')}
                  className="w-full text-left p-2 rounded-xl hover:bg-surface-container-low transition-colors flex items-start gap-2.5 cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[18px]">csv</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-on-surface">
                      CSV Excel (Titik Koma ';')
                    </span>
                    <span className="text-[10px] text-on-surface-variant block leading-tight mt-0.5">
                      Format CSV khusus settingan Excel Indonesia agar tidak numpuk 1 kolom
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => handleDownload('standard-csv')}
                  className="w-full text-left p-2 rounded-xl hover:bg-surface-container-low transition-colors flex items-start gap-2.5 cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-surface-container text-on-surface-variant flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[18px]">description</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-on-surface">
                      CSV Standar (Koma ',')
                    </span>
                    <span className="text-[10px] text-on-surface-variant block leading-tight mt-0.5">
                      Kompatibel dengan Google Sheets, Mac Numbers & aplikasi database
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {exportNotice && (
          <div className="mb-2 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn shadow-xs">
            <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0">
              check_circle
            </span>
            <span className="font-medium">{exportNotice}</span>
          </div>
        )}

        {/* Date Selector */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
            <span className="text-xs font-semibold text-on-surface">Periode: 24 Mei 2024 (Hari Ini)</span>
          </div>
          <span className="text-xs text-tertiary bg-tertiary-container/15 px-2 py-0.5 rounded-full font-bold">
            Shift 1 Aktif
          </span>
        </div>

        {/* 3 Big Metrics */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs">
            <span className="text-xs text-on-surface-variant block">Total Omset Hari Ini</span>
            <span className="font-headline-md text-lg text-primary font-bold mt-1 block">
              {formatRupiah(totalSales)}
            </span>
            <span className="text-[11px] text-tertiary font-semibold flex items-center gap-0.5 mt-0.5">
              <span className="material-symbols-outlined text-[13px]">trending_up</span>
              +12.4% vs kemarin
            </span>
          </div>
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs">
            <span className="text-xs text-on-surface-variant block">Total Transaksi</span>
            <span className="font-headline-md text-lg text-on-surface font-bold mt-1 block">
              {transactions.length} Struk
            </span>
            <span className="text-[11px] text-on-surface-variant">100% Sukses tanpa void</span>
          </div>
        </div>

        {/* Payment Channels Card */}
        <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs mb-3">
          <h4 className="font-headline-sm text-xs font-bold text-on-surface mb-2.5">
            Komposisi Pembayaran
          </h4>
          <div className="w-full h-3 rounded-full bg-surface-container overflow-hidden flex mb-2.5">
            <div
              style={{ width: `${qrisPercentage}%` }}
              className="bg-primary h-full transition-all"
              title={`QRIS: ${qrisPercentage}%`}
            />
            <div
              style={{ width: `${cashPercentage}%` }}
              className="bg-secondary-container h-full transition-all"
              title={`Tunai: ${cashPercentage}%`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <div className="min-w-0 flex-1">
                <span className="text-on-surface-variant block text-[11px]">QRIS ({qrisPercentage}%)</span>
                <span className="font-bold text-primary">{formatRupiah(qrisTotal)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary-container" />
              <div className="min-w-0 flex-1">
                <span className="text-on-surface-variant block text-[11px]">Tunai ({cashPercentage}%)</span>
                <span className="font-bold text-secondary">{formatRupiah(cashSales)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History Table */}
        <div className="flex items-center justify-between mb-2 mt-1">
          <h3 className="font-headline-sm text-sm font-bold text-on-surface">
            Riwayat Transaksi Terakhir
          </h3>
          <span className="text-xs text-on-surface-variant">{transactions.length} Transaksi</span>
        </div>

        <div className="flex flex-col gap-2">
          {transactions.length === 0 ? (
            <div className="py-12 px-4 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-surface-container flex flex-col items-center">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">receipt_long</span>
              <p className="font-semibold text-sm text-on-surface">Belum Ada Transaksi Tercatat</p>
              <p className="text-xs text-on-surface-variant mt-1">
                Selesaikan pembayaran di kasir untuk melihat struk dan riwayat transaksi di sini.
              </p>
            </div>
          ) : (
            transactions.map((trx) => (
              <div
                key={trx.id}
                onClick={() => onViewReceipt(trx)}
                className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs flex items-center justify-between gap-3 hover:border-outline-variant cursor-pointer active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      trx.paymentMethod === 'qris'
                        ? 'bg-primary/10 text-primary'
                        : trx.paymentMethod === 'cash'
                        ? 'bg-secondary/10 text-secondary'
                        : 'bg-surface-container text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {trx.paymentMethod === 'qris'
                        ? 'qr_code_2'
                        : trx.paymentMethod === 'cash'
                        ? 'payments'
                        : 'credit_card'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-on-surface truncate">
                        {trx.receiptNo}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant">
                        {trx.paymentMethod}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      {trx.timestamp} • {trx.items.length} item • {trx.customerName || 'Umum'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold text-xs text-on-surface block font-mono">
                    {formatRupiah(trx.total)}
                  </span>
                  <span className="text-[10px] text-primary flex items-center justify-end gap-0.5 mt-0.5 font-semibold">
                    <span>Lihat Struk</span>
                    <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
