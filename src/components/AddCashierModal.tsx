import React, { useState, useRef } from 'react';
import { Cashier } from '../types';

interface AddCashierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCashier: (cashier: Cashier) => void;
}

const CASHIER_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
];

export const AddCashierModal: React.FC<AddCashierModalProps> = ({
  isOpen,
  onClose,
  onAddCashier,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [shift, setShift] = useState<Cashier['shift']>('Shift 1 (Pagi)');
  const [role, setRole] = useState<Cashier['role']>('Kasir');
  const [selectedAvatar, setSelectedAvatar] = useState(CASHIER_AVATARS[0]);
  const [avatarMode, setAvatarMode] = useState<'gallery' | 'preset'>('gallery');
  const [uploadError, setUploadError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setUploadError('Mohon pilih file gambar yang valid (JPG, PNG, WEBP)');
        setTimeout(() => setUploadError(''), 2500);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCashier: Cashier = {
      id: `kasir-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim() || '0812-0000-0000',
      role,
      shift,
      avatar: selectedAvatar,
      isActive: false,
    };

    onAddCashier(newCashier);
    onClose();

    // Reset
    setName('');
    setPhone('');
    setSelectedAvatar(CASHIER_AVATARS[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-surface-container overflow-hidden max-h-[92vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">person_add</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Tambah Kasir Baru
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
          {/* Avatar Selector with Gallery Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-on-surface">Foto Kasir:</label>
              <div className="flex gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setAvatarMode('gallery')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    avatarMode === 'gallery'
                      ? 'bg-primary text-on-primary font-bold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Galeri HP / File
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarMode('preset')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    avatarMode === 'preset'
                      ? 'bg-primary text-on-primary font-bold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Pilihan Avatar
                </button>
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleGalleryUpload}
              className="hidden"
            />

            {avatarMode === 'gallery' ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low border border-dashed border-primary/40">
                <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 ring-2 ring-primary/30 bg-surface-container">
                  <img
                    src={selectedAvatar}
                    alt="Foto Kasir"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-transform cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">photo_library</span>
                    <span>Pilih Foto dari Galeri</span>
                  </button>
                  <span className="text-[10px] text-on-surface-variant">
                    Bisa unggah foto diri dari kamera atau galeri file
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-surface-container-low">
                {CASHIER_AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`relative w-10 h-10 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedAvatar === av
                        ? 'border-primary ring-2 ring-primary/40 scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={av} alt="Avatar" className="w-full h-full object-cover" />
                    {selectedAvatar === av && (
                      <span className="absolute inset-0 bg-primary/30 flex items-center justify-center text-white font-bold text-xs">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {uploadError && (
              <p className="text-[10px] text-error font-semibold mt-1">{uploadError}</p>
            )}
          </div>

          <div>
            <label className="font-semibold text-on-surface mb-1 block">Nama Lengkap Kasir</label>
            <input
              type="text"
              required
              placeholder="cth: Rudi Hermawan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-on-surface focus:outline-hidden focus:border-primary text-xs"
            />
          </div>

          <div>
            <label className="font-semibold text-on-surface mb-1 block">No. WhatsApp / HP</label>
            <input
              type="text"
              placeholder="cth: 0812-3456-7890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-on-surface focus:outline-hidden focus:border-primary text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-on-surface mb-1 block">Shift Kerja</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as any)}
                className="w-full px-2.5 py-2 rounded-xl bg-surface-container-low border border-surface-container text-on-surface text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="Shift 1 (Pagi)">Shift 1 (Pagi)</option>
                <option value="Shift 2 (Siang)">Shift 2 (Siang)</option>
                <option value="Shift 3 (Malam)">Shift 3 (Malam)</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-on-surface mb-1 block">Peran / Jabatan</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-2.5 py-2 rounded-xl bg-surface-container-low border border-surface-container text-on-surface text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="Kasir">Kasir</option>
                <option value="Kasir Kepala">Kasir Kepala</option>
                <option value="Kasir Pengganti">Kasir Pengganti</option>
              </select>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-surface-container-low text-[11px] text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
            <span>Kasir baru akan otomatis tercatat dan dapat dipilih kapan saja.</span>
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
              Simpan Kasir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
