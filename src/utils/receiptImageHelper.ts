import QRCode from 'qrcode';
import { Transaction, StoreInfo } from '../types';
import { formatRupiah } from '../data/mockData';

export interface GeneratedReceipt {
  canvas: HTMLCanvasElement;
  dataUrl: string;
  blob: Blob;
  file: File;
}

/**
 * Generates an ultra-crisp, realistic thermal receipt image as an HTMLCanvasElement
 */
export async function generateReceiptCanvas(
  transaction: Transaction,
  storeInfo: StoreInfo = {
    name: 'TOKO BERKAH ABADI',
    subName: 'Toko Berkah Jaya',
    address: 'Jl. Pahlawan No. 28, Surabaya',
    phone: '0812-3456-7890',
  }
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  // Thermal receipt dimensions (approx 58mm / 80mm paper ratio)
  const scale = 2; // 2x retina sharpness
  const baseWidth = 420;
  
  // Calculate dynamic height based on content
  const headerHeight = 110;
  const metaHeight = 70;
  const itemsHeight = Math.max(1, transaction.items.length) * 36 + 20;
  const totalsHeight = 110 + (transaction.paymentMethod === 'cash' ? 44 : 0);
  const qrSectionHeight = 130;
  const footerHeight = 85;
  const padding = 24;

  const baseHeight = headerHeight + metaHeight + itemsHeight + totalsHeight + qrSectionHeight + footerHeight + (padding * 2);

  canvas.width = baseWidth * scale;
  canvas.height = baseHeight * scale;
  ctx.scale(scale, scale);

  // Background - realistic clean paper with subtle warm tone
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, baseWidth, baseHeight);

  // Subtle outer border
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, baseWidth, baseHeight);

  // Serrated / Perforated paper tear decoration at top & bottom
  const drawTearPattern = (yPos: number, pointingDown: boolean) => {
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    const toothWidth = 14;
    const toothHeight = 5;
    const teethCount = Math.ceil(baseWidth / toothWidth);
    ctx.moveTo(0, yPos);
    for (let i = 0; i < teethCount; i++) {
      const x = i * toothWidth;
      const midX = x + toothWidth / 2;
      const endX = x + toothWidth;
      const peakY = pointingDown ? yPos + toothHeight : yPos - toothHeight;
      ctx.lineTo(midX, peakY);
      ctx.lineTo(endX, yPos);
    }
    ctx.lineTo(baseWidth, pointingDown ? 0 : baseHeight);
    ctx.lineTo(0, pointingDown ? 0 : baseHeight);
    ctx.closePath();
    ctx.fill();
  };

  drawTearPattern(6, true);
  drawTearPattern(baseHeight - 6, false);

  let currentY = padding + 10;

  // Helper for dashed lines
  const drawDashedLine = (y: number, color = '#cbd5e1') => {
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.moveTo(padding, y);
    ctx.lineTo(baseWidth - padding, y);
    ctx.stroke();
    ctx.restore();
  };

  // --- 1. STORE HEADER ---
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px "Courier New", Courier, monospace';
  ctx.fillText(storeInfo.name.toUpperCase(), baseWidth / 2, currentY);
  currentY += 20;

  if (storeInfo.subName && storeInfo.subName !== storeInfo.name) {
    ctx.fillStyle = '#475569';
    ctx.font = '12px "Courier New", Courier, monospace';
    ctx.fillText(storeInfo.subName, baseWidth / 2, currentY);
    currentY += 16;
  }

  ctx.fillStyle = '#64748b';
  ctx.font = '11px "Courier New", Courier, monospace';
  ctx.fillText(storeInfo.address, baseWidth / 2, currentY);
  currentY += 15;
  ctx.fillText(`Telp/WA: ${storeInfo.phone}`, baseWidth / 2, currentY);
  currentY += 18;

  drawDashedLine(currentY);
  currentY += 16;

  // --- 2. TRANSACTION METADATA ---
  ctx.font = '11px "Courier New", Courier, monospace';
  ctx.fillStyle = '#334155';
  
  // Row 1: No Struk & Tanggal
  ctx.textAlign = 'left';
  ctx.fillText(`No: ${transaction.receiptNo}`, padding, currentY);
  ctx.textAlign = 'right';
  ctx.fillText(transaction.timestamp, baseWidth - padding, currentY);
  currentY += 18;

  // Row 2: Kasir & Pelanggan
  ctx.textAlign = 'left';
  ctx.fillText(`Kasir    : ${transaction.cashierName}`, padding, currentY);
  ctx.textAlign = 'right';
  ctx.fillText(`Pelanggan: ${transaction.customerName || 'Umum'}`, baseWidth - padding, currentY);
  currentY += 18;

  drawDashedLine(currentY);
  currentY += 18;

  // --- 3. ITEMS LIST ---
  transaction.items.forEach((item) => {
    // Product name
    ctx.textAlign = 'left';
    ctx.font = 'bold 12px "Courier New", Courier, monospace';
    ctx.fillStyle = '#0f172a';
    
    // Trim if too long
    const maxChars = 32;
    const name = item.product.name.length > maxChars 
      ? item.product.name.slice(0, maxChars - 2) + '..' 
      : item.product.name;
    ctx.fillText(name, padding, currentY);
    currentY += 15;

    // Quantity x Price & Line Total
    ctx.font = '11px "Courier New", Courier, monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`${item.quantity} x ${formatRupiah(item.product.price)}`, padding + 10, currentY);

    ctx.textAlign = 'right';
    ctx.font = 'bold 11px "Courier New", Courier, monospace';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(formatRupiah(item.product.price * item.quantity), baseWidth - padding, currentY);
    currentY += 18;
  });

  drawDashedLine(currentY);
  currentY += 16;

  // --- 4. TOTALS & PAYMENT DETAILS ---
  ctx.font = '12px "Courier New", Courier, monospace';
  ctx.fillStyle = '#334155';

  // Subtotal
  ctx.textAlign = 'left';
  ctx.fillText('Subtotal', padding, currentY);
  ctx.textAlign = 'right';
  ctx.fillText(formatRupiah(transaction.subtotal), baseWidth - padding, currentY);
  currentY += 18;

  // Discount (if any)
  if (transaction.discount > 0) {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#dc2626';
    ctx.fillText('Diskon', padding, currentY);
    ctx.textAlign = 'right';
    ctx.fillText(`-${formatRupiah(transaction.discount)}`, baseWidth - padding, currentY);
    currentY += 18;
    ctx.fillStyle = '#334155';
  }

  // Grand Total Box
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(padding - 4, currentY - 3, baseWidth - (padding * 2) + 8, 28);
  ctx.strokeStyle = '#e2e8f0';
  ctx.strokeRect(padding - 4, currentY - 3, baseWidth - (padding * 2) + 8, 28);

  ctx.textAlign = 'left';
  ctx.font = 'bold 14px "Courier New", Courier, monospace';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('TOTAL AKHIR', padding + 4, currentY + 16);

  ctx.textAlign = 'right';
  ctx.font = 'bold 15px "Courier New", Courier, monospace';
  ctx.fillStyle = '#047857'; // Crisp emerald
  ctx.fillText(formatRupiah(transaction.total), baseWidth - padding - 4, currentY + 16);
  currentY += 38;

  // Payment Method
  const methodLabel = 
    transaction.paymentMethod === 'cash' ? 'TUNAI' :
    transaction.paymentMethod === 'qris' ? 'QRIS DINAMIS' : 'KARTU DEBIT';

  ctx.font = '11px "Courier New", Courier, monospace';
  ctx.fillStyle = '#334155';
  ctx.textAlign = 'left';
  ctx.fillText('Metode Bayar:', padding, currentY);
  ctx.textAlign = 'right';
  ctx.font = 'bold 11px "Courier New", Courier, monospace';
  ctx.fillText(methodLabel, baseWidth - padding, currentY);
  currentY += 18;

  if (transaction.paymentMethod === 'cash' && transaction.cashTendered !== undefined) {
    ctx.font = '11px "Courier New", Courier, monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'left';
    ctx.fillText('Uang Diterima:', padding, currentY);
    ctx.textAlign = 'right';
    ctx.fillText(formatRupiah(transaction.cashTendered), baseWidth - padding, currentY);
    currentY += 16;

    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'left';
    ctx.fillText('Kembalian:', padding, currentY);
    ctx.textAlign = 'right';
    ctx.font = 'bold 11px "Courier New", Courier, monospace';
    ctx.fillText(formatRupiah(transaction.change || 0), baseWidth - padding, currentY);
    currentY += 20;
  }

  drawDashedLine(currentY);
  currentY += 18;

  // --- 5. QR CODE VERIFICATION ---
  try {
    const qrPayload = `STRUK-VALID|${storeInfo.name}|${transaction.receiptNo}|TOTAL:${transaction.total}|${transaction.timestamp}`;
    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      margin: 1,
      width: 84,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
    });

    const qrImg = new Image();
    await new Promise<void>((resolve, reject) => {
      qrImg.onload = () => resolve();
      qrImg.onerror = reject;
      qrImg.src = qrDataUrl;
    });

    const qrSize = 74;
    ctx.drawImage(qrImg, (baseWidth - qrSize) / 2, currentY, qrSize, qrSize);
    currentY += qrSize + 10;
  } catch {
    // If QR fails, space slightly
    currentY += 10;
  }

  // --- 6. FOOTER & STATUS STAMP ---
  ctx.textAlign = 'center';
  ctx.font = 'bold 13px "Courier New", Courier, monospace';
  ctx.fillStyle = '#059669'; // Emerald stamp
  
  // Draw *** LUNAS *** pill
  const stampText = '✓ L U N A S';
  const stampWidth = 120;
  const stampHeight = 22;
  const stampX = (baseWidth - stampWidth) / 2;
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(stampX, currentY - 14, stampWidth, stampHeight);
  ctx.fillText(stampText, baseWidth / 2, currentY + 1);
  currentY += 22;

  ctx.font = '10px "Courier New", Courier, monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Terima kasih atas kunjungan Anda!', baseWidth / 2, currentY);
  currentY += 14;
  ctx.fillText('Struk digital ini adalah bukti pembayaran yang sah', baseWidth / 2, currentY);

  return canvas;
}

