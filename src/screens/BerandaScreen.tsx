import React, { useState, useMemo } from 'react';
import { Product, DaySales, PeriodFilter, StoreInfo } from '../types';
import {
  formatRupiah,
  WEEKLY_SALES_DATA,
  MONTHLY_SALES_DATA,
  YTD_SALES_DATA,
  generateCustomSalesData,
} from '../data/mockData';

interface BerandaScreenProps {
  products: Product[];
  totalSales: number;
  transactionCount: number;
  itemsSoldCount: number;
  cashInDrawer: number;
  initialCash: number;
  qrisTotal: number;
  onNavigateToKasir: () => void;
  onNavigateToProduk: () => void;
  onOpenNotifications: () => void;
  onOpenRestock: (product: Product) => void;
  onOpenDrawerModal: (mode: 'settle' | 'detail') => void;
  cashierName?: string;
  shiftName?: string;
  storeInfo?: StoreInfo;
}

/**
 * Calculates a smooth cubic Bezier path passing EXACTLY through every point.
 * Guarantees 100% mathematical precision with circle markers.
 */
function generateExactSmoothPath(points: { x: number; y: number }[]): {
  pathD: string;
  areaD: string;
} {
  if (!points || points.length === 0) return { pathD: '', areaD: '' };
  if (points.length === 1) {
    return {
      pathD: `M ${points[0].x},${points[0].y}`,
      areaD: `M ${points[0].x},${points[0].y} L ${points[0].x},95 Z`,
    };
  }

  let pathD = `M ${points[0].x},${points[0].y}`;
  const n = points.length;

  for (let i = 0; i < n - 1; i++) {
    const pPrev = i > 0 ? points[i - 1] : points[0];
    const pCurr = points[i];
    const pNext = points[i + 1];
    const pAfter = i + 2 < n ? points[i + 2] : points[i + 1];

    const cp1x = Number((pCurr.x + (pNext.x - pPrev.x) / 6).toFixed(1));
    const cp1y = Number((pCurr.y + (pNext.y - pPrev.y) / 6).toFixed(1));
    const cp2x = Number((pNext.x - (pAfter.x - pCurr.x) / 6).toFixed(1));
    const cp2y = Number((pNext.y - (pAfter.y - pCurr.y) / 6).toFixed(1));

    pathD += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${pNext.x},${pNext.y}`;
  }

  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const areaD = `${pathD} L ${lastPoint.x},95 L ${firstPoint.x},95 Z`;

  return { pathD, areaD };
}

export const BerandaScreen: React.FC<BerandaScreenProps> = ({
  products,
  totalSales,
  transactionCount,
  itemsSoldCount,
  cashInDrawer,
  initialCash,
  qrisTotal,
  onNavigateToKasir,
  onNavigateToProduk,
  onOpenNotifications,
  onOpenRestock,
  onOpenDrawerModal,
  cashierName = 'Budi Santoso',
  shiftName = 'Shift 1',
  storeInfo = {
    name: 'Toko Berkah Abadi',
    subName: 'Toko Berkah Jaya',
    address: 'Jl. Pahlawan No. 28, Surabaya',
    phone: '0812-3456-7890',
  },
}) => {
  const [period, setPeriod] = useState<PeriodFilter>('7d');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(5);

  // Custom Date Range State
  const [customStartDate, setCustomStartDate] = useState<string>('2024-05-18');
  const [customEndDate, setCustomEndDate] = useState<string>('2024-05-25');

  // Compute dataset according to selected tab (or flat zero if no transactions / reset)
  const chartData: DaySales[] = useMemo(() => {
    if (totalSales === 0) {
      // Empty store baseline: 0 sales on all 7 days
      return [
        { dayCode: 'Sen', dayLabel: 'Senin', fullDate: 'Senin', sales: 0, transactions: 0 },
        { dayCode: 'Sel', dayLabel: 'Selasa', fullDate: 'Selasa', sales: 0, transactions: 0 },
        { dayCode: 'Rab', dayLabel: 'Rabu', fullDate: 'Rabu', sales: 0, transactions: 0 },
        { dayCode: 'Kam', dayLabel: 'Kamis', fullDate: 'Kamis', sales: 0, transactions: 0 },
        { dayCode: 'Jum', dayLabel: 'Jumat', fullDate: 'Jumat', sales: 0, transactions: 0 },
        { dayCode: 'Sab', dayLabel: 'Sabtu', fullDate: 'Sabtu', sales: 0, transactions: 0 },
        { dayCode: 'Min', dayLabel: 'Minggu', fullDate: 'Minggu', sales: 0, transactions: 0 },
      ];
    }

    switch (period) {
      case '7d':
        return WEEKLY_SALES_DATA;
      case '1m':
        return MONTHLY_SALES_DATA;
      case 'ytd':
        return YTD_SALES_DATA;
      case 'custom':
        return generateCustomSalesData(customStartDate, customEndDate);
      default:
        return WEEKLY_SALES_DATA;
    }
  }, [totalSales, period, customStartDate, customEndDate]);

  // Current active day highlighted
  const safeIndex = Math.min(selectedDayIndex, Math.max(0, chartData.length - 1));
  const activeDay = chartData[safeIndex] || chartData[0];

  // Total sales in this period - formatted with pure numbers (no "jt" or "M")
  const totalPeriodSales = useMemo(() => {
    const sum = chartData.reduce((acc, curr) => acc + curr.sales, 0);
    return formatRupiah(sum);
  }, [chartData]);

  // Dynamically calculate (x, y) coordinates for each data point
  // Margin starts at 24 and ends at 316 ensuring day text labels under the points are 100% straight
  const chartCoordinates = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];
    const startX = 24;
    const endX = 316;
    const minY = 28; // Peak
    const maxY = 95; // Lowest baseline above day labels

    const salesValues = chartData.map((d) => d.sales);
    const rawMin = Math.min(...salesValues);
    const rawMax = Math.max(...salesValues);

    // Natural scale without exaggerated spikes
    const minVal = Math.max(0, rawMin * 0.3);
    const maxVal = rawMax > 0 ? rawMax * 1.25 : 1000000;
    const valRange = maxVal - minVal || 1;

    return chartData.map((d, i) => {
      const x = Number((startX + (i / (chartData.length - 1 || 1)) * (endX - startX)).toFixed(1));
      const y = rawMax === 0
        ? 95
        : Number((maxY - ((d.sales - minVal) / valRange) * (maxY - minY)).toFixed(1));
      return { x, y };
    });
  }, [chartData]);

  // Generate mathematical curve passing EXACTLY through the points
  const { pathD, areaD } = useMemo(() => {
    return generateExactSmoothPath(chartCoordinates);
  }, [chartCoordinates]);

  // Average receipt value
  const averageReceipt = transactionCount > 0 ? Math.round(totalSales / transactionCount) : 0;

  // Top selling products today (sorted by soldCount)
  const topProducts = [...products].filter((p) => p.soldCount > 0).sort((a, b) => b.soldCount - a.soldCount).slice(0, 3);

  // Low stock alert items (stock <= minStock)
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-6">
      {/* Top Greeting & Context Card */}
      <div className="px-margin pt-space-md pb-space-sm">
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-xs border border-surface-container">
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-primary-fixed-dim/20 blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between gap-space-sm relative z-10">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="font-body-md text-body-md text-on-surface-variant">Halo,</span>
                <span className="font-headline-sm text-headline-sm text-on-surface truncate font-bold">
                  {cashierName} 👋
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-label-md text-label-md text-primary font-semibold">
                  {storeInfo.name}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-container/15 text-tertiary font-label-sm text-label-sm font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                  Buka ({shiftName})
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <button
                  onClick={onOpenNotifications}
                  aria-label="Notifikasi"
                  className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-95 transition-transform cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">notifications</span>
                </button>
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-[10px] leading-none shadow-xs font-bold">
                  3
                </span>
              </div>
            </div>
          </div>

          {/* Date & Shift Filter Bar */}
          <div className="mt-space-md pt-space-sm flex items-center justify-between text-on-surface-variant flex-wrap gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low font-label-md text-label-md text-on-surface font-semibold">
              <span className="material-symbols-outlined text-primary text-[16px]">calendar_today</span>
              <span>Hari Ini, 24 Mei 2024</span>
            </div>
            <div className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-tertiary">cloud_download</span>
              <span>Kasir Aktif: 07:30 WIB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Metric Grid (2x2) */}
      <div className="px-margin py-space-xs">
        <div className="grid grid-cols-2 gap-space-sm">
          {/* Metric 1: Total Penjualan */}
          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-xs border border-surface-container flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                Total Penjualan
              </span>
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">payments</span>
              </div>
            </div>
            <div>
              <div className="font-headline-md text-headline-md text-on-surface tracking-tight mb-1 font-bold">
                {formatRupiah(totalSales)}
              </div>
              <div className="flex items-center gap-1 font-label-sm text-label-sm text-tertiary font-semibold">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                <span>{totalSales > 0 ? '+12.4% vs kemarin' : 'Toko Baru Dimulai'}</span>
              </div>
            </div>
          </div>

          {/* Metric 2: Jumlah Transaksi */}
          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-xs border border-surface-container flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                Transaksi
              </span>
              <div className="w-7 h-7 rounded-lg bg-secondary-fixed/50 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              </div>
            </div>
            <div>
              <div className="font-headline-md text-headline-md text-on-surface tracking-tight mb-1 font-bold">
                {transactionCount}{' '}
                <span className="font-body-sm text-body-sm font-normal text-on-surface-variant">struk</span>
              </div>
              <div className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px] text-tertiary">check_circle</span>
                <span>100% Berhasil</span>
              </div>
            </div>
          </div>

          {/* Metric 3: Rata-rata Struk */}
          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-xs border border-surface-container flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                Rata-rata Struk
              </span>
              <div className="w-7 h-7 rounded-lg bg-primary-fixed/40 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
              </div>
            </div>
            <div>
              <div className="font-headline-md text-headline-md text-on-surface tracking-tight mb-1 font-bold">
                {formatRupiah(averageReceipt)}
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Nilai keranjang stabil
              </span>
            </div>
          </div>

          {/* Metric 4: Produk Terjual */}
          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-xs border border-surface-container flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                Produk Terjual
              </span>
              <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface">
                <span className="material-symbols-outlined text-[18px]">inventory</span>
              </div>
            </div>
            <div>
              <div className="font-headline-md text-headline-md text-on-surface tracking-tight mb-1 font-bold">
                {itemsSoldCount}{' '}
                <span className="font-body-sm text-body-sm font-normal text-on-surface-variant">item</span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Dari {products.length} varian barang
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Sales Chart with 100% Vertically Aligned Day Labels */}
      <div className="px-margin py-space-sm">
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-surface-container flex flex-col">
          <div className="flex items-center justify-between mb-space-sm">
            <div>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                Performa Penjualan
              </span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Tren Penjualan (Rp)
              </h2>
            </div>
            <span className="font-title-md text-title-md text-primary font-bold">
              {totalPeriodSales}
            </span>
          </div>

          {/* Horizontal Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-2 no-scrollbar">
            {(
              [
                { id: '7d', label: '7 Hari Terakhir' },
                { id: '1m', label: '1 Bulan Terakhir' },
                { id: 'ytd', label: 'YTD' },
                { id: 'custom', label: 'Kustom' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setPeriod(tab.id);
                  setSelectedDayIndex(0);
                }}
                className={`period-tab px-3 py-1.5 rounded-full font-label-md text-label-md whitespace-nowrap transition-colors cursor-pointer ${
                  period === tab.id
                    ? 'bg-primary text-on-primary shadow-xs font-semibold'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Custom Date Range Picker when "Kustom" is active */}
          {period === 'custom' && (
            <div className="p-3 mb-2.5 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary text-[16px]">date_range</span>
                  Pilih Rentang Tanggal:
                </span>
                <div className="flex gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomStartDate('2024-05-18');
                      setCustomEndDate('2024-05-25');
                    }}
                    className="px-2 py-0.5 rounded bg-surface-container text-on-surface hover:bg-surface-container-high cursor-pointer"
                  >
                    7 Hari
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomStartDate('2024-05-11');
                      setCustomEndDate('2024-05-25');
                    }}
                    className="px-2 py-0.5 rounded bg-surface-container text-on-surface hover:bg-surface-container-high cursor-pointer"
                  >
                    14 Hari
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomStartDate('2024-04-25');
                      setCustomEndDate('2024-05-25');
                    }}
                    className="px-2 py-0.5 rounded bg-surface-container text-on-surface hover:bg-surface-container-high cursor-pointer"
                  >
                    30 Hari
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] text-on-surface-variant mb-0.5 block font-medium">
                    Mulai Tanggal:
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container-lowest border border-surface-container text-on-surface text-xs focus:outline-hidden focus:border-primary font-mono cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-on-surface-variant mb-0.5 block font-medium">
                    Sampai Tanggal:
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container-lowest border border-surface-container text-on-surface text-xs focus:outline-hidden focus:border-primary font-mono cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Interactive Chart Tooltip */}
          <div className="relative w-full pt-1 pb-1">
            <div className="flex justify-between items-center bg-primary/10 rounded-lg px-2.5 py-1 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                <span className="font-label-sm text-label-sm text-primary font-bold">
                  {activeDay.isPeak ? 'Puncak Penjualan:' : 'Detail Hari:'}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                  {activeDay.fullDate}
                </span>
              </div>
              <span className="font-label-md text-label-md text-primary font-bold">
                {formatRupiah(activeDay.sales)}
              </span>
            </div>

            {/* SVG Chart: Days are rendered directly inside SVG at exact x={pt.x} guaranteeing 100% vertical alignment */}
            <div className="w-full">
              <svg
                className="w-full h-36 overflow-visible"
                fill="none"
                viewBox="0 0 340 144"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#00685f" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#00685f" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Reference Grid lines */}
                <line stroke="#dae2fd" strokeDasharray="3 3" strokeWidth="1" x1="12" x2="328" y1="20" y2="20" />
                <line stroke="#dae2fd" strokeDasharray="3 3" strokeWidth="1" x1="12" x2="328" y1="58" y2="58" />
                <line stroke="#dae2fd" strokeWidth="1" x1="12" x2="328" y1="95" y2="95" />

                {/* Vertical Guidelines for EVERY point to guarantee straight alignment with day text */}
                {chartCoordinates.map((pt, idx) => {
                  const isSelected = safeIndex === idx;
                  return (
                    <g key={`guide-${idx}`}>
                      {/* Vertical line from top grid to baseline */}
                      <line
                        x1={pt.x}
                        y1={20}
                        x2={pt.x}
                        y2={95}
                        stroke={isSelected ? '#00685f' : '#e2e8f0'}
                        strokeWidth={isSelected ? 1.5 : 0.75}
                        strokeDasharray={isSelected ? '2 2' : '2 3'}
                        opacity={isSelected ? 0.9 : 0.45}
                      />
                      {/* Tick mark at the baseline */}
                      <line
                        x1={pt.x}
                        y1={92}
                        x2={pt.x}
                        y2={98}
                        stroke={isSelected ? '#00685f' : '#94a3b8'}
                        strokeWidth={isSelected ? 2 : 1}
                      />
                      {/* Guide connecting from baseline down to day label */}
                      <line
                        x1={pt.x}
                        y1={95}
                        x2={pt.x}
                        y2={114}
                        stroke={isSelected ? '#00685f' : '#e2e8f0'}
                        strokeWidth={isSelected ? 1.5 : 0.75}
                        strokeDasharray={isSelected ? '2 2' : '1 3'}
                      />
                    </g>
                  );
                })}

                {/* Area Fill underneath the curve */}
                {areaD && <path d={areaD} fill="url(#chartGradient)" />}

                {/* Smooth Curve Path Line */}
                {pathD && (
                  <path
                    d={pathD}
                    stroke="#00685f"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                  />
                )}

                {/* Daily Point Indicators (Perfect alignment with line) */}
                {chartCoordinates.map((pt, index) => {
                  const isSelected = safeIndex === index;
                  const isPeak = chartData[index]?.isPeak;

                  return (
                    <g
                      key={`pt-${index}`}
                      onClick={() => setSelectedDayIndex(index)}
                      className="cursor-pointer group"
                    >
                      {/* Invisible larger hover/click hitbox for the entire column */}
                      <rect
                        x={pt.x - 18}
                        y={10}
                        width={36}
                        height={130}
                        fill="transparent"
                      />

                      {isSelected ? (
                        <>
                          <circle cx={pt.x} cy={pt.y} fill="#00685f" r="6" />
                          <circle cx={pt.x} cy={pt.y} fill="#ffffff" r="3" />
                        </>
                      ) : isPeak ? (
                        <>
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="5.5"
                            fill="#00685f"
                            className="opacity-40 animate-ping"
                          />
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="4"
                            fill="#ffffff"
                            stroke="#00685f"
                            strokeWidth="2.5"
                          />
                        </>
                      ) : (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          fill="#ffffff"
                          r="3.5"
                          stroke="#00685f"
                          strokeWidth="2"
                          className="group-hover:r-5 transition-all"
                        />
                      )}
                    </g>
                  );
                })}

                {/* Day Labels placed AT EXACT SAME pt.x (100% mathematically straight under circle) */}
                {chartCoordinates.map((pt, idx) => {
                  const isSelected = safeIndex === idx;
                  const dayText = chartData[idx]?.dayCode || '';

                  return (
                    <g
                      key={`txt-${idx}`}
                      onClick={() => setSelectedDayIndex(idx)}
                      className="cursor-pointer group"
                    >
                      {isSelected ? (
                        <>
                          <rect
                            x={pt.x - 16}
                            y={114}
                            width={32}
                            height={20}
                            rx={10}
                            fill="#00685f"
                          />
                          <text
                            x={pt.x}
                            y={125}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill="#ffffff"
                            fontSize="11px"
                            fontWeight="700"
                            fontFamily="'Plus Jakarta Sans', sans-serif"
                            className="select-none"
                          >
                            {dayText}
                          </text>
                        </>
                      ) : (
                        <text
                          x={pt.x}
                          y={125}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#64748b"
                          fontSize="11px"
                          fontWeight="600"
                          fontFamily="'Plus Jakarta Sans', sans-serif"
                          className="select-none group-hover:fill-primary"
                        >
                          {dayText}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Overview Section */}
      <div className="px-margin py-space-xs flex flex-col gap-space-md">
        {/* Section 1: Produk Terlaris Hari Ini */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-surface-container flex flex-col">
          <div className="flex items-center justify-between mb-space-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">
                local_fire_department
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Produk Terlaris Hari Ini
              </h3>
            </div>
            <button
              onClick={onNavigateToProduk}
              className="font-label-sm text-label-sm text-primary hover:underline font-semibold cursor-pointer"
            >
              Semua
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {topProducts.length === 0 ? (
              <div className="p-4 rounded-xl bg-surface-container-low text-center text-xs text-on-surface-variant flex flex-col items-center">
                <span className="material-symbols-outlined text-3xl text-outline mb-1">shopping_bag</span>
                <p className="font-semibold text-on-surface">Belum ada produk terjual</p>
                <p className="text-[11px] mt-0.5">Transaksi penjualan yang tuntas akan otomatis tampil di sini.</p>
              </div>
            ) : (
              topProducts.map((prod, idx) => {
                const rank = idx + 1;
                const revenue = prod.price * prod.soldCount;
                return (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low/60 hover:bg-surface-container-low transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-5 h-5 rounded-full font-label-sm text-label-sm flex items-center justify-center shrink-0 font-bold ${
                          rank === 1
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-surface-container-highest text-on-surface-variant'
                        }`}
                      >
                        {rank}
                      </span>
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-surface-container flex items-center justify-center">
                        <img
                          className="w-full h-full object-cover"
                          src={prod.image}
                          alt={prod.name}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-title-md text-title-md text-on-surface truncate font-semibold">
                          {prod.name}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          {prod.soldCount} terjual
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-label-md text-label-md text-on-surface font-bold">
                        {formatRupiah(revenue)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Section 2: Peringatan Stok Menipis */}
        <div className="bg-error-container/40 rounded-xl p-space-md shadow-xs border border-error-container/50 flex flex-col">
          <div className="flex items-center justify-between mb-space-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-[20px]">warning</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Peringatan Stok Menipis
              </h3>
            </div>
            <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-error text-on-error font-bold">
              {lowStockProducts.length} Item
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {products.length === 0 ? (
              <div className="p-3 bg-surface-container-lowest rounded-lg text-center text-xs text-on-surface-variant">
                Katalog produk masih kosong (0 Item). Silakan tambah produk baru di menu Produk.
              </div>
            ) : lowStockProducts.length === 0 ? (
              <div className="p-3 bg-surface-container-lowest rounded-lg text-center text-xs text-tertiary font-semibold">
                ✓ Semua stok produk saat ini dalam batas aman!
              </div>
            ) : (
              lowStockProducts.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-lowest shadow-xs border border-surface-container"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="font-title-md text-title-md text-on-surface truncate font-semibold">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-1.5 font-body-sm text-body-sm mt-0.5">
                      <span className="text-error font-bold">
                        Sisa {item.stock} {item.unit}
                      </span>
                      <span className="text-on-surface-variant">• Min: {item.minStock}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenRestock(item)}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md flex items-center gap-1 shadow-xs active:scale-95 transition-transform font-semibold cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_box</span>
                    <span>Restok</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 3: Laporan Singkat Kasir */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-surface-container flex flex-col mb-2">
          <div className="flex items-center justify-between mb-space-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">
                account_balance_wallet
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Laporan Singkat Kasir
              </h3>
            </div>
            <span className="font-label-sm text-label-sm text-tertiary font-bold">
              Seimbang
            </span>
          </div>

          {/* Split payment amounts */}
          <div className="grid grid-cols-2 gap-space-sm mb-space-md">
            <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Kas Tunai di Laci
              </span>
              <span className="font-title-md text-title-md text-on-surface font-bold mt-1">
                {formatRupiah(cashInDrawer)}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Modal awal: {formatRupiah(initialCash)}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Pembayaran QRIS
              </span>
              <span className="font-title-md text-title-md text-primary font-bold mt-1">
                {formatRupiah(qrisTotal)}
              </span>
              <span className="font-body-sm text-body-sm text-tertiary mt-0.5">
                Auto settlement
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-space-sm">
            <button
              onClick={() => onOpenDrawerModal('settle')}
              className="w-full py-2.5 px-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 active:bg-surface-container-high transition-colors font-semibold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">lock_clock</span>
              <span>Tutup / Setor</span>
            </button>
            <button
              onClick={() => onOpenDrawerModal('detail')}
              className="w-full py-2.5 px-2 rounded-lg bg-primary-fixed text-on-primary-fixed font-label-md text-label-md flex items-center justify-center gap-1.5 active:bg-primary-fixed-dim transition-colors font-semibold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Detail Kasir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Persistent Floating Hero Action */}
      <div className="sticky bottom-20 px-margin mt-space-sm z-30">
        <div className="rounded-xl bg-gradient-to-r from-primary to-primary-container p-3 shadow-lg flex items-center justify-between text-on-primary">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined text-[22px]">point_of_sale</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-md text-label-md text-on-primary font-bold truncate">
                Ada antrean pelanggan?
              </span>
              <span className="font-body-sm text-body-sm text-primary-fixed-dim truncate">
                Siap catat pesanan baru
              </span>
            </div>
          </div>
          <button
            onClick={onNavigateToKasir}
            className="shrink-0 px-4 py-2 rounded-lg bg-secondary-container text-on-secondary-container font-headline-sm text-headline-sm flex items-center gap-1 shadow-md active:scale-95 transition-transform font-bold cursor-pointer"
          >
            <span>Kasir</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
