import React from 'react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction?: (action: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: '1',
      title: 'Peringatan Stok Menipis',
      desc: 'Minyak Goreng 1L sisa 3 bungkus (batas aman: 10). Harap segera restok.',
      time: '15 menit lalu',
      type: 'warning',
      action: 'restock_minyak',
      actionLabel: 'Restok Sekarang'
    },
    {
      id: '2',
      title: 'Peringatan Stok Menipis',
      desc: 'Telur Ayam 1kg sisa 2 kg (batas aman: 5).',
      time: '45 menit lalu',
      type: 'warning',
      action: 'restock_telur',
      actionLabel: 'Restok Sekarang'
    },
    {
      id: '3',
      title: 'Settlement QRIS Berhasil',
      desc: 'Dana Rp 7.222.000 telah otomatis masuk ke rekening Bank BCA Toko Berkah Abadi.',
      time: '08:00 WIB',
      type: 'success',
    },
    {
      id: '4',
      title: 'Shift 1 Dimulai',
      desc: 'Kasir Budi Santoso membuka kasir dengan modal awal laci Rp 200.000.',
      time: '07:30 WIB',
      type: 'info',
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-surface-container overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Pemberitahuan</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="py-3 flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto no-scrollbar">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border transition-colors ${
                item.type === 'warning'
                  ? 'bg-error-container/20 border-error-container/50'
                  : item.type === 'success'
                  ? 'bg-tertiary-container/10 border-tertiary-container/30'
                  : 'bg-surface-container-low border-surface-container'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className={`text-xs font-bold ${
                  item.type === 'warning' ? 'text-error' : item.type === 'success' ? 'text-tertiary' : 'text-primary'
                }`}>
                  {item.title}
                </span>
                <span className="text-[10px] text-on-surface-variant whitespace-nowrap">{item.time}</span>
              </div>
              <p className="text-xs text-on-surface leading-relaxed mb-2">{item.desc}</p>
              {item.actionLabel && (
                <button
                  onClick={() => {
                    if (onSelectAction && item.action) onSelectAction(item.action);
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-secondary text-on-secondary font-label-sm text-[11px] font-semibold active:scale-95"
                >
                  {item.actionLabel}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-surface-container">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
