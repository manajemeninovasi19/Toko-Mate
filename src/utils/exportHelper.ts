import { Transaction } from '../types';

/**
 * Format transaction items into a readable string for spreadsheet cells.
 * e.g. "Aqua 600ml (2 pcs); Mie Instan (1 pcs)"
 */
function formatItemSummary(items: Transaction['items']): string {
  if (!items || items.length === 0) return '-';
  return items.map((i) => `${i.product.name} (${i.quantity} ${i.product.unit || 'pcs'})`).join(' + ');
}

/**
 * Clean string for CSV cell (escapes double quotes)
 */
function escapeCsv(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Download helper trigger
 */
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Export CSV format compatible with Microsoft Excel (Indonesia & International)
 * Uses BOM (\uFEFF) and 'sep=;\r\n' directive with semicolon (;) delimiter
 * so Excel automatically places each field in separate columns (A, B, C, D, etc.)
 * rather than clumping everything into Column A.
 */
export function exportSalesToExcelCSV(transactions: Transaction[], dateLabel: string = 'Hari_Ini') {
  const BOM = '\uFEFF';
  const sepDirective = 'sep=;\r\n';

  const headers = [
    'No Struk',
    'Tanggal & Jam',
    'Kasir',
    'Pelanggan',
    'Metode Pembayaran',
    'Rincian Produk Terjual',
    'Total Item',
    'Subtotal (Rp)',
    'Diskon (Rp)',
    'Total Bayar (Rp)',
    'Uang Diterima (Rp)',
    'Kembalian (Rp)',
    'Status',
  ];

  const headerLine = headers.map(escapeCsv).join(';');

  const rowLines = transactions.map((t) => {
    const totalItems = t.items.reduce((sum, item) => sum + item.quantity, 0);
    const paymentLabel =
      t.paymentMethod === 'qris'
        ? 'QRIS Dinamis'
        : t.paymentMethod === 'cash'
        ? 'Tunai'
        : 'Debit / EDC';

    return [
      escapeCsv(t.receiptNo),
      escapeCsv(t.timestamp),
      escapeCsv(t.cashierName || 'Kasir'),
      escapeCsv(t.customerName || 'Pelanggan Umum'),
      escapeCsv(paymentLabel),
      escapeCsv(formatItemSummary(t.items)),
      totalItems,
      t.subtotal,
      t.discount,
      t.total,
      t.cashTendered !== undefined ? t.cashTendered : t.total,
      t.change !== undefined ? t.change : 0,
      escapeCsv('Lunas / Sukses'),
    ].join(';');
  });

  // Summary Row
  const totalOmset = transactions.reduce((acc, t) => acc + t.total, 0);
  const totalItemCount = transactions.reduce(
    (acc, t) => acc + t.items.reduce((s, i) => s + i.quantity, 0),
    0
  );

  const summaryLine = [
    escapeCsv('TOTAL KESELURUHAN'),
    escapeCsv('-'),
    escapeCsv('-'),
    escapeCsv(`${transactions.length} Transaksi`),
    escapeCsv('-'),
    escapeCsv('-'),
    totalItemCount,
    '-',
    '-',
    totalOmset,
    '-',
    '-',
    escapeCsv('SELESAI'),
  ].join(';');

  const content = BOM + sepDirective + headerLine + '\r\n' + rowLines.join('\r\n') + '\r\n' + summaryLine;
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `Laporan_Penjualan_${dateLabel}.csv`);
}

/**
 * Export Native Excel Spreadsheet (.xls HTML Table)
 * Guaranteed to open directly in Microsoft Excel with distinct styled columns,
 * bold emerald header, bordered table, and formatted numbers.
 */