/**
 * Generate full receipt image bundle: canvas, blob, dataUrl, and File object
 */
export async function generateReceiptImage(
  transaction: Transaction,
  storeInfo?: StoreInfo
): Promise<GeneratedReceipt> {
  const canvas = await generateReceiptCanvas(transaction, storeInfo);
  
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to convert canvas to blob'));
        return;
      }

      const fileName = `struk-${transaction.receiptNo || 'pembayaran'}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });
      const dataUrl = canvas.toDataURL('image/png');

      resolve({
        canvas,
        dataUrl,
        blob,
        file,
      });
    }, 'image/png', 0.95);
  });
}

/**
 * Direct file download trigger for receipt image
 */
export function downloadReceiptFile(blobOrUrl: Blob | string, filename: string) {
  const link = document.createElement('a');
  if (typeof blobOrUrl === 'string') {
    link.href = blobOrUrl;
  } else {
    link.href = URL.createObjectURL(blobOrUrl);
  }
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copy PNG image blob directly to user's system clipboard (supports Ctrl+V in WhatsApp Web)
 */
export async function copyReceiptImageToClipboard(blob: Blob): Promise<boolean> {
  if (!navigator.clipboard || !window.ClipboardItem) {
    return false;
  }
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ]);
    return true;
  } catch (err) {
    console.warn('Clipboard write image failed, falling back:', err);
    return false;
  }
}

/**
 * Clean phone number to WhatsApp international standard (e.g., 0812 -> 62812)
 */
export function sanitizeWhatsAppPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62') && cleaned.length > 5) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

/**
 * Generates the clean companion text caption for WhatsApp
 */
export function getWhatsAppReceiptCaption(
  transaction: Transaction,
  storeInfo: StoreInfo = {
    name: 'TOKO BERKAH ABADI',
    subName: 'Toko Berkah Jaya',
    address: 'Jl. Pahlawan No. 28, Surabaya',
    phone: '0812-3456-7890',
  }
): string {
  const lines: string[] = [
    `🧾 *STRUK PEMBAYARAN RESMI*`,
    `🏪 *${storeInfo.name.toUpperCase()}*`,
    `📍 ${storeInfo.address}`,
    `--------------------------------`,
    `*No. Struk:* ${transaction.receiptNo}`,
    `*Tanggal  :* ${transaction.timestamp}`,
    `*Kasir    :* ${transaction.cashierName}`,
    `*Pelanggan:* ${transaction.customerName || 'Umum'}`,
    `--------------------------------`,
    ...transaction.items.map(
      (item) => `▪ ${item.product.name}\n   ${item.quantity}x @ ${formatRupiah(item.product.price)} = ${formatRupiah(item.product.price * item.quantity)}`
    ),
    `--------------------------------`,
    `*TOTAL    :* *${formatRupiah(transaction.total)}*`,
    `*Metode   :* ${
      transaction.paymentMethod === 'cash' ? 'Tunai' : transaction.paymentMethod === 'qris' ? 'QRIS Dinamis' : 'Kartu Debit'
    }`,
    `*Status   :* *LUNAS ✅*`,
    `--------------------------------`,
    `_Terima kasih telah berbelanja di ${storeInfo.name}!_`,
  ];

  return lines.join('\n');
}
