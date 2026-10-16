import { useState, useEffect, useRef } from 'react';
import { Product, Transaction, Cashier, StoreInfo, UserAccount, TenantStoreData } from './types';
import { INITIAL_PRODUCTS, INITIAL_TRANSACTIONS, INITIAL_CASHIERS } from './data/mockData';
import { Header } from './components/Header';
import { BottomNav, TabKey } from './components/BottomNav';
import { BerandaScreen } from './screens/BerandaScreen';
import { KasirScreen } from './screens/KasirScreen';
import { ProdukScreen } from './screens/ProdukScreen';
import { LaporanScreen } from './screens/LaporanScreen';
import { LainnyaScreen } from './screens/LainnyaScreen';
import { RestockModal } from './components/RestockModal';
import { ShiftDrawerModal } from './components/ShiftDrawerModal';
import { NotificationsModal } from './components/NotificationsModal';
import { ProfileModal } from './components/ProfileModal';
import { ReceiptModal } from './components/ReceiptModal';
import { AddCashierModal } from './components/AddCashierModal';
import { EditStoreModal } from './components/EditStoreModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { CashierPinModal } from './components/CashierPinModal';
import { EditCashierPinModal } from './components/EditCashierPinModal';
import { DeleteAccountModal } from './components/DeleteAccountModal';
import { getCurrentUser, setCurrentUser, deleteGoogleAccount } from './services/authService';
import { loadTenantData, saveTenantData } from './services/storageService';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabKey>('beranda');

  // Google User / Multi-Tenant Account
  const [currentUser, setCurrentUserState] = useState<UserAccount>(() => getCurrentUser());

  // Load tenant-specific store data (persisted per account in browser localStorage)
  const [initialData] = useState<TenantStoreData>(() =>
    loadTenantData(currentUser.tenantId, currentUser)
  );

  // Core store state initialized from persistent storage
  const [products, setProducts] = useState<Product[]>(initialData.products);
  const [transactions, setTransactions] = useState<Transaction[]>(initialData.transactions);
  const [totalSales, setTotalSales] = useState<number>(initialData.totalSales);
  const [transactionCount, setTransactionCount] = useState<number>(initialData.transactionCount);
  const [itemsSoldCount, setItemsSoldCount] = useState<number>(initialData.itemsSoldCount);
  const [cashInDrawer, setCashInDrawer] = useState<number>(initialData.cashInDrawer);
  const [initialCash] = useState<number>(initialData.initialCash || 0);
  const [qrisTotal, setQrisTotal] = useState<number>(initialData.qrisTotal);
  const [storeInfo, setStoreInfo] = useState<StoreInfo>(initialData.storeInfo);
  const [cashiers, setCashiers] = useState<Cashier[]>(initialData.cashiers);
  const [activeCashierId, setActiveCashierId] = useState<string>(initialData.activeCashierId);

  // Modals state
  const [storeStatus, setStoreStatus] = useState<'open' | 'closed'>('open');
  const [isEditStoreOpen, setIsEditStoreOpen] = useState<boolean>(false);
  const [isAddCashierOpen, setIsAddCashierOpen] = useState<boolean>(false);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isGoogleAuthOpen, setIsGoogleAuthOpen] = useState<boolean>(false);

  const [drawerModal, setDrawerModal] = useState<{ isOpen: boolean; mode: 'settle' | 'detail' }>({
    isOpen: false,
    mode: 'settle',
  });
  const [receiptTransaction, setReceiptTransaction] = useState<Transaction | null>(null);

  // Staff handover / PIN authorization modal state
  const [pinModal, setPinModal] = useState<{
    isOpen: boolean;
    targetCashier: Cashier | null;
  }>({
    isOpen: false,
    targetCashier: null,
  });

  // Edit Staff PIN modal state
  const [editPinModal, setEditPinModal] = useState<{
    isOpen: boolean;
    cashier: Cashier | null;
  }>({
    isOpen: false,
    cashier: null,
  });

  // Delete Account Confirmation Modal state
  const [deleteAccountModal, setDeleteAccountModal] = useState<{
    isOpen: boolean;
    account: UserAccount | null;
  }>({
    isOpen: false,
    account: null,
  });

  // Active cashier object
  const activeCashier = cashiers.find((c) => c.id === activeCashierId) || cashiers[0];

  // Construct current tenant payload
  const currentTenantData: TenantStoreData = {
    tenantId: currentUser.tenantId,
    userId: currentUser.id,
    userEmail: currentUser.email,
    products,
    transactions,
    totalSales,
    transactionCount,
    itemsSoldCount,
    cashInDrawer,
    initialCash,
    qrisTotal,
    storeInfo,
    cashiers,
    activeCashierId,
    updatedAt: new Date().toISOString(),
  };

  // Flag to avoid initial overwrite
  const isFirstMount = useRef(true);

  // Auto-Save: Persist to storage whenever state changes
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    saveTenantData(currentTenantData);
  }, [
    currentUser,
    products,
    transactions,
    totalSales,
    transactionCount,
    itemsSoldCount,
    cashInDrawer,
    initialCash,
    qrisTotal,
    storeInfo,
    cashiers,
    activeCashierId,
  ]);

  // Switch Google User (Multi-Tenant Isolation)
  const handleSwitchUser = (newUser: UserAccount) => {
    setCurrentUser(newUser);
    setCurrentUserState(newUser);

    // Load data for the newly selected tenant
    const loaded = loadTenantData(newUser.tenantId, newUser);
    setProducts(loaded.products);
    setTransactions(loaded.transactions);
    setTotalSales(loaded.totalSales);
    setTransactionCount(loaded.transactionCount);
    setItemsSoldCount(loaded.itemsSoldCount);
    setCashInDrawer(loaded.cashInDrawer);
    setQrisTotal(loaded.qrisTotal);
    setStoreInfo(loaded.storeInfo);
    setCashiers(loaded.cashiers);
    setActiveCashierId(loaded.activeCashierId);
  };

  // Delete Account Request Handler
  const handleRequestDeleteAccount = (account: UserAccount) => {
    setDeleteAccountModal({
      isOpen: true,
      account,
    });
  };

  // Delete Account Execution Handler
  const handleConfirmDeleteAccount = (accountToDelete: UserAccount) => {
    const isCurrentActive =
      accountToDelete.email.toLowerCase() === currentUser.email.toLowerCase() ||
      accountToDelete.tenantId === currentUser.tenantId;

    const { nextUser } = deleteGoogleAccount(accountToDelete.email);

    if (isCurrentActive) {
      // Switched automatically to the next available account
      handleSwitchUser(nextUser);
    }
  };

  // Restock handler
  const handleRestock = (productId: string, addedStock: number) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === productId ? { ...p, stock: p.stock + addedStock } : p));
      saveTenantData({
        ...currentTenantData,
        products: updated,
      });
      return updated;
    });
  };

  // Checkout completion handler - IMMEDIATELY saves to localStorage so refresh never loses it!
  const handleCompleteCheckout = (newTrx: Transaction) => {
    // 1. Update transactions list
    const updatedTransactions = [newTrx, ...transactions];
    setTransactions(updatedTransactions);

    // 2. Update financial & item metrics
    const updatedTotalSales = totalSales + newTrx.total;
    setTotalSales(updatedTotalSales);

    const updatedTxCount = transactionCount + 1;
    setTransactionCount(updatedTxCount);

    const qtyPurchased = newTrx.items.reduce((sum, item) => sum + item.quantity, 0);
    const updatedItemsSold = itemsSoldCount + qtyPurchased;
    setItemsSoldCount(updatedItemsSold);

    let updatedCash = cashInDrawer;
    let updatedQris = qrisTotal;

    if (newTrx.paymentMethod === 'cash') {
      const netCash = newTrx.cashTendered !== undefined && newTrx.change !== undefined
        ? newTrx.cashTendered - newTrx.change
        : newTrx.total;
      updatedCash = cashInDrawer + netCash;
      setCashInDrawer(updatedCash);
    } else if (newTrx.paymentMethod === 'qris') {
      updatedQris = qrisTotal + newTrx.total;
      setQrisTotal(updatedQris);
    }

    // 3. Deduct product stocks
    const updatedProducts = products.map((prod) => {
      const boughtItem = newTrx.items.find((item) => item.product.id === prod.id);
      if (boughtItem) {
        return {
          ...prod,
          stock: Math.max(0, prod.stock - boughtItem.quantity),
          soldCount: prod.soldCount + boughtItem.quantity,
        };
      }
      return prod;
    });
    setProducts(updatedProducts);

    // 4. Open receipt modal
    setReceiptTransaction(newTrx);

    // 5. SYNCHRONOUS PERSISTENCE: Save immediately to localStorage
    // Guaranteed: Transaction & Report are preserved even if user refreshes immediately
    saveTenantData({
      tenantId: currentUser.tenantId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      products: updatedProducts,
      transactions: updatedTransactions,
      totalSales: updatedTotalSales,
      transactionCount: updatedTxCount,
      itemsSoldCount: updatedItemsSold,
      cashInDrawer: updatedCash,
      initialCash,
      qrisTotal: updatedQris,
      storeInfo,
      cashiers,
      activeCashierId,
      updatedAt: new Date().toISOString(),
    });
  };

  // Add new product
  const handleAddProduct = (newProd: Product) => {
    setProducts((prev) => {
      const updated = [newProd, ...prev];
      saveTenantData({ ...currentTenantData, products: updated });
      return updated;
    });
  };

  // Delete product
  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      saveTenantData({ ...currentTenantData, products: updated });
      return updated;
    });
  };

  // Cashier Handlers
  const handleAddCashier = (newCashier: Cashier) => {
    setCashiers((prev) => {
      const updated = [...prev, newCashier];
      saveTenantData({ ...currentTenantData, cashiers: updated, activeCashierId: newCashier.id });
      return updated;
    });
    setActiveCashierId(newCashier.id);
  };

  const handleSelectActiveCashier = (cashierId: string) => {
    setActiveCashierId(cashierId);
    setCashiers((prev) => {
      const updated = prev.map((c) => ({
        ...c,
        isActive: c.id === cashierId,
      }));
      saveTenantData({ ...currentTenantData, cashiers: updated, activeCashierId: cashierId });
      return updated;
    });
  };

  // Staff handover / PIN prompt trigger
  const handleRequestSwitchCashier = (targetCashier: Cashier) => {
    if (targetCashier.id === activeCashierId) return;
    setPinModal({
      isOpen: true,
      targetCashier,
    });
  };

  // Update staff member's PIN
  const handleSaveCashierPin = (cashierId: string, newPin: string) => {
    setCashiers((prev) => {
      const updated = prev.map((c) => (c.id === cashierId ? { ...c, pin: newPin } : c));
      saveTenantData({ ...currentTenantData, cashiers: updated });
      return updated;
    });
  };

  const handleDeleteCashier = (cashierId: string) => {
    setCashiers((prev) => {
      const updated = prev.filter((c) => c.id !== cashierId);
      const nextActiveId = activeCashierId === cashierId && updated.length > 0 ? updated[0].id : activeCashierId;
      if (activeCashierId === cashierId && updated.length > 0) {
        setActiveCashierId(updated[0].id);
      }
      saveTenantData({ ...currentTenantData, cashiers: updated, activeCashierId: nextActiveId });
      return updated;
    });
  };

  // Reset starting completely from scratch (clean 0 transactions, 0 sales)
  const handleResetToZero = () => {
    const cleanProducts = products.map((p) => ({ ...p, soldCount: 0 }));
    setProducts(cleanProducts);
    setTransactions([]);
    setTotalSales(0);
    setTransactionCount(0);
    setItemsSoldCount(0);
    setCashInDrawer(0);
    setQrisTotal(0);

    saveTenantData({
      tenantId: currentUser.tenantId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      products: cleanProducts,
      transactions: [],
      totalSales: 0,
      transactionCount: 0,
      itemsSoldCount: 0,
      cashInDrawer: 0,
      initialCash: 0,
      qrisTotal: 0,
      storeInfo,
      cashiers,
      activeCashierId,
      updatedAt: new Date().toISOString(),
    });
  };

  // Reload demo sample data
  const handleLoadDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setCashiers(INITIAL_CASHIERS);
    setActiveCashierId('kasir-1');
    setTotalSales(8642000);
    setTransactionCount(18);
    setItemsSoldCount(45);
    setCashInDrawer(1420000);
    setQrisTotal(7222000);

    saveTenantData({
      tenantId: currentUser.tenantId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      products: INITIAL_PRODUCTS,
      transactions: INITIAL_TRANSACTIONS,
      totalSales: 8642000,
      transactionCount: 18,
      itemsSoldCount: 45,
      cashInDrawer: 1420000,
      initialCash: 0,
      qrisTotal: 7222000,
      storeInfo,
      cashiers: INITIAL_CASHIERS,
      activeCashierId: 'kasir-1',
      updatedAt: new Date().toISOString(),
    });
  };

  const handleUpdateStoreInfo = (updatedInfo: Partial<StoreInfo>) => {
    setStoreInfo((prev) => {
      const updated = { ...prev, ...updatedInfo };
      saveTenantData({ ...currentTenantData, storeInfo: updated });
      return updated;
    });
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col font-sans antialiased selection:bg-primary-fixed-dim selection:text-on-primary-fixed">
      {/* Header */}
      <Header
        currentTab={currentTab}
        unreadNotificationsCount={3}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        storeStatus={storeStatus}
        onToggleStoreStatus={() => setStoreStatus((prev) => (prev === 'open' ? 'closed' : 'open'))}
        cashierName={activeCashier.name}
        cashierAvatar={activeCashier.avatar}
        currentUser={currentUser}
        onOpenGoogleAuth={() => setIsGoogleAuthOpen(true)}
        storeName={storeInfo.name}
      />

      {/* Main Content Area */}
      <main className="flex-1 pt-16">
        {currentTab === 'beranda' && (
          <BerandaScreen
            products={products}
            totalSales={totalSales}
            transactionCount={transactionCount}
            itemsSoldCount={itemsSoldCount}
            cashInDrawer={cashInDrawer}
            initialCash={initialCash}
            qrisTotal={qrisTotal}
            onNavigateToKasir={() => setCurrentTab('kasir')}
            onNavigateToProduk={() => setCurrentTab('produk')}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onOpenRestock={(product) => setRestockProduct(product)}
            onOpenDrawerModal={(mode) => setDrawerModal({ isOpen: true, mode })}
            cashierName={activeCashier.name}
            shiftName={activeCashier.shift}
            storeInfo={storeInfo}
          />
        )}

        {currentTab === 'kasir' && (
          <KasirScreen
            products={products}
            onCompleteCheckout={handleCompleteCheckout}
            cashierName={activeCashier.name}
            storeInfo={storeInfo}
            onUpdateStoreInfo={handleUpdateStoreInfo}
            onNavigateToProduk={() => setCurrentTab('produk')}
          />
        )}

        {currentTab === 'produk' && (
          <ProdukScreen
            products={products}
            onOpenRestock={(product) => setRestockProduct(product)}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {currentTab === 'laporan' && (
          <LaporanScreen
            transactions={transactions}
            totalSales={totalSales}
            cashInDrawer={cashInDrawer}
            initialCash={initialCash}
            qrisTotal={qrisTotal}
            onViewReceipt={(trx) => setReceiptTransaction(trx)}
            storeName={storeInfo.name}
          />
        )}

        {currentTab === 'lainnya' && (
          <LainnyaScreen
            cashiers={cashiers}
            activeCashier={activeCashier}
            onSelectActiveCashier={handleSelectActiveCashier}
            onRequestSwitchCashier={handleRequestSwitchCashier}
            onRequestEditPin={(c) => setEditPinModal({ isOpen: true, cashier: c })}
            onOpenAddCashier={() => setIsAddCashierOpen(true)}
            onDeleteCashier={handleDeleteCashier}
            onResetToZero={handleResetToZero}
            onLoadDemoData={handleLoadDemoData}
            storeStatus={storeStatus}
            onToggleStoreStatus={() => setStoreStatus((prev) => (prev === 'open' ? 'closed' : 'open'))}
            storeInfo={storeInfo}
            onOpenEditStore={() => setIsEditStoreOpen(true)}
            onUpdateStoreInfo={handleUpdateStoreInfo}
            currentUser={currentUser}
            onOpenGoogleAuth={() => setIsGoogleAuthOpen(true)}
            onRequestDeleteAccount={handleRequestDeleteAccount}
          />
        )}
      </main>

      {/* Persistent Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
      />

      {/* Google Authentication & Multi-Tenant Switcher Modal */}
      <GoogleAuthModal
        isOpen={isGoogleAuthOpen}
        onClose={() => setIsGoogleAuthOpen(false)}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onRequestDeleteAccount={handleRequestDeleteAccount}
      />

      {/* Modals */}
      <RestockModal
        product={restockProduct}
        isOpen={Boolean(restockProduct)}
        onClose={() => setRestockProduct(null)}
        onRestock={handleRestock}
      />

      <ShiftDrawerModal
        isOpen={drawerModal.isOpen}
        onClose={() => setDrawerModal((prev) => ({ ...prev, isOpen: false }))}
        mode={drawerModal.mode}
        cashInDrawer={cashInDrawer}
        initialCash={initialCash}
        qrisTotal={qrisTotal}
        totalSales={totalSales}
        transactionCount={transactionCount}
        onConfirmSetor={(setor) => {
          setCashInDrawer((prev) => Math.max(initialCash, prev - setor));
        }}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onSelectAction={(action) => {
          if (action === 'restock_minyak') {
            const minyak = products.find((p) => p.name.includes('Minyak'));
            if (minyak) setRestockProduct(minyak);
          } else if (action === 'restock_telur') {
            const telur = products.find((p) => p.name.includes('Telur'));
            if (telur) setRestockProduct(telur);
          }
        }}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        cashiers={cashiers}
        activeCashier={activeCashier}
        onSelectActiveCashier={handleSelectActiveCashier}
        onRequestSwitchCashier={handleRequestSwitchCashier}
        onOpenAddCashier={() => setIsAddCashierOpen(true)}
      />

      <AddCashierModal
        isOpen={isAddCashierOpen}
        onClose={() => setIsAddCashierOpen(false)}
        onAddCashier={handleAddCashier}
      />

      <EditStoreModal
        isOpen={isEditStoreOpen}
        onClose={() => setIsEditStoreOpen(false)}
        storeInfo={storeInfo}
        onSaveStoreInfo={(updatedInfo) => setStoreInfo(updatedInfo)}
      />

      <ReceiptModal
        transaction={receiptTransaction}
        isOpen={Boolean(receiptTransaction)}
        onClose={() => setReceiptTransaction(null)}
        onNewOrder={() => setCurrentTab('kasir')}
        storeInfo={storeInfo}
      />

      {/* Staff Handover / Cashier PIN Authorization Modal */}
      <CashierPinModal
        isOpen={pinModal.isOpen}
        onClose={() => setPinModal({ isOpen: false, targetCashier: null })}
        targetCashier={pinModal.targetCashier}
        onSuccess={(cashierId) => {
          handleSelectActiveCashier(cashierId);
        }}
      />

      {/* Edit Staff PIN Modal */}
      <EditCashierPinModal
        isOpen={editPinModal.isOpen}
        onClose={() => setEditPinModal({ isOpen: false, cashier: null })}
        cashier={editPinModal.cashier}
        onSavePin={handleSaveCashierPin}
      />

      {/* Delete Account & Store Data Confirmation Modal */}
      <DeleteAccountModal
        isOpen={deleteAccountModal.isOpen}
        onClose={() => setDeleteAccountModal({ isOpen: false, account: null })}
        account={deleteAccountModal.account}
        isCurrentActiveAccount={
          deleteAccountModal.account?.email.toLowerCase() === currentUser.email.toLowerCase()
        }
        onConfirmDelete={handleConfirmDeleteAccount}
      />
    </div>
  );
}
