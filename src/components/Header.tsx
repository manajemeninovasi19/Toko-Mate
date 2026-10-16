import React from 'react';
import { LOGO_URL, AVATAR_URL } from '../data/mockData';
import { UserAccount } from '../types';

interface HeaderProps {
  currentTab: string;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  storeStatus: 'open' | 'closed';
  onToggleStoreStatus: () => void;
  cashierName?: string;
  cashierAvatar?: string;
  currentUser?: UserAccount;
  onOpenGoogleAuth?: () => void;
  onOpenSupabase?: () => void;
  isSupabaseConnected?: boolean;
  storeName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenProfile,
  storeStatus,
  onToggleStoreStatus,
  cashierName = 'Budi Santoso',
  cashierAvatar = AVATAR_URL,
  currentUser,
  onOpenGoogleAuth,
  onOpenSupabase,
  isSupabaseConnected = false,
  storeName = 'Toko Berkah Jaya',
}) => {
  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'beranda': return 'Beranda';
      case 'kasir': return 'Kasir POS';
      case 'produk': return 'Katalog Produk';
      case 'laporan': return 'Laporan Penjualan';
      case 'lainnya': return 'Pengaturan Toko';
      default: return 'Beranda';
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
      <div className="max-w-2xl mx-auto h-16 px-margin flex items-center justify-between gap-space-xs sm:gap-space-sm">
        {/* Brand & Store Info */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <img
            alt="TokoMate Logo"
            className="h-8 w-auto object-contain shrink-0"
            src={LOGO_URL}
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-label-md text-label-md text-on-surface truncate font-semibold">
                {storeName}
              </span>
              <button
                onClick={onToggleStoreStatus}
                title="Klik untuk ubah status toko"
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-label-sm text-[10px] leading-none shrink-0 transition-colors cursor-pointer ${
                  storeStatus === 'open'
                    ? 'bg-tertiary-container/15 text-tertiary hover:bg-tertiary-container/25'
                    : 'bg-error-container text-error hover:bg-error-container/80'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${storeStatus === 'open' ? 'bg-tertiary animate-pulse' : 'bg-error'}`} />
                {storeStatus === 'open' ? 'Buka' : 'Tutup'}
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant truncate">
              <span>{getTabLabel(currentTab)}</span>
              {currentUser && (
                <>
                  <span className="text-slate-300">•</span>
                  <button
                    onClick={onOpenGoogleAuth}
                    title="Ganti Akun Google Toko (Multi-Tenant)"
                    className="text-[10px] text-primary hover:underline font-mono truncate max-w-[130px] flex items-center gap-1 cursor-pointer"
                  >
                    <svg className="w-2.5 h-2.5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span className="truncate">{currentUser.email.split('@')[0]}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Auto-Save Status Badge */}
          <div
            title="Penyimpanan otomatis aktif. Semua transaksi & laporan tersimpan di browser dan tidak akan hilang saat di-refresh."
            className="h-8 px-2.5 rounded-full flex items-center gap-1.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 select-none shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">Tersimpan Otomatis</span>
          </div>

          {/* Google Auth Switcher Button */}
          {currentUser && onOpenGoogleAuth && (
            <button
              onClick={onOpenGoogleAuth}
              title={`Akun Google: ${currentUser.email} (Klik untuk ganti toko)`}
              className="flex items-center gap-1 p-1 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            >
              <img
                src={currentUser.picture}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-primary/40"
                referrerPolicy="no-referrer"
              />
            </button>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={onOpenNotifications}
              aria-label="Notifikasi"
              className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 flex h-3.5 min-w-[14px] px-0.5 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-[9px] leading-none pointer-events-none shadow-xs font-bold">
                {unreadNotificationsCount}
              </span>
            )}
          </div>

          {/* Cashier Profile */}
          <button
            onClick={onOpenProfile}
            className="flex items-center pl-0.5 focus:outline-hidden active:scale-95 transition-transform cursor-pointer"
            aria-label={`Profil Kasir ${cashierName}`}
            title={`Kasir Bertugas: ${cashierName}`}
          >
            <img
              alt={`${cashierName} Profile`}
              className="w-7 h-7 rounded-full object-cover shadow-[0_1px_4px_rgba(0,0,0,0.08)] ring-2 ring-slate-300 hover:ring-primary transition-all"
              src={cashierAvatar}
              referrerPolicy="no-referrer"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
