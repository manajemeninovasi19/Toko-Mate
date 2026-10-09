import React from 'react';
import { LOGO_URL, AVATAR_URL } from '../data/mockData';

interface HeaderProps {
  currentTab: string;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  storeStatus: 'open' | 'closed';
  onToggleStoreStatus: () => void;
  cashierName?: string;
  cashierAvatar?: string;
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
      <div className="max-w-2xl mx-auto h-16 px-margin flex items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm min-w-0 flex-1">
          <img
            alt="TokoMate Logo"
            className="h-8 w-auto object-contain shrink-0"
            src={LOGO_URL}
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-label-md text-label-md text-on-surface truncate font-semibold">
                Toko Berkah Jaya
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
            <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
              {getTabLabel(currentTab)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-space-xs shrink-0">
          <div className="relative">
            <button
              onClick={onOpenNotifications}
              aria-label="Notifikasi"
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
            </button>
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-[10px] leading-none pointer-events-none shadow-xs font-bold">
                {unreadNotificationsCount}
              </span>
            )}
          </div>

          <button
            onClick={onOpenProfile}
            className="flex items-center pl-1 focus:outline-hidden active:scale-95 transition-transform cursor-pointer"
            aria-label={`Profil Kasir ${cashierName}`}
            title={`Kasir Aktif: ${cashierName}`}
          >
            <img
              alt={`${cashierName} Profile`}
              className="w-8 h-8 rounded-full object-cover shadow-[0_1px_4px_rgba(0,0,0,0.08)] ring-2 ring-primary/20 hover:ring-primary transition-all"
              src={cashierAvatar}
              referrerPolicy="no-referrer"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
