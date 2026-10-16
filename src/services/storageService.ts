import { TenantStoreData, UserAccount, Product, Cashier, StoreInfo } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CASHIERS } from '../data/mockData';

const TENANT_PREFIX = 'pos_store_data_';

export function getTenantStorageKey(tenantId: string): string {
  return `${TENANT_PREFIX}${tenantId}`;
}

/**
 * Creates clean initial store data with 0 transactions, 0 total sales, 0 cash in drawer
 */
export function createFreshTenantData(user: UserAccount): TenantStoreData {
  // Ensure products start with soldCount = 0
  const cleanProducts: Product[] = INITIAL_PRODUCTS.map((p) => ({
    ...p,
    soldCount: 0,
  }));

  const storeInfo: StoreInfo = {
    name: user.storeName || `Toko ${user.name}`,
    subName: user.email,
    address: 'Jl. Utama Pasar Baru No. 12',
    phone: '0812-3456-7890',
  };

  return {
    tenantId: user.tenantId,
    userId: user.id,
    userEmail: user.email,
    products: cleanProducts,
    transactions: [], // 0 transaksi bersih dari awal
    totalSales: 0, // Rp 0
    transactionCount: 0, // 0
    itemsSoldCount: 0, // 0
    cashInDrawer: 0, // Rp 0
    initialCash: 0, // Rp 0
    qrisTotal: 0, // Rp 0
    storeInfo,
    cashiers: INITIAL_CASHIERS,
    activeCashierId: 'kasir-1',
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Load tenant data from browser localStorage.
 * Ensures all transactions and reports persist across browser refreshes.
 */
export function loadTenantData(tenantId: string, user: UserAccount): TenantStoreData {
  const key = getTenantStorageKey(tenantId);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed: TenantStoreData = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.products) && Array.isArray(parsed.transactions)) {
        if (parsed.cashiers && Array.isArray(parsed.cashiers)) {
          parsed.cashiers = parsed.cashiers.map((c, idx) => ({
            ...c,
            pin: c.pin || (idx === 0 ? '1234' : idx === 1 ? '2345' : idx === 2 ? '3456' : '1234'),
          }));
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn(`Failed to read tenant storage for ${tenantId}:`, err);
  }

  // Check legacy prefix key if previously saved
  try {
    const legacyRaw = localStorage.getItem(`pos_tenant_${tenantId}`);
    if (legacyRaw) {
      const parsed: TenantStoreData = JSON.parse(legacyRaw);
      if (parsed && Array.isArray(parsed.products) && Array.isArray(parsed.transactions)) {
        localStorage.setItem(key, legacyRaw);
        return parsed;
      }
    }
  } catch (err) {
    // Ignore legacy read errors
  }

  // Not found in local storage -> initialize fresh 0-state
  const fresh = createFreshTenantData(user);
  saveTenantData(fresh);
  return fresh;
}

/**
 * Save tenant data immediately & synchronously to localStorage.
 * Anti-loss guarantee: All reports and transactions are kept intact on page refresh.
 */
export function saveTenantData(data: TenantStoreData): void {
  const key = getTenantStorageKey(data.tenantId);
  try {
    data.updatedAt = new Date().toISOString();
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
    localStorage.setItem(`pos_tenant_${data.tenantId}`, serialized);
  } catch (err) {
    console.error(`Failed to persist tenant data for ${data.tenantId}:`, err);
  }
}

/**
 * Completely removes tenant data from browser storage when an account is deleted.
 */
export function deleteTenantData(tenantId: string): void {
  try {
    const key = getTenantStorageKey(tenantId);
    localStorage.removeItem(key);
    localStorage.removeItem(`pos_tenant_${tenantId}`);
  } catch (err) {
    console.warn(`Failed to delete tenant data for ${tenantId}:`, err);
  }
}