export function exportSalesToNativeExcel(transactions: Transaction[], dateLabel: string = 'Hari_Ini') {
  const totalOmset = transactions.reduce((acc, t) => acc + t.total, 0);
  const totalItems = transactions.reduce(
    (acc, t) => acc + t.items.reduce((s, i) => s + i.quantity, 0),
    0
  );

  const rowsHtml = transactions
    .map((t, idx) => {
      const itemCount = t.items.reduce((sum, item) => sum + item.quantity, 0);
      const paymentLabel =
        t.paymentMethod === 'qris'
          ? 'QRIS Dinamis'
          : t.paymentMethod === 'cash'
          ? 'Tunai'
          : 'Debit / EDC';

      const bgStyle = idx % 2 === 0 ? 'background-color: #ffffff;' : 'background-color: #f8fafc;';

      return `
        <tr style="${bgStyle}">
          <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace;">${t.receiptNo}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">${t.timestamp}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">${t.cashierName || 'Kasir'}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">${t.customerName || 'Pelanggan Umum'}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">${paymentLabel}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">${formatItemSummary(t.items)}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${itemCount}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${t.subtotal.toLocaleString('id-ID')}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${t.discount.toLocaleString('id-ID')}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: #047857;">${t.total.toLocaleString('id-ID')}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${(t.cashTendered || t.total).toLocaleString('id-ID')}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${(t.change || 0).toLocaleString('id-ID')}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; color: #059669; font-weight: bold;">LUNAS</td>
        </tr>
      `;
    })
    .join('');

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Laporan Penjualan</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        th { font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
        td { font-family: Calibri, Arial, sans-serif; font-size: 10pt; }
      </style>
    </head>
    <body>
      <h2 style="font-family: Calibri, Arial; color: #0f172a; margin-bottom: 4px;">LAPORAN PENJUALAN KASIR</h2>
      <p style="font-family: Calibri, Arial; color: #64748b; font-size: 11pt; margin-top: 0;">Tanggal Export: ${new Date().toLocaleDateString('id-ID')} • Toko Berkah Jaya</p>
      <table border="1" style="border-collapse: collapse; border-color: #cbd5e1; width: 100%;">
        <thead>
          <tr style="background-color: #047857; color: #ffffff; text-align: left;">
            <th style="padding: 10px; border: 1px solid #065f46;">No Struk</th>
            <th style="padding: 10px; border: 1px solid #065f46;">Waktu</th>
            <th style="padding: 10px; border: 1px solid #065f46;">Kasir</th>
            <th style="padding: 10px; border: 1px solid #065f46;">Pelanggan</th>
            <th style="padding: 10px; border: 1px solid #065f46;">Metode</th>
            <th style="padding: 10px; border: 1px solid #065f46;">Rincian Barang</th>
            <th style="padding: 10px; border: 1px solid #065f46; text-align: center;">Qty</th>
            <th style="padding: 10px; border: 1px solid #065f46; text-align: right;">Subtotal (Rp)</th>
            <th style="padding: 10px; border: 1px solid #065f46; text-align: right;">Diskon (Rp)</th>
            <th style="padding: 10px; border: 1px solid #065f46; text-align: right;">Total Bayar (Rp)</th>
            <th style="padding: 10px; border: 1px solid #065f46; text-align: right;">Uang Diterima (Rp)</th>
            <th style="padding: 10px; border: 1px solid #065f46; text-align: right;">Kembalian (Rp)</th>
            <th style="padding: 10px; border: 1px solid #065f46; text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
        <tfoot>
          <tr style="background-color: #e2e8f0; font-weight: bold;">
            <td colspan="6" style="padding: 10px; border: 1px solid #cbd5e1;">TOTAL KESELURUHAN (${transactions.length} Transaksi)</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">${totalItems}</td>
            <td colspan="2" style="padding: 10px; border: 1px solid #cbd5e1;"></td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right; color: #047857; font-size: 11pt;">Rp ${totalOmset.toLocaleString('id-ID')}</td>
            <td colspan="3" style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; color: #059669;">SELESAI</td>
          </tr>
        </tfoot>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  triggerDownload(blob, `Laporan_Penjualan_${dateLabel}.xls`);
}

/**
 * Standard Comma Separated Values (RFC 4180) for Google Sheets
 */
export function exportSalesToStandardCSV(transactions: Transaction[], dateLabel: string = 'Hari_Ini') {
  const BOM = '\uFEFF';
  const headers = [
    'No Struk',
    'Tanggal & Jam',
    'Kasir',
    'Pelanggan',
    'Metode Pembayaran',
    'Rincian Produk Terjual',
    'Total Item',
    'Subtotal (Rp)',
    'Diskon (Rp)',
    'Total Bayar (Rp)',
    'Uang Diterima (Rp)',
    'Kembalian (Rp)',
  ];

  const headerLine = headers.map(escapeCsv).join(',');

  const rowLines = transactions.map((t) => {
    const totalItems = t.items.reduce((sum, item) => sum + item.quantity, 0);
    const paymentLabel =
      t.paymentMethod === 'qris'
        ? 'QRIS Dinamis'
        : t.paymentMethod === 'cash'
        ? 'Tunai'
        : 'Debit / EDC';

    return [
      escapeCsv(t.receiptNo),
      escapeCsv(t.timestamp),
      escapeCsv(t.cashierName || 'Kasir'),
      escapeCsv(t.customerName || 'Pelanggan Umum'),
      escapeCsv(paymentLabel),
      escapeCsv(formatItemSummary(t.items)),
      totalItems,
      t.subtotal,
      t.discount,
      t.total,
      t.cashTendered !== undefined ? t.cashTendered : t.total,
      t.change !== undefined ? t.change : 0,
    ].join(',');
  });

  const content = BOM + headerLine + '\r\n' + rowLines.join('\r\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `Laporan_Penjualan_${dateLabel}_GoogleSheets.csv`);
}
