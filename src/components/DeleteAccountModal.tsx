import React, { useState, useEffect } from 'react';
import { UserAccount } from '../types';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: UserAccount | null;
  onConfirmDelete: (account: UserAccount) => void;
  isCurrentActiveAccount?: boolean;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  account,
  onConfirmDelete,
  isCurrentActiveAccount = false,
}) => {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfirmationInput('');
      setIsDeleting(false);
    }
  }, [isOpen, account]);

  if (!isOpen || !account) return null;

  const isConfirmed = confirmationInput.trim().toUpperCase() === 'HAPUS';

  const handleDelete = () => {
    if (!isConfirmed || isDeleting) return;
    setIsDeleting(true);
    setTimeout(() => {
      onConfirmDelete(account);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-error/20 flex flex-col max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Warning Icon & Title */}
        <div className="flex items-center gap-3 pb-3 border-b border-surface-container">
          <div className="w-10 h-10 rounded-full bg-error-container text-error flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">delete_forever</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-headline-sm text-sm font-bold text-error">
              Hapus Akun &amp; Data Toko
            </h3>
            <p className="text-[11px] text-on-surface-variant">Tindakan permanen dan tidak dapat dibatalkan</p>
          </div>
        </div>

        {/* Account to Delete Preview */}
        <div className="my-3 p-3 rounded-xl bg-error/5 border border-error/20 flex items-center gap-3">
          <img
            src={account.picture}
            alt={account.name}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-error/30 shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-on-surface truncate">{account.name}</span>
              {isCurrentActiveAccount && (
                <span className="px-1.5 py-0.2 rounded-full bg-error/15 text-error text-[9px] font-bold shrink-0">
                  Sedang Aktif
                </span>
              )}
            </div>
            <p className="text-[10px] text-on-surface-variant font-mono truncate">{account.email}</p>
            <p className="text-[10px] text-error font-semibold mt-0.5 truncate">
              {account.storeName || 'Toko'} ({account.tenantId})
            </p>
          </div>
        </div>

        {/* Danger Bullet Points */}
        <div className="p-3 rounded-xl bg-surface-container-low text-[11px] text-on-surface-variant flex flex-col gap-1.5 leading-relaxed">
          <p className="font-bold text-on-surface text-xs text-error flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">warning</span>
            <span>Konsekuensi Penghapusan Akun:</span>
          </p>
          <ul className="space-y-1 pl-1">
            <li className="flex items-start gap-1.5">
              <span className="text-error font-bold">•</span>
              <span>Seluruh <strong>riwayat transaksi &amp; laporan keuangan</strong> toko ini akan dihapus bersih.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-error font-bold">•</span>
              <span>Seluruh <strong>katalog produk, stok, dan harga modal</strong> akan terhapus.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-error font-bold">•</span>
              <span>Daftar <strong>kasir, PIN staf, dan profil toko</strong> akan dimusnahkan dari browser ini.</span>
            </li>
          </ul>
        </div>

        {/* Type "HAPUS" confirmation */}
        <div className="mt-3">
          <label className="text-[11px] text-on-surface font-semibold block mb-1">
            Ketik kata <span className="font-bold text-error uppercase font-mono px-1 bg-error-container/20 rounded">HAPUS</span> di bawah untuk mengonfirmasi:
          </label>
          <input
            type="text"
            autoFocus
            placeholder="Ketik HAPUS"
            value={confirmationInput}
            onChange={(e) => setConfirmationInput(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-surface-container-low border border-surface-container focus:outline-hidden focus:border-error uppercase font-mono text-center tracking-wider text-error"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t border-surface-container mt-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl border border-surface-container text-xs font-semibold cursor-pointer hover:bg-surface-container-low"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1 ${
              isConfirmed && !isDeleting
                ? 'bg-error text-on-error cursor-pointer active:scale-95'
                : 'bg-surface-container text-on-surface-variant opacity-50 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isDeleting ? 'hourglass_top' : 'delete'}
            </span>
            <span>{isDeleting ? 'Menghapus...' : 'Hapus Akun'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
