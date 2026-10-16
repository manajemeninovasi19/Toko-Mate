import React from 'react';

export type TabKey = 'beranda' | 'kasir' | 'produk' | 'laporan' | 'lainnya';

interface BottomNavProps {
  currentTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  cartItemCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  cartItemCount = 0,
}) => {
  const tabs = [
    { key: 'beranda' as TabKey, label: 'Beranda', icon: 'home' },
    { key: 'kasir' as TabKey, label: 'Kasir', icon: 'point_of_sale', badge: cartItemCount > 0 },
    { key: 'produk' as TabKey, label: 'Produk', icon: 'inventory_2' },
    { key: 'laporan' as TabKey, label: 'Laporan', icon: 'monitoring' },
    { key: 'lainnya' as TabKey, label: 'Lainnya', icon: 'grid_view' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_-4px_16px_0_rgba(15,23,42,0.06)] border-t border-surface-container">
      <div className="max-w-2xl mx-auto flex justify-between items-center h-16 px-space-xs">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all min-w-[56px] select-none ${
                isActive
                  ? 'text-primary font-label-md font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <span
                  className={`material-symbols-outlined text-[24px] transition-transform ${
                    isActive ? 'scale-110 font-bold' : ''
                  }`}
                >
                  {tab.icon}
                </span>
                {tab.badge && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
                )}
              </div>
              <span className="font-label-sm text-label-sm">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-6 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
