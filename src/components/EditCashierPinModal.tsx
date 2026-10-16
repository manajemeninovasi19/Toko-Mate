import React, { useState } from 'react';
import { Cashier } from '../types';

interface EditCashierPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashier: Cashier | null;
  onSavePin: (cashierId: string, newPin: string) => void;
}

export const EditCashierPinModal: React.FC<EditCashierPinModalProps> = ({
  isOpen,
  onClose,
  cashier,
  onSavePin,
}) => {
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen || !cashier) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanPin = newPin.trim();
    if (!/^\d{4,6}$/.test(cleanPin)) {
      setErrorMsg('PIN harus terdiri dari 4 hingga 6 digit angka');
      return;
    }

    if (cleanPin !== confirmPin.trim()) {
      setErrorMsg('Konfirmasi PIN tidak cocok');
      return;
    }

    onSavePin(cashier.id, cleanPin);
    onClose();
    setNewPin('');
    setConfirmPin('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-surface-container flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">pin</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                Ubah PIN Staf Kasir
              </h3>
              <p className="text-[11px] text-on-surface-variant">Atur sandi keamanan baru</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Staff Information */}
        <div className="my-3 p-3 rounded-xl bg-surface-container-low flex items-center gap-3">
          <img
            src={cashier.avatar}
            alt={cashier.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-surface-container"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-xs text-on-surface truncate">{cashier.name}</h4>
            <p className="text-[11px] text-primary font-semibold">{cashier.role} • {cashier.shift}</p>
            <p className="text-[10px] text-on-surface-variant font-mono">
              PIN Saat Ini: <span className="font-bold text-on-surface">{cashier.pin || '1234'}</span>
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
          <div>
            <label className="font-semibold text-on-surface mb-1 block">
              PIN Baru (4 Digit Angka):
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                autoFocus
                placeholder="cth: 1234"
                value={newPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setNewPin(val);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-on-surface font-mono tracking-widest text-sm focus:outline-hidden focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="font-semibold text-on-surface mb-1 block">
              Ulangi PIN Baru:
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              required
              placeholder="Ketik ulang PIN baru"
              value={confirmPin}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setConfirmPin(val);
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-surface-container text-on-surface font-mono tracking-widest text-sm focus:outline-hidden focus:border-primary"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-error font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMsg}</span>
            </p>
          )}

          <div className="p-2.5 rounded-xl bg-primary/5 text-[11px] text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">shield</span>
            <span>PIN ini akan diminta setiap kali beralih ke staf ini.</span>
          </div>

          <div className="flex gap-2 pt-2 border-t border-surface-container mt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-surface-container text-xs font-semibold cursor-pointer hover:bg-surface-container-low"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md cursor-pointer active:scale-95 transition-transform"
            >
              Simpan PIN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
