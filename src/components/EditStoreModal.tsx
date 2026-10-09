import React, { useState } from 'react';
import { StoreInfo } from '../types';

interface EditStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeInfo: StoreInfo;
  onSaveStoreInfo: (info: StoreInfo) => void;
}

export const EditStoreModal: React.FC<EditStoreModalProps> = ({
  isOpen,
  onClose,
  storeInfo,
  onSaveStoreInfo,
}) => {
  const [name, setName] = useState(storeInfo.name);
  const [address, setAddress] = useState(storeInfo.address);
  const [phone, setPhone] = useState(storeInfo.phone);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveStoreInfo({
      ...storeInfo,
      name: name.trim(),
      subName: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-surface-container overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">storefront</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Ubah Informasi Toko
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-3 flex flex-col gap-3 text-xs">
          <div>
            <label className="font-semibold text-on-surface mb-1 block">Nama Toko</label>
            <input
              type="text"
              required
              placeholder="cth: Toko Berkah Abadi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-on-surface focus:outline-hidden focus:border-primary text-xs"
            />
          </div>

          <div>
            <label className="font-semibold text-on-surface mb-1 block">Alamat Lengkap Toko</label>
            <textarea
              required
              rows={2}
              placeholder="cth: Jl. Pahlawan No. 28, Surabaya"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-on-surface focus:outline-hidden focus:border-primary text-xs resize-none"
            />
          </div>

          <div>
            <label className="font-semibold text-on-surface mb-1 block">Nomor Telepon / WhatsApp</label>
            <input
              type="text"
              required
              placeholder="cth: 0812-3456-7890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-on-surface focus:outline-hidden focus:border-primary text-xs"
            />
          </div>

          <div className="p-2.5 rounded-xl bg-surface-container-low text-[11px] text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">receipt_long</span>
            <span>Nama dan alamat ini akan tercetak otomatis di header struk kasir pelanggan.</span>
          </div>

          <div className="flex gap-2 pt-2 border-t border-surface-container mt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-surface-container text-xs font-semibold cursor-pointer hover:bg-surface-container-low"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md cursor-pointer active:scale-95 transition-transform"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
