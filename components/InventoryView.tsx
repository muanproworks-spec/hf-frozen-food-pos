
import React, { useState } from 'react';
import { Edit2, Trash2, Package, Search, Plus, FileText, ScanBarcode } from 'lucide-react';
import { Product } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import StockInModal from './StockInModal';

interface InventoryViewProps {
  products: Product[];
  storeName: string; 
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onUpdateStock: (product: Product, quantity: number) => void;
  onNewProduct: (barcode: string) => void;
  onExport: () => void;
}

const InventoryView: React.FC<InventoryViewProps> = ({ products, storeName, onEdit, onDelete, onAdd, onUpdateStock, onNewProduct }) => {
  const [filter, setFilter] = useState('');
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);

  const filtered = products.filter(p => 
      p.name.toLowerCase().includes(filter.toLowerCase()) || 
      p.barcode?.includes(filter)
  );

  const handleExport = () => {
    const doc = new jsPDF();
    doc.setFillColor(13, 17, 23); 
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(20, 184, 166); 
    doc.setFontSize(22);
    doc.text(storeName, 14, 20); 
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text("Laporan Stok & Valuasi Aset", 14, 30);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 36);

    const tableData = products.map(p => [
        p.barcode || '-',
        p.name,
        p.category,
        `Rp ${p.costPrice.toLocaleString('id-ID')}`, 
        `Rp ${p.price.toLocaleString('id-ID')}`,     
        p.stock,
        `Rp ${(p.costPrice * p.stock).toLocaleString('id-ID')}` 
    ]);

    autoTable(doc, {
        head: [['Barcode', 'Nama Produk', 'Kategori', 'HPP', 'Harga Jual', 'Stok', 'Valuasi']],
        body: tableData,
        startY: 45,
        theme: 'grid',
        headStyles: { fillColor: [22, 27, 34], textColor: [20, 184, 166] },
        styles: { fontSize: 8, cellPadding: 2 },
        foot: [['', '', '', '', '', 'Total Valuasi', `Rp ${products.reduce((acc, p) => acc + (p.costPrice * p.stock), 0).toLocaleString('id-ID')}`]]
    });

    doc.save("Laporan-Stok-Valuasi.pdf");
  };

  return (
    <div className="flex-1 bg-background flex flex-col h-screen overflow-hidden">
      <div className="p-6 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textMain flex items-center gap-2">
            <Package className="text-accent" />
            Manajemen Stok
          </h1>
          <p className="text-textMuted text-sm mt-1">Kelola database produk, harga modal, dan inventaris toko.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
           <button 
            onClick={() => setIsStockInModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-sm transition-colors shadow-lg"
           >
             <ScanBarcode size={16} /> Scan Barang Masuk
           </button>
           <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border hover:bg-border rounded-lg text-sm transition-colors text-textMain"
           >
             <FileText size={16} /> Export PDF
           </button>
           <button 
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accentHover text-black font-bold rounded-lg text-sm transition-colors shadow-[0_0_15px_rgba(20,184,166,0.2)]"
           >
             <Plus size={16} /> Tambah Produk
           </button>
        </div>
      </div>

      <div className="p-4 bg-surface/30 border-b border-border">
         <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atau barcode..." 
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="w-full bg-background border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-accent text-textMain"
            />
         </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-background/50 text-textMuted border-b border-border">
              <tr>
                <th className="p-4 font-medium">Barcode</th>
                <th className="p-4 font-medium">Produk</th>
                <th className="p-4 font-medium">Kategori</th>
                <th className="p-4 font-medium">Modal (HPP)</th>
                <th className="p-4 font-medium">Harga Jual</th>
                <th className="p-4 font-medium text-center">Stok</th>
                <th className="p-4 font-medium text-center">Status</th>
                <th className="p-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(product => (
                <tr key={product.id} className="hover:bg-black/5 transition-colors">
                  <td className="p-4 font-mono text-textMuted text-xs">{product.barcode || '-'}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={product.image} className="w-10 h-10 rounded-lg object-cover bg-gray-200" alt="" />
                      <span className="font-medium text-textMain">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-textMuted">
                    <span className="px-2 py-1 rounded bg-background/50 border border-border text-xs">
                        {product.category}
                    </span>
                  </td>
                  <td className="p-4 text-textMuted">Rp {product.costPrice.toLocaleString('id-ID')}</td>
                  <td className="p-4 text-accent font-medium">Rp {product.price.toLocaleString('id-ID')}</td>
                  <td className="p-4 text-center font-mono text-textMain">{product.stock}</td>
                  <td className="p-4 text-center">
                    {product.stock > 10 ? (
                        <span className="text-green-500 text-xs bg-green-500/10 px-2 py-1 rounded-full">Aman</span>
                    ) : product.stock > 0 ? (
                        <span className="text-yellow-500 text-xs bg-yellow-500/10 px-2 py-1 rounded-full">Menipis</span>
                    ) : (
                        <span className="text-red-500 text-xs bg-red-500/10 px-2 py-1 rounded-full">Habis</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                        <button 
                            onClick={() => onEdit(product)}
                            className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button 
                            onClick={() => onDelete(product.id)}
                            className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                    <td colSpan={8} className="p-8 text-center text-textMuted">
                        Tidak ada produk ditemukan.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StockInModal 
        isOpen={isStockInModalOpen}
        onClose={() => setIsStockInModalOpen(false)}
        products={products}
        onUpdateStock={onUpdateStock}
        onNewProduct={onNewProduct}
      />
    </div>
  );
};

export default InventoryView;
