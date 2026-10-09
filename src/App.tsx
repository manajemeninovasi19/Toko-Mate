import { useState } from 'react';
import { Product, Transaction, Cashier, StoreInfo } from './types';
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

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabKey>('beranda');

  // Core store state initialized with exact figures from screenshot
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [totalSales, setTotalSales] = useState<number>(8642000);
  const [transactionCount, setTransactionCount] = useState<number>(18);
  const [itemsSoldCount, setItemsSoldCount] = useState<number>(45);
  const [cashInDrawer, setCashInDrawer] = useState<number>(1420000);
  const [initialCash] = useState<number>(200000);
  const [qrisTotal, setQrisTotal] = useState<number>(7222000);

  // Store information state (editable via LainnyaScreen)
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: 'Toko Berkah Abadi',
    subName: 'Toko Berkah Jaya',
    address: 'Jl. Pahlawan No. 28, Surabaya',
    phone: '0812-3456-7890',
  });
  const [isEditStoreOpen, setIsEditStoreOpen] = useState<boolean>(false);

  // Store metadata & Cashier management
  const [storeStatus, setStoreStatus] = useState<'open' | 'closed'>('open');
  const [cashiers, setCashiers] = useState<Cashier[]>(INITIAL_CASHIERS);
  const [activeCashierId, setActiveCashierId] = useState<string>('kasir-1');
  const [isAddCashierOpen, setIsAddCashierOpen] = useState<boolean>(false);

  // Active cashier object
  const activeCashier = cashiers.find((c) => c.id === activeCashierId) || cashiers[0];

  // Modals state
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [drawerModal, setDrawerModal] = useState<{ isOpen: boolean; mode: 'settle' | 'detail' }>({
    isOpen: false,
    mode: 'settle',
  });
  const [receiptTransaction, setReceiptTransaction] = useState<Transaction | null>(null);

  // Restock handler
  const handleRestock = (productId: string, addedStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: p.stock + addedStock } : p))
    );
  };

  // Checkout completion handler
  const handleCompleteCheckout = (newTrx: Transaction) => {
    // 1. Update transactions
    setTransactions((prev) => [newTrx, ...prev]);

    // 2. Update metrics
    setTotalSales((prev) => prev + newTrx.total);
    setTransactionCount((prev) => prev + 1);

    const qtyPurchased = newTrx.items.reduce((sum, item) => sum + item.quantity, 0);
    setItemsSoldCount((prev) => prev + qtyPurchased);

    if (newTrx.paymentMethod === 'cash') {
      const netCash = newTrx.cashTendered !== undefined && newTrx.change !== undefined
        ? newTrx.cashTendered - newTrx.change
        : newTrx.total;
      setCashInDrawer((prev) => prev + netCash);
    } else if (newTrx.paymentMethod === 'qris') {
      setQrisTotal((prev) => prev + newTrx.total);
    }

    // 3. Deduct product stocks
    setProducts((prev) =>
      prev.map((prod) => {
        const boughtItem = newTrx.items.find((item) => item.product.id === prod.id);
        if (boughtItem) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - boughtItem.quantity),
            soldCount: prod.soldCount + boughtItem.quantity,
          };
        }
        return prod;
      })
    );

    // 4. Open receipt modal
    setReceiptTransaction(newTrx);
  };

  // Add new product
  const handleAddProduct = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
  };

  // Delete product
  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // Cashier Handlers
  const handleAddCashier = (newCashier: Cashier) => {
    setCashiers((prev) => [...prev, newCashier]);
    setActiveCashierId(newCashier.id);
  };

  const handleSelectActiveCashier = (cashierId: string) => {
    setActiveCashierId(cashierId);
    setCashiers((prev) =>
      prev.map((c) => ({
        ...c,
        isActive: c.id === cashierId,
      }))
    );
  };

  const handleDeleteCashier = (cashierId: string) => {
    setCashiers((prev) => prev.filter((c) => c.id !== cashierId));
    if (activeCashierId === cashierId) {
      const remaining = cashiers.filter((c) => c.id !== cashierId);
      if (remaining.length > 0) {
        setActiveCashierId(remaining[0].id);
      }
    }
  };

  // Reset starting completely from scratch (0 products, 0 sales, 0 transactions)
  const handleResetToZero = () => {
    setProducts([]);
    setTransactions([]);
    setTotalSales(0);
    setTransactionCount(0);
    setItemsSoldCount(0);
    setCashInDrawer(0);
    setQrisTotal(0);
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
  };

  const handleUpdateStoreInfo = (updatedInfo: Partial<StoreInfo>) => {
    setStoreInfo((prev) => ({ ...prev, ...updatedInfo }));
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
          />
        )}

        {currentTab === 'lainnya' && (
          <LainnyaScreen
            cashiers={cashiers}
            activeCashier={activeCashier}
            onSelectActiveCashier={handleSelectActiveCashier}
            onOpenAddCashier={() => setIsAddCashierOpen(true)}
            onDeleteCashier={handleDeleteCashier}
            onResetToZero={handleResetToZero}
            onLoadDemoData={handleLoadDemoData}
            storeStatus={storeStatus}
            onToggleStoreStatus={() => setStoreStatus((prev) => (prev === 'open' ? 'closed' : 'open'))}
            storeInfo={storeInfo}
            onOpenEditStore={() => setIsEditStoreOpen(true)}
            onUpdateStoreInfo={handleUpdateStoreInfo}
          />
        )}
      </main>

      {/* Persistent Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
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
    </div>
  );
}
