// QRIS Dynamic (QRIS Dinamis) Generator according to Bank Indonesia / ASPI EMVCo standard
// Tag 01 = 12 specifies DYNAMIC QRIS (Nominal terkunci otomatis di sisi kasir)
// Tag 54 specifies Transaction Amount (Nominal tidak dapat diubah oleh kustomer)

export function calculateCRC16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function generateDynamicQRISPayload(
  amount: number,
  merchantName: string = 'TOKO BERKAH JAYA',
  nmid: string = 'ID1020039485721'
): string {
  const cleanName = (merchantName || 'TOKO BERKAH JAYA').trim().toUpperCase().slice(0, 25);
  const nameLen = String(cleanName.length).padStart(2, '0');
  const nameTag = `59${nameLen}${cleanName}`;

  const amountStr = Math.max(0, Math.round(amount)).toString();
  const amountLen = String(amountStr.length).padStart(2, '0');
  const amountTag = `54${amountLen}${amountStr}`;

  const cleanNmid = (nmid || 'ID1020039485721').trim();
  const nmidTag = `0215${cleanNmid.slice(0, 15).padEnd(15, '0')}`;

  // Tag 01: '12' = DYNAMIC QR (Point of Initiation Method: Dynamic)
  // Tag 53: '360' = Indonesian Rupiah (IDR)
  // Tag 54: Amount = Terkunci otomatis (Read-Only)
  const base =
    `000201010212` +
    `26580014ID.LINKAJA.WWW0118936009143000000000` +
    `${nmidTag}0303UME` +
    `51440014ID.CO.QRIS.WWW` +
    `${nmidTag}0303UME` +
    `52045411` +
    `5303360` +
    `${amountTag}` +
    `5802ID` +
    `${nameTag}` +
    `6007JAKARTA` +
    `62070703A01` +
    `6304`;

  const crc = calculateCRC16(base);
  return base + crc;
}
