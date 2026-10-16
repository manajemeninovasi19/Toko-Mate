import { UserAccount } from '../types';

const STORAGE_KEY_CURRENT_USER = 'pos_active_user';
const STORAGE_KEY_ACCOUNTS_LIST = 'pos_registered_accounts';

export const DEFAULT_USER: UserAccount = {
  id: 'usr_manajemeninovasi19',
  email: 'manajemeninovasi19@gmail.com',
  name: 'Manajemen Inovasi',
  picture: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRE7WahoaoJlEvFCMdPWQzmPmsieBLWPI6uA-UWsTrX85yOno-7BNG8Ih5txDkSebf5QhycOfoMpMLl3yvelop8IBQzYsaQ-mz77QImTHyrS5APT_Zhgl6DkQZyBk8x8pmAyCyhZrMibm6Jra1w4Wp-8mC0WB7NLEvraW7Eo4L5rI7Ai9TOPbVtZY5iL2f2qnDBrMujP6ipSLXZp63rnE1ApoGEBF_WSu4dfA2sNOCnL0xSyLWsxOG',
  tenantId: 'tenant_manajemeninovasi19',
  storeName: 'Toko Berkah Inovasi',
  provider: 'google',
  lastLogin: new Date().toISOString(),
};

export const INITIAL_DEMO_ACCOUNTS: UserAccount[] = [
  DEFAULT_USER,
  {
    id: 'usr_tokoberkah_jaya',
    email: 'tokoberkah.jaya@gmail.com',
    name: 'Budi Santoso (Berkah Jaya)',
    picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    tenantId: 'tenant_tokoberkah_jaya',
    storeName: 'Toko Berkah Cabang 1',
    provider: 'google',
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'usr_warung_sejahtera',
    email: 'warung.sejahtera@gmail.com',
    name: 'Haji Ahmad (Warung Sejahtera)',
    picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    tenantId: 'tenant_warung_sejahtera',
    storeName: 'Warung Sejahtera',
    provider: 'google',
    lastLogin: new Date().toISOString(),
  },
];

export function deriveTenantId(email: string): string {
  const clean = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `tenant_${clean}`;
}

export function getRegisteredAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS_LIST);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load accounts list', err);
  }
  return INITIAL_DEMO_ACCOUNTS;
}

export function saveRegisteredAccounts(accounts: UserAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS_LIST, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save accounts list', err);
  }
}

export function getCurrentUser(): UserAccount {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to parse current user', err);
  }

  // Default to user with current metadata email
  return DEFAULT_USER;
}

export function setCurrentUser(user: UserAccount): void {
  try {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));

    // Also update accounts list
    const accounts = getRegisteredAccounts();
    const existingIndex = accounts.findIndex((a) => a.email.toLowerCase() === user.email.toLowerCase());
    if (existingIndex >= 0) {
      accounts[existingIndex] = { ...accounts[existingIndex], ...user, lastLogin: new Date().toISOString() };
    } else {
      accounts.push({ ...user, lastLogin: new Date().toISOString() });
    }
    saveRegisteredAccounts(accounts);
  } catch (err) {
    console.error('Failed to set current user', err);
  }
}

export function createGoogleAccount(email: string, name?: string, storeName?: string): UserAccount {
  const emailPrefix = email.split('@')[0];
  const derivedName = name || emailPrefix.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const tenant = deriveTenantId(email);

  const newAccount: UserAccount = {
    id: `usr_${tenant}`,
    email: email.trim().toLowerCase(),
    name: derivedName,
    picture: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(email)}`,
    tenantId: tenant,
    storeName: storeName || `Toko ${derivedName}`,
    provider: 'google',
    lastLogin: new Date().toISOString(),
  };

  setCurrentUser(newAccount);
  return newAccount;
}

/**
 * Permanently deletes a Google account and purges all of its store data from storage.
 */
export function deleteGoogleAccount(targetEmailOrTenant: string): { remainingAccounts: UserAccount[]; nextUser: UserAccount } {
  const accounts = getRegisteredAccounts();
  const target = accounts.find(
    (a) =>
      a.email.toLowerCase() === targetEmailOrTenant.toLowerCase() ||
      a.tenantId === targetEmailOrTenant ||
      a.id === targetEmailOrTenant
  );

  const tenantToDelete = target ? target.tenantId : deriveTenantId(targetEmailOrTenant);

  // Clean tenant storage completely
  try {
    localStorage.removeItem(`pos_store_data_${tenantToDelete}`);
    localStorage.removeItem(`pos_tenant_${tenantToDelete}`);
  } catch (err) {
    console.warn('Failed to clean tenant data from storage', err);
  }

  // Filter out the account
  const remaining = accounts.filter(
    (a) =>
      a.email.toLowerCase() !== targetEmailOrTenant.toLowerCase() &&
      a.tenantId !== targetEmailOrTenant &&
      a.id !== targetEmailOrTenant
  );

  let nextUser: UserAccount;
  if (remaining.length > 0) {
    nextUser = remaining[0];
  } else {
    // If all accounts are deleted, regenerate a clean account
    nextUser = {
      id: 'usr_toko_baru',
      email: 'pemilik.baru@gmail.com',
      name: 'Pemilik Toko',
      picture: `https://api.dicebear.com/7.x/identicon/svg?seed=pemilik_baru`,
      tenantId: 'tenant_pemilik_baru',
      storeName: 'Toko Baru Saya',
      provider: 'google',
      lastLogin: new Date().toISOString(),
    };
    remaining.push(nextUser);
  }

  saveRegisteredAccounts(remaining);

  // If deleted account was the active account, switch active account to nextUser
  const current = getCurrentUser();
  if (
    current.email.toLowerCase() === targetEmailOrTenant.toLowerCase() ||
    current.tenantId === targetEmailOrTenant
  ) {
    setCurrentUser(nextUser);
  }

  return { remainingAccounts: remaining, nextUser };
}
