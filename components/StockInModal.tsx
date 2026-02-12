import React, { useState, useEffect, useRef } from 'react';
import { X, ScanBarcode, PackagePlus, Search, Plus } from 'lucide-react';
import { Product } from '../types';

interface StockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateStock: (product: Product, quantity: number) => void;
  onNewProduct: (barcode: string) => void;
}

const StockInModal: React.FC<StockInModalProps> = ({ isOpen, onClose, products, onUpdateStock, onNewProduct }) => {
  const [barcode, setBarcode] = useState('');
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setBarcode('');
      setFoundProduct(null);
      setQuantity(1);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode) return;

    const product = products.find(p => p.barcode === barcode);
    if (product) {
      setFoundProduct(product);
      setQuantity(1);
    } else {
      // New Product Logic
      if (confirm(`Barcode "${barcode}" tidak ditemukan. Buat produk baru?`)) {
          onNewProduct(barcode);
          onClose();
      }
    }
  };

  const handleSubmitStock = () => {
      if (foundProduct && quantity > 0) {
          onUpdateStock(foundProduct, quantity);
          // Reset for next scan
          setBarcode('');
          setFoundProduct(null);
          setQuantity(1);
          inputRef.current?.focus();
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-md rounded-2xl border border-border shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-[#0D1117]">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <PackagePlus className="text-accent" />
            Barang Masuk (Stock In)
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-border rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {!foundProduct ? (
            <form onSubmit={handleScan} className="space-y-4">
               <div className="text-center mb-6">
                   <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                       <ScanBarcode size={40} className="text-accent" />
                   </div>
                   <p className="text-gray-300">Scan barcode atau ketik kode barang manual</p>
               </div>

               <div>
                 <input 
                    ref={inputRef}
                    type="text" 
                    value={barcode}
                    onChange={e => setBarcode(e.target.value)}
                    className="w-full bg-background border border-accent rounded-xl py-4 px-4 text-center text-xl font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-accent/50"
                    placeholder="SCAN BARCODE..."
                    autoFocus
                 />
               </div>
               
               <button 
                type="submit"
                className="w-full py-3 bg-accent hover:bg-accentHover text-black font-bold rounded-xl transition-all"
               >
                 Cek Barang
               </button>
            </form>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
               <div className="flex gap-4 bg-background p-4 rounded-xl border border-border">
                  <img src={foundProduct.image} alt={foundProduct.name} className="w-20 h-20 rounded-lg object-cover" />
                  <div>
                      <h3 className="font-bold text-lg text-white">{foundProduct.name}</h3>
                      <p className="text-sm text-gray-400 font-mono">{foundProduct.barcode}</p>
                      <p className="text-sm text-accent mt-1">Stok Saat Ini: {foundProduct.stock}</p>
                  </div>
               </div>

               <div>
                   <label className="block text-sm font-medium text-gray-400 mb-2">Jumlah Barang Masuk</label>
                   <div className="flex items-center gap-3">
                       <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-3 bg-surface border border-border rounded-lg hover:border-accent"
                       >
                           -
                       </button>
                       <input 
                        type="number" 
                        value={quantity}
                        onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                        className="flex-1 bg-background border border-border rounded-lg py-3 text-center font-bold text-lg focus:border-accent focus:outline-none"
                       />
                       <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-3 bg-surface border border-border rounded-lg hover:border-accent"
                       >
                           +
                       </button>
                   </div>
               </div>

               <div className="flex gap-3">
                   <button 
                    onClick={() => setFoundProduct(null)}
                    className="flex-1 py-3 bg-surface border border-border hover:bg-border text-gray-300 font-bold rounded-xl"
                   >
                       Batal
                   </button>
                   <button 
                    onClick={handleSubmitStock}
                    className="flex-[2] py-3 bg-accent hover:bg-accentHover text-black font-bold rounded-xl flex items-center justify-center gap-2"
                   >
                       <Plus size={20} /> Tambah Stok
                   </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockInModal;