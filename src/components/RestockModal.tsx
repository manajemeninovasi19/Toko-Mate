import React, { useState } from 'react';
import { Product } from '../types';
import { formatRupiah } from '../data/mockData';

interface RestockModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onRestock: (productId: string, addedStock: number) => void;
}

export const RestockModal: React.FC<RestockModalProps> = ({
  product,
  isOpen,
  onClose,
  onRestock,
}) => {
  const [amount, setAmount] = useState<number>(10);

  if (!isOpen || !product) return null;

  const handleConfirm = () => {
    if (amount > 0) {
      onRestock(product.id, amount);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-surface-container overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">add_box</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Restok Produk</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="py-4 flex flex-col gap-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low">
            <img
              src={product.image}
              alt={product.name}
              className="w-12 h-12 rounded-lg object-cover shrink-0 bg-white"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <p className="font-title-md text-on-surface truncate font-semibold">{product.name}</p>
              <div className="flex items-center gap-2 mt-0.5 text-xs">
                <span className="text-error font-bold">Sisa: {product.stock} {product.unit}</span>
                <span className="text-on-surface-variant">• Min: {product.minStock}</span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Modal: {formatRupiah(product.costPrice)} / {product.unit}
              </p>
            </div>
          </div>

          <div>
            <label className="font-label-md text-label-md text-on-surface-variant mb-1.5 block">
              Jumlah Pasokan Baru ({product.unit})
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAmount(Math.max(1, amount - 1))}
                className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-on-surface font-bold text-lg active:scale-95"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 h-11 text-center font-headline-md text-headline-md rounded-xl bg-surface-container-low border border-surface-container text-on-surface focus:outline-hidden focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setAmount(amount + 1)}
                className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-on-surface font-bold text-lg active:scale-95"
              >
                +
              </button>
            </div>

            <div className="flex items-center gap-2 mt-2">
              {[5, 10, 20, 50].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                    amount === preset
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-container-low text-on-surface border-surface-container hover:bg-surface-container'
                  }`}
                >
                  +{preset}
                </button>
              ))}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-surface-container-low text-xs text-on-surface-variant flex justify-between items-center">
            <span>Stok baru setelah restok:</span>
            <span className="font-bold text-primary text-sm">
              {product.stock + amount} {product.unit}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-low"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-semibold shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>Simpan Restok</span>
          </button>
        </div>
      </div>
    </div>
  );
};
