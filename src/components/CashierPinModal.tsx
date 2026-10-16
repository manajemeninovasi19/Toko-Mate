import React, { useState, useEffect, useCallback } from 'react';
import { Cashier } from '../types';

interface CashierPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCashier: Cashier | null;
  onSuccess: (cashierId: string) => void;
}

export const CashierPinModal: React.FC<CashierPinModalProps> = ({
  isOpen,
  onClose,
  targetCashier,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Reset PIN when modal opens or cashier changes
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMsg('');
      setIsShaking(false);
      setIsVerifying(false);
      setShowHint(false);
    }
  }, [isOpen, targetCashier]);

  const verifyPin = useCallback(
    (enteredPin: string) => {
      if (!targetCashier) return;

      setIsVerifying(true);
      setErrorMsg('');

      // Check entered PIN against target cashier's PIN
      const expectedPin = targetCashier.pin || '1234';

      if (enteredPin === expectedPin) {
        // Success
        setTimeout(() => {
          setIsVerifying(false);
          onSuccess(targetCashier.id);
          onClose();
        }, 300);
      } else {
        // Incorrect PIN
        setIsShaking(true);
        setErrorMsg('PIN yang Anda masukkan salah!');
        setIsVerifying(false);
        setTimeout(() => {
          setIsShaking(false);
          setPin('');
        }, 600);
      }
    },
    [targetCashier, onSuccess, onClose]
  );

  const handleKeyPress = (num: string) => {
    if (isVerifying || pin.length >= 4) return;
    const nextPin = pin + num;
    setPin(nextPin);
    if (nextPin.length === 4) {
      verifyPin(nextPin);
    }
  };

  const handleBackspace = () => {
    if (isVerifying) return;
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    if (isVerifying) return;
    setPin('');
    setErrorMsg('');
  };

  // Keyboard navigation support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pin, isVerifying, verifyPin, onClose]);

  if (!isOpen || !targetCashier) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fadeIn">
      <div
        className={`bg-surface-container-lowest rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-surface-container flex flex-col items-center text-center transition-transform ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Top Header */}
        <div className="w-full flex items-center justify-between pb-2 border-b border-surface-container">
          <div className="flex items-center gap-1.5 text-on-surface">
            <span className="material-symbols-outlined text-primary text-[20px]">lock</span>
            <span className="font-headline-sm text-xs font-bold uppercase tracking-wider">
              Otorisasi PIN Staf
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Target Staff Preview */}
        <div className="my-3 flex flex-col items-center">
          <div className="relative mb-2">
            <img
              src={targetCashier.avatar}
              alt={targetCashier.name}
              className="w-16 h-16 rounded-full object-cover ring-4 ring-primary/20 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 w-4.5 h-4.5 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px] font-bold shadow-xs">
              <span className="material-symbols-outlined text-[12px]">key</span>
            </span>
          </div>
          <h3 className="font-headline-md text-base font-bold text-on-surface">
            {targetCashier.name}
          </h3>
          <p className="text-xs text-primary font-semibold mt-0.5">
            {targetCashier.role} • {targetCashier.shift}
          </p>
          <p className="text-[11px] text-on-surface-variant mt-1">
            Masukkan 4-digit PIN untuk login &amp; mulai bertugas
          </p>
        </div>

        {/* 4-Digit PIN Indicators */}
        <div className="my-2 flex items-center justify-center gap-3">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-150 ${
                  isFilled
                    ? 'bg-primary scale-110 shadow-xs'
                    : 'border-2 border-slate-300 dark:border-slate-600 bg-transparent'
                }`}
              />
            );
          })}
        </div>

        {/* Error message */}
        {errorMsg ? (
          <div className="mt-1 mb-2 px-3 py-1 rounded-full bg-error-container/20 border border-error/30 text-error text-xs font-semibold flex items-center gap-1 animate-fadeIn">
            <span className="material-symbols-outlined text-[15px]">error</span>
            <span>{errorMsg}</span>
          </div>
        ) : (
          <div className="h-6 mt-1 mb-2 text-[11px] text-on-surface-variant flex items-center justify-center">
            {isVerifying ? (
              <span className="text-primary font-semibold animate-pulse">Memverifikasi PIN...</span>
            ) : (
              <span>Gunakan papan angka di bawah atau keyboard</span>
            )}
          </div>
        )}

        {/* Numpad Keypad */}
        <div className="w-full grid grid-cols-3 gap-2 px-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="h-12 rounded-xl bg-surface-container-low hover:bg-surface-container active:scale-95 text-on-surface font-headline-md text-lg font-bold transition-all shadow-xs border border-surface-container flex items-center justify-center cursor-pointer select-none"
            >
              {digit}
            </button>
          ))}

          {/* Clear button */}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-xl bg-surface-container hover:bg-surface-container-high active:scale-95 text-on-surface-variant text-xs font-bold transition-all flex items-center justify-center cursor-pointer select-none"
          >
            HAPUS
          </button>

          {/* Zero */}
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-12 rounded-xl bg-surface-container-low hover:bg-surface-container active:scale-95 text-on-surface font-headline-md text-lg font-bold transition-all shadow-xs border border-surface-container flex items-center justify-center cursor-pointer select-none"
          >
            0
          </button>

          {/* Backspace */}
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-xl bg-surface-container hover:bg-surface-container-high active:scale-95 text-on-surface-variant transition-all flex items-center justify-center cursor-pointer select-none"
            title="Hapus Satu Digit"
          >
            <span className="material-symbols-outlined text-[20px]">backspace</span>
          </button>
        </div>

        {/* Quick Hint / PIN Recovery */}
        <div className="w-full mt-3 pt-2 border-t border-surface-container text-center">
          <button
            type="button"
            onClick={() => setShowHint((prev) => !prev)}
            className="text-[11px] text-primary hover:underline font-semibold flex items-center justify-center gap-1 mx-auto cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">help</span>
            <span>{showHint ? 'Sembunyikan Petunjuk' : 'Lupa PIN Staf?'}</span>
          </button>

          {showHint && (
            <div className="mt-2 p-2.5 rounded-xl bg-primary/5 border border-primary/20 text-[11px] text-on-surface text-left animate-fadeIn">
              <p className="font-bold text-primary mb-1">Daftar PIN Bawaan Staf:</p>
              <ul className="space-y-0.5 text-on-surface-variant">
                <li>• Budi Santoso: <code className="font-bold text-on-surface bg-surface-container px-1 rounded">1234</code></li>
                <li>• Siti Aminah: <code className="font-bold text-on-surface bg-surface-container px-1 rounded">2345</code></li>
                <li>• Ahmad Fauzi: <code className="font-bold text-on-surface bg-surface-container px-1 rounded">3456</code></li>
              </ul>
              <p className="text-[10px] text-on-surface-variant mt-1.5 italic">
                *PIN dapat diubah di menu Pengaturan &gt; Manajemen Kasir
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
