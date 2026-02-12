
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Printer, 
  Send, 
  QrCode, 
  Banknote, 
  Store, 
  LayoutDashboard, 
  Package, 
  LogOut, 
  TrendingUp, 
  Settings,
  Sun,
  Moon,
  X
} from 'lucide-react';
import jsPDF from 'jspdf';
import { Product, CartItem, PaymentMethod, Transaction, StoreProfile } from './types';
import { MOCK_PRODUCTS, TAX_RATE, MOCK_TRANSACTIONS, DEFAULT_STORE_PROFILE } from './constants';
import ProductCard from './components/ProductCard';
import SalesChart from './components/SalesChart';
import PaymentModal from './components/PaymentModal';
import InventoryView from './components/InventoryView';
import ProductForm from './components/ProductForm';
import ReportView from './components/ReportView';
import ProfileView from './components/ProfileView';

enum ViewMode {
    POS = 'POS',
    INVENTORY = 'INVENTORY',
    REPORTS = 'REPORTS',
    PROFILE = 'PROFILE'
}

function App() {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : MOCK_PRODUCTS;
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : MOCK_TRANSACTIONS;
  });
  const [storeProfile, setStoreProfile] = useState<StoreProfile>(() => {
    const saved = localStorage.getItem('storeProfile');
    return saved ? JSON.parse(saved) : DEFAULT_STORE_PROFILE;
  });
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.POS);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProductBarcode, setNewProductBarcode] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('storeProfile', JSON.stringify(storeProfile));
  }, [products, transactions, storeProfile]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleExportBackup = () => {
    const dataToExport = {
        products,
        transactions,
        storeProfile,
        exportDate: new Date().toISOString(),
        version: "1.0.0"
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `${storeProfile.name.replace(/\s+/g, '-')}-Backup-${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const json = JSON.parse(e.target?.result as string);
            if (json.products && json.transactions && json.storeProfile) {
                if (confirm("PERINGATAN: Mengimpor data akan MENGGANTI seluruh data saat ini. Lanjutkan?")) {
                    setProducts(json.products);
                    setTransactions(json.transactions);
                    setStoreProfile(json.storeProfile);
                    alert("Data berhasil dipulihkan!");
                }
            } else {
                alert("Format file backup tidak valid!");
            }
        } catch (err) {
            alert("Gagal membaca file backup.");
        }
    };
    reader.readAsText(file);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      const currentQtyInCart = existing ? existing.quantity : 0;
      if (currentQtyInCart + 1 > product.stock) {
          alert(`Stok tidak mencukupi!`);
          return prev;
      }
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const product = products.find(p => p.id === id);
        if (!product) return item;
        const newQty = item.quantity + delta;
        if (delta > 0 && newQty > product.stock) return item;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));
  const clearCart = () => setCart([]);
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal;

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.barcode?.includes(searchQuery);
      const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, products]);

  const initiatePayment = (method: PaymentMethod) => {
    if (cart.length === 0) return;
    setSelectedPaymentMethod(method);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (customerName: string, customerPhone: string, cashGiven: number) => {
    const updatedProducts = products.map(p => {
        const cartItem = cart.find(c => c.id === p.id);
        if (cartItem) return { ...p, stock: p.stock - cartItem.quantity };
        return p;
    });
    const change = cashGiven - total;
    const amountGiven = selectedPaymentMethod === PaymentMethod.CASH ? cashGiven : total;
    const newTransaction: Transaction = {
        id: `TX-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString(),
        total: total,
        items: [...cart],
        paymentMethod: selectedPaymentMethod,
        customerName: customerName || "Umum",
        customerPhone: customerPhone || "",
        amountGiven: amountGiven,
        change: selectedPaymentMethod === PaymentMethod.CASH ? change : 0,
    };
    setTransactions(prev => [newTransaction, ...prev]);
    setProducts(updatedProducts);
    setIsPaymentModalOpen(false);
    setIsMobileCartOpen(false);
    clearCart();
    if (confirm("Transaksi Berhasil! Cetak Struk?")) generateReceipt(newTransaction);
  };

  const generateReceipt = (transaction: Transaction) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, 150] });
    doc.setFont("courier", "bold"); doc.setFontSize(12); doc.text(storeProfile.name, 40, 10, { align: 'center' });
    doc.setFont("courier", "normal"); doc.setFontSize(8); doc.text(storeProfile.address, 40, 15, { align: 'center' });
    doc.text("------------------------------------------", 40, 20, { align: 'center' });
    let y = 25;
    transaction.items.forEach(item => {
        doc.text(item.name, 5, y); y += 4;
        doc.text(`${item.quantity} x ${item.price.toLocaleString()}`, 5, y);
        doc.text((item.price * item.quantity).toLocaleString(), 75, y, { align: 'right' }); y += 5;
    });
    doc.text("------------------------------------------", 40, y, { align: 'center' }); y += 5;
    doc.setFontSize(10); doc.text("TOTAL:", 35, y, { align: 'right' }); doc.text(transaction.total.toLocaleString(), 75, y, { align: 'right' });
    window.open(doc.output('bloburl'), '_blank');
  };

  const handleAddProduct = () => { setEditingProduct(null); setNewProductBarcode(''); setIsProductFormOpen(true); };
  const handleEditProduct = (product: Product) => { setEditingProduct(product); setIsProductFormOpen(true); };
  const handleDeleteProduct = (id: string) => { if(confirm('Hapus produk?')) setProducts(prev => prev.filter(p => p.id !== id)); };
  const handleSaveProduct = (data: any) => {
    if (data.id) setProducts(prev => prev.map(p => p.id === data.id ? data : p));
    else setProducts(prev => [...prev, { ...data, id: Date.now().toString() }]);
  };

  const currentSalesData = useMemo(() => {
    const grouped: Record<string, number> = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today); d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        grouped[key] = 0;
    }
    transactions.forEach(tx => {
        const key = new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        if (grouped[key] !== undefined) grouped[key] += tx.total;
    });
    return Object.keys(grouped).map(key => ({ time: key, sales: grouped[key] }));
  }, [transactions]);

  const dynamicCategoriesFilter = useMemo(() => ['Semua', ...Array.from(new Set(products.map(p => p.category))).sort()], [products]);

  // Sidebar Component for Desktop
  const DesktopSidebar = () => (
    <aside className="hidden lg:flex w-24 border-r border-border bg-surface flex-col items-center py-6 z-20">
        <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-black shadow-lg mb-8 overflow-hidden">
            {storeProfile.logo ? <img src={storeProfile.logo} className="w-full h-full object-cover" /> : <Store size={24} />}
        </div>
        <nav className="flex-1 flex flex-col gap-6 w-full px-2">
            {[
                { mode: ViewMode.POS, icon: LayoutDashboard, label: 'POS' },
                { mode: ViewMode.INVENTORY, icon: Package, label: 'Stok' },
                { mode: ViewMode.REPORTS, icon: TrendingUp, label: 'Laporan' },
                { mode: ViewMode.PROFILE, icon: Settings, label: 'Profil' }
            ].map(item => (
                <button 
                    key={item.mode}
                    onClick={() => setViewMode(item.mode)}
                    className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${viewMode === item.mode ? 'bg-accent/20 text-accent' : 'text-textMuted hover:bg-black/5'}`}
                >
                    <item.icon size={22} />
                    <span className="text-[10px] font-bold">{item.label}</span>
                </button>
            ))}
        </nav>
        <button onClick={toggleTheme} className="mb-4 p-3 rounded-xl text-textMuted hover:bg-black/5">
            {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
        </button>
    </aside>
  );

  // Bottom Navigation for Mobile
  const MobileBottomNav = () => (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex justify-around items-center h-16 z-40 px-2 pb-safe">
        {[
            { mode: ViewMode.POS, icon: LayoutDashboard, label: 'POS' },
            { mode: ViewMode.INVENTORY, icon: Package, label: 'Stok' },
            { mode: ViewMode.REPORTS, icon: TrendingUp, label: 'Laporan' },
            { mode: ViewMode.PROFILE, icon: Settings, label: 'Profil' }
        ].map(item => (
            <button 
                key={item.mode}
                onClick={() => setViewMode(item.mode)}
                className={`flex flex-col items-center gap-1 transition-all ${viewMode === item.mode ? 'text-accent' : 'text-textMuted'}`}
            >
                <item.icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
            </button>
        ))}
    </nav>
  );

  const CartContent = () => (
    <div className="flex flex-col h-full bg-surface">
        <div className="p-4 border-b border-border flex justify-between items-center bg-surface sticky top-0 z-10">
            <h2 className="font-bold text-lg flex items-center gap-2">
                <ShoppingCart size={20} className="text-accent" /> Keranjang
            </h2>
            <div className="flex gap-4">
                <button onClick={clearCart} className="text-xs text-red-400">Clear</button>
                <button onClick={() => setIsMobileCartOpen(false)} className="lg:hidden text-textMuted"><X size={20}/></button>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-textMuted opacity-50 gap-2">
                    <ShoppingCart size={40} /> <p className="text-sm">Kosong</p>
                </div>
            ) : cart.map(item => (
                <div key={item.id} className="flex gap-3 bg-background p-3 rounded-xl border border-border">
                    <img src={item.image} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">{item.name}</h4>
                        <div className="flex justify-between items-center mt-1">
                            <span className="text-accent font-bold text-xs">Rp {item.price.toLocaleString()}</span>
                            <div className="flex items-center gap-2 bg-surface rounded-lg px-2 py-1 border border-border">
                                <button onClick={() => updateQuantity(item.id, -1)} className="p-0.5"><Minus size={12}/></button>
                                <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} className="p-0.5"><Plus size={12}/></button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        <div className="p-4 bg-surface border-t border-border shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
                <span className="text-textMuted text-sm">Total Belanja</span>
                <span className="text-xl font-bold text-accent">Rp {total.toLocaleString()}</span>
            </div>
            <div className="space-y-2">
                <button onClick={() => initiatePayment(PaymentMethod.CASH)} disabled={cart.length === 0} className="w-full py-3.5 bg-accent text-black font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                    <Banknote size={18} /> Bayar Tunai
                </button>
                <button onClick={() => initiatePayment(PaymentMethod.QRIS)} disabled={cart.length === 0} className="w-full py-3.5 bg-background border border-accent/30 text-accent font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                    <QrCode size={18} /> Scan QRIS
                </button>
            </div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-textMain overflow-hidden">
      <DesktopSidebar />
      <main className="flex-1 flex flex-col overflow-hidden mb-16 lg:mb-0">
        {viewMode === ViewMode.INVENTORY ? (
            <InventoryView products={products} storeName={storeProfile.name} onAdd={handleAddProduct} onEdit={handleEditProduct} onDelete={handleDeleteProduct} onUpdateStock={(p, q) => setProducts(products.map(x => x.id === p.id ? {...x, stock: x.stock + q} : x))} onNewProduct={(b) => {setNewProductBarcode(b); setIsProductFormOpen(true);}} onExport={()=>{}} />
        ) : viewMode === ViewMode.REPORTS ? (
            <ReportView transactions={transactions} storeProfile={storeProfile} onDelete={(id)=>setTransactions(transactions.filter(t=>t.id!==id))} onUpdate={(tx)=>setTransactions(transactions.map(t=>t.id===tx.id?tx:t))} onCreate={(tx)=>setTransactions([tx, ...transactions])} onPrint={generateReceipt} />
        ) : viewMode === ViewMode.PROFILE ? (
            <ProfileView profile={storeProfile} onSave={setStoreProfile} onExportBackup={handleExportBackup} onImportBackup={handleImportBackup} />
        ) : (
            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 flex flex-col border-r border-border">
                    <div className="p-4 border-b border-border bg-background flex flex-col gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                            <input type="text" placeholder="Cari produk..." className="w-full bg-surface border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-accent" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                            {dynamicCategoriesFilter.map(cat => (
                                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition-all border ${selectedCategory === cat ? 'bg-accent text-black border-accent font-bold' : 'bg-surface border-border text-textMuted'}`}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 bg-background">
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                            {filteredProducts.map(product => <ProductCard key={product.id} product={product} onAdd={addToCart} />)}
                        </div>
                    </div>
                </div>

                {/* Desktop Cart Sidebar */}
                <div className="hidden lg:flex w-80 xl:w-96 flex-col border-l border-border bg-surface">
                    <CartContent />
                    <div className="p-4 border-t border-border bg-background/30 h-48">
                        <h3 className="text-xs font-bold text-textMuted mb-2 uppercase tracking-wider">Statistik 7 Hari</h3>
                        <div className="h-32"><SalesChart data={currentSalesData} /></div>
                    </div>
                </div>

                {/* Mobile Cart FAB */}
                {cart.length > 0 && (
                    <button 
                        onClick={() => setIsMobileCartOpen(true)}
                        className="lg:hidden fixed bottom-20 right-4 z-30 bg-accent text-black p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4"
                    >
                        <div className="relative">
                            <ShoppingCart size={24} />
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{cart.reduce((a, b) => a + b.quantity, 0)}</span>
                        </div>
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-[10px] opacity-70">Total</span>
                            <span className="text-sm font-bold">Rp {total.toLocaleString()}</span>
                        </div>
                    </button>
                )}

                {/* Mobile Cart Drawer Overlay */}
                {isMobileCartOpen && (
                    <div className="lg:hidden fixed inset-0 z-50 animate-in fade-in duration-200">
                        <div className="absolute inset-0 bg-black/60" onClick={() => setIsMobileCartOpen(false)} />
                        <div className="absolute inset-x-0 bottom-0 h-[85vh] bg-surface rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
                            <div className="w-12 h-1.5 bg-border rounded-full mx-auto mt-3 mb-1" onClick={() => setIsMobileCartOpen(false)} />
                            <CartContent />
                        </div>
                    </div>
                )}
            </div>
        )}
      </main>

      <MobileBottomNav />

      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} total={total} method={selectedPaymentMethod} onConfirm={handlePaymentSuccess} qrisImage={storeProfile.qrisImage} />
      <ProductForm isOpen={isProductFormOpen} onClose={() => setIsProductFormOpen(false)} onSubmit={handleSaveProduct} initialData={editingProduct} defaultBarcode={newProductBarcode} existingCategories={dynamicCategoriesFilter.filter(c => c !== 'Semua')} />
    </div>
  );
}

export default App;
