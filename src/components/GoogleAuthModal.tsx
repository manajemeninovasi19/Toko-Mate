import React, { useState } from 'react';
import { UserAccount } from '../types';
import { getRegisteredAccounts, createGoogleAccount, setCurrentUser } from '../services/authService';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onSwitchUser: (newUser: UserAccount) => void;
  onRequestDeleteAccount?: (account: UserAccount) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSwitchUser,
  onRequestDeleteAccount,
}) => {
  const [accounts, setAccounts] = useState<UserAccount[]>(getRegisteredAccounts());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newStoreName, setNewStoreName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSelectAccount = (acc: UserAccount) => {
    setCurrentUser(acc);
    onSwitchUser(acc);
    onClose();
  };

  const handleAddNewGoogleAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      setErrorMsg('Masukkan alamat email Google yang valid (contoh: tokosaya@gmail.com)');
      return;
    }

    const created = createGoogleAccount(newEmail, newName, newStoreName);
    setAccounts(getRegisteredAccounts());
    setShowAddForm(false);
    setNewEmail('');
    setNewName('');
    setNewStoreName('');
    setErrorMsg('');
    onSwitchUser(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-5 shadow-2xl border border-surface-container overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white shadow-xs flex items-center justify-center border border-slate-200">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                Akun Google &amp; Multi-Tenant
              </h3>
              <p className="text-[11px] text-on-surface-variant">Pemisahan data toko otomatis per akun</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="py-3 overflow-y-auto no-scrollbar flex flex-col gap-3">
          {/* Active Tenant Box */}
          <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
            <img
              src={currentUser.picture}
              alt={currentUser.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/30 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-on-surface truncate">{currentUser.name}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold shrink-0">
                  Aktif Bertugas
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant truncate font-mono">{currentUser.email}</p>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-primary font-semibold">
                <span>🏬 {currentUser.storeName || 'Toko Anda'}</span>
                <span>•</span>
                <span className="font-mono text-slate-500">{currentUser.tenantId}</span>
              </div>
            </div>

            {onRequestDeleteAccount && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRequestDeleteAccount(currentUser);
                }}
                className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-xl transition-colors cursor-pointer shrink-0"
                title="Hapus Akun Ini & Seluruh Data Toko"
              >
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
            )}
          </div>

          {/* Multi-Tenant Explanation */}
          <div className="p-2.5 rounded-lg bg-surface-container-low text-[11px] text-on-surface-variant leading-relaxed flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">verified_user</span>
            <div>
              <p className="font-semibold text-on-surface text-xs mb-0.5">Penyimpanan Terisolasi (Multi-Tenant)</p>
              Setiap akun Google memiliki data toko, inventaris, kasir, dan laporan transaksi yang sepenuhnya terpisah. Saat halaman di-refresh, data otomatis dimuat kembali tanpa hilang.
            </div>
          </div>

          {/* Switch Accounts List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-on-surface">Pilih / Ganti Akun Google Toko:</span>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {showAddForm ? 'close' : 'person_add'}
                </span>
                <span>{showAddForm ? 'Batal' : '+ Masuk Akun Lain'}</span>
              </button>
            </div>

            {/* Add New Account Form */}
            {showAddForm && (
              <form onSubmit={handleAddNewGoogleAccount} className="p-3 mb-2.5 rounded-xl bg-surface-container border border-surface-container-high flex flex-col gap-2 animate-fadeIn">
                <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                  <span className="material-symbols-outlined text-[16px] text-primary">add_circle</span>
                  <span>Masuk dengan Akun Google Baru</span>
                </div>
                {errorMsg && (
                  <p className="text-[11px] text-error font-medium">{errorMsg}</p>
                )}
                <div>
                  <label className="text-[10px] text-on-surface-variant font-semibold">Email Google</label>
                  <input
                    type="email"
                    required
                    placeholder="nama.toko@gmail.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-surface-container-lowest border border-surface-container-high focus:outline-hidden focus:border-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-on-surface-variant font-semibold">Nama Pemilik</label>
                    <input
                      type="text"
                      placeholder="Contoh: Rian"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg bg-surface-container-lowest border border-surface-container-high focus:outline-hidden focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-on-surface-variant font-semibold">Nama Toko Baru</label>
                    <input
                      type="text"
                      placeholder="Contoh: Toko Rian 2"
                      value={newStoreName}
                      onChange={(e) => setNewStoreName(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg bg-surface-container-lowest border border-surface-container-high focus:outline-hidden focus:border-primary"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-1 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary-dim transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">login</span>
                  <span>Masuk &amp; Buat Ruang Toko Baru (Mulai Rp 0)</span>
                </button>
              </form>
            )}

            {/* List of registered accounts */}
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto no-scrollbar">
              {accounts.map((acc) => {
                const isActive = acc.email.toLowerCase() === currentUser.email.toLowerCase();
                return (
                  <div
                    key={acc.id}
                    className={`p-2.5 rounded-xl flex items-center justify-between text-left transition-all border ${
                      isActive
                        ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
                        : 'bg-surface-container-lowest border-surface-container hover:bg-surface-container-low text-on-surface'
                    }`}
                  >
                    <div
                      onClick={() => handleSelectAccount(acc)}
                      className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                    >
                      <img
                        src={acc.picture}
                        alt={acc.name}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold truncate text-on-surface">{acc.name}</p>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-on-surface-variant font-mono truncate">{acc.email}</p>
                        <p className="text-[10px] text-slate-500 truncate">{acc.storeName || 'Toko'}</p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {!isActive ? (
                        <button
                          type="button"
                          onClick={() => handleSelectAccount(acc)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface cursor-pointer"
                        >
                          Pilih
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-primary flex items-center gap-0.5 px-1.5">
                          <span className="material-symbols-outlined text-[15px]">check_circle</span>
                          <span>Dipakai</span>
                        </span>
                      )}

                      {onRequestDeleteAccount && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                            onRequestDeleteAccount(acc);
                          }}
                          className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg cursor-pointer transition-colors"
                          title={`Hapus Akun ${acc.email}`}
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-surface-container flex justify-between items-center text-xs">
          <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Multi-Tenant Online</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-semibold hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
