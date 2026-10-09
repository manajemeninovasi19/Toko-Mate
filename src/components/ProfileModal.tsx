import React from 'react';
import { Cashier } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashiers: Cashier[];
  activeCashier: Cashier;
  onSelectActiveCashier: (cashierId: string) => void;
  onOpenAddCashier: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  cashiers,
  activeCashier,
  onSelectActiveCashier,
  onOpenAddCashier,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-surface-container overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
            Profil &amp; Kasir Aktif
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="py-3 flex flex-col items-center text-center overflow-y-auto no-scrollbar">
          {/* Active Cashier Highlight */}
          <div className="relative mb-2">
            <img
              src={activeCashier.avatar}
              alt={activeCashier.name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-primary/20 shadow-md"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-tertiary border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
              ✓
            </span>
          </div>

          <h4 className="font-headline-md text-headline-md text-on-surface font-bold">
            {activeCashier.name}
          </h4>
          <p className="text-xs text-primary font-semibold mt-0.5">
            {activeCashier.role} • Toko Berkah Abadi
          </p>

          <div className="w-full mt-3 p-3 rounded-xl bg-surface-container-low text-left flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant">Shift Kerja:</span>
              <span className="font-bold text-on-surface">{activeCashier.shift}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant">No. WhatsApp:</span>
              <span className="font-bold text-on-surface">{activeCashier.phone}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant">Printer Bluetooth:</span>
              <span className="font-bold text-tertiary">RP-58A Thermal (Siap)</span>
            </div>
          </div>

          {/* Quick Switcher among all registered cashiers */}
          <div className="w-full mt-4 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-on-surface">Pilih Kasir Bertugas:</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAddCashier();
                }}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
                <span>Tambah Kasir</span>
              </button>
            </div>

            <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
              {cashiers.map((c) => {
                const isActive = c.id === activeCashier.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelectActiveCashier(c.id)}
                    className={`p-2 rounded-xl flex items-center justify-between text-left transition-all border cursor-pointer ${
                      isActive
                        ? 'bg-primary/10 border-primary'
                        : 'bg-surface-container-low border-surface-container hover:bg-surface-container'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-on-surface truncate">{c.name}</p>
                        <p className="text-[10px] text-on-surface-variant truncate">{c.shift}</p>
                      </div>
                    </div>

                    {isActive ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-on-primary">
                        Aktif
                      </span>
                    ) : (
                      <span className="text-[10px] text-on-surface-variant font-medium">
                        Pilih
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-surface-container flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl border border-surface-container text-on-surface font-label-md text-xs font-semibold hover:bg-surface-container-low cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
