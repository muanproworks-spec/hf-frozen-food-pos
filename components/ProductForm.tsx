
import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Image as ImageIcon, ScanBarcode, PlusCircle, LayoutGrid } from 'lucide-react';
import { Product } from '../types';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<Product, 'id'> | Product) => void;
  initialData?: Product | null;
  defaultBarcode?: string;
  existingCategories: string[];
}

const ProductForm: React.FC<ProductFormProps> = ({ isOpen, onClose, onSubmit, initialData, defaultBarcode, existingCategories }) => {
  const [isNewCategoryMode, setIsNewCategoryMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    price: 0,
    costPrice: 0,
    category: '',
    image: '',
    stock: 0
  });

  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setIsNewCategoryMode(false);
    } else {
      setFormData({
        name: '',
        barcode: defaultBarcode || '',
        price: 0,
        costPrice: 0,
        category: existingCategories[0] || '',
        image: '',
        stock: 0
      });
      setIsNewCategoryMode(false);
    }
  }, [initialData, isOpen, defaultBarcode, existingCategories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category.trim()) {
        alert("Kategori tidak boleh kosong");
        return;
    }
    const submissionData = {
        ...formData,
        image: formData.image || `https://picsum.photos/id/${Math.floor(Math.random() * 100) + 100}/200/200`
    };
    onSubmit(initialData ? { ...submissionData, id: initialData.id } : submissionData);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setFormData({ ...formData, image: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-lg rounded-2xl border border-border theme-shadow flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
          <h2 className="text-xl font-bold flex items-center gap-2 text-textMain">
            {initialData ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-background rounded-full transition-colors text-textMuted">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 no-scrollbar">
          
          <div className="grid grid-cols-3 gap-4">
             <div className="col-span-2">
                <label className="block text-sm font-medium text-textMuted mb-1">Nama Produk</label>
                <input 
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-background border border-border rounded-lg p-3 focus:border-accent focus:outline-none text-textMain transition-all"
                placeholder="Contoh: Nugget Ayam"
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Barcode</label>
                <div className="relative">
                    <input 
                    type="text"
                    value={formData.barcode}
                    onChange={e => setFormData({...formData, barcode: e.target.value})}
                    className="w-full bg-background border border-border rounded-lg p-3 pl-8 focus:border-accent focus:outline-none font-mono text-sm text-textMain"
                    placeholder="Scan.."
                    />
                    <ScanBarcode className="absolute left-2 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Harga Modal (Beli)</label>
                <input 
                  required
                  type="number"
                  min="0"
                  value={formData.costPrice}
                  onChange={e => setFormData({...formData, costPrice: Number(e.target.value)})}
                  className="w-full bg-background border border-border rounded-lg p-3 focus:border-accent focus:outline-none text-textMain"
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-accent mb-1">Harga Jual</label>
                <input 
                  required
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                  className="w-full bg-background border border-accent/30 rounded-lg p-3 focus:border-accent focus:outline-none font-bold text-textMain"
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-textMuted">Kategori</label>
                <button 
                  type="button" 
                  onClick={() => {
                      setIsNewCategoryMode(!isNewCategoryMode);
                      if (!isNewCategoryMode) setFormData({...formData, category: ''});
                  }}
                  className="text-[10px] flex items-center gap-1 text-accent font-bold hover:underline"
                >
                  {isNewCategoryMode ? <LayoutGrid size={10} /> : <PlusCircle size={10} />}
                  {isNewCategoryMode ? 'Pilih Daftar' : 'Kategori Baru'}
                </button>
              </div>
              
              {isNewCategoryMode ? (
                  <div className="animate-in fade-in slide-in-from-left-2 duration-200">
                    <input 
                        required
                        type="text"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-background border border-accent/50 rounded-lg p-3 focus:border-accent focus:outline-none text-textMain placeholder:text-textMuted/50"
                        placeholder="Nama kategori baru..."
                        autoFocus
                    />
                  </div>
              ) : (
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-background border border-border rounded-lg p-3 focus:border-accent focus:outline-none text-textMain appearance-none cursor-pointer"
                  >
                    {existingCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    {existingCategories.length === 0 && <option value="">Belum ada kategori</option>}
                  </select>
              )}
            </div>
            <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Stok Awal</label>
                <input 
                  required
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                  className="w-full bg-background border border-border rounded-lg p-3 focus:border-accent focus:outline-none text-textMain"
                />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-textMuted mb-2">Foto Produk</label>
             <div 
                className={`relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-colors min-h-[150px]
                    ${dragActive ? 'border-accent bg-accent/10' : 'border-border bg-background hover:bg-surface/50'}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
             >
                <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                />
                
                {formData.image ? (
                    <div className="relative w-full h-40 group">
                        <img src={formData.image} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                            <label htmlFor="file-upload" className="cursor-pointer text-white font-medium flex items-center gap-2">
                                <Upload size={16} /> Ganti Foto
                            </label>
                        </div>
                    </div>
                ) : (
                    <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer text-center">
                        <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center mb-2 border border-border">
                            <ImageIcon className="text-textMuted" size={24} />
                        </div>
                        <p className="text-sm font-medium text-textMain">Klik untuk upload</p>
                        <p className="text-xs text-textMuted mt-1">atau drag & drop gambar disini</p>
                    </label>
                )}
             </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full py-3 bg-accent hover:bg-accentHover text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]"
            >
              <Save size={18} />
              Simpan Produk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
