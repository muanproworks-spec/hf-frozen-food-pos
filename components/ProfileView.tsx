
import React, { useState, useRef } from 'react';
import { 
  Save, 
  Building, 
  MapPin, 
  User, 
  Upload, 
  QrCode, 
  Database, 
  Download, 
  UploadCloud, 
  RefreshCcw,
  ShieldAlert
} from 'lucide-react';
import { StoreProfile } from '../types';

interface ProfileViewProps {
  profile: StoreProfile;
  onSave: (profile: StoreProfile) => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, onSave, onExportBackup, onImportBackup }) => {
  const [formData, setFormData] = useState<StoreProfile>(profile);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'qrisImage') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData({ ...formData, [field]: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const onFileImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportBackup(e.target.files[0]);
    }
    // Clear input so same file can be imported again if needed
    if (e.target) e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    alert('Pengaturan Profil Tersimpan!');
  };

  return (
    <div className="flex-1 bg-background flex flex-col h-screen overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto w-full pb-20">
        {/* Header */}
        <div className="mb-8 border-b border-border pb-6">
          <h1 className="text-2xl font-bold text-textMain flex items-center gap-2">
            <Building className="text-accent" />
            Pengaturan Toko
          </h1>
          <p className="text-textMuted text-sm mt-1">Kelola identitas toko, admin, dan keamanan database.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Identity Section */}
          <div className="bg-surface rounded-2xl border border-border p-6 theme-shadow">
            <h2 className="text-lg font-bold text-textMain mb-6 flex items-center gap-2">
              <User size={20} className="text-accent" />
              Identitas & Admin
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-textMuted mb-2">Nama Toko</label>
                <input 
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl p-3 focus:border-accent focus:outline-none text-textMain transition-all"
                  placeholder="Contoh: HF Frozen Food"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-textMuted mb-2">Nama Admin</label>
                <input 
                  type="text"
                  required
                  value={formData.adminName}
                  onChange={e => setFormData({...formData, adminName: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl p-3 focus:border-accent focus:outline-none text-textMain transition-all"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-textMuted mb-2">Alamat Lengkap</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl p-3 focus:border-accent focus:outline-none text-textMain resize-none transition-all"
                  placeholder="Alamat toko..."
                />
              </div>
            </div>
          </div>

          {/* Media Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface rounded-2xl border border-border p-6 theme-shadow flex flex-col">
               <h2 className="text-lg font-bold text-textMain mb-4 flex items-center gap-2">
                  <Upload size={20} className="text-accent" />
                  Logo Toko
                </h2>
                <div className="flex-1 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-border rounded-xl p-6 hover:bg-background transition-colors relative group min-h-[200px]">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={(e) => handleFileChange(e, 'logo')}
                    />
                    
                    {formData.logo ? (
                      <div className="relative w-32 h-32">
                        <img src={formData.logo} alt="Logo" className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                           <span className="text-xs text-white">Ganti Logo</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-background border border-border rounded-full flex items-center justify-center">
                        <Building size={32} className="text-textMuted" />
                      </div>
                    )}
                    <p className="text-sm text-textMuted text-center">
                        {formData.logo ? 'Klik untuk mengganti logo' : 'Upload Logo Toko (PNG/JPG)'}
                    </p>
                </div>
            </div>

            <div className="bg-surface rounded-2xl border border-border p-6 theme-shadow flex flex-col">
               <h2 className="text-lg font-bold text-textMain mb-4 flex items-center gap-2">
                  <QrCode size={20} className="text-accent" />
                  QRIS Toko
                </h2>
                <div className="flex-1 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-border rounded-xl p-6 hover:bg-background transition-colors relative group min-h-[200px]">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={(e) => handleFileChange(e, 'qrisImage')}
                    />
                    
                    {formData.qrisImage ? (
                      <div className="relative w-32 h-32">
                        <img src={formData.qrisImage} alt="QRIS" className="w-full h-full object-contain" />
                         <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                           <span className="text-xs text-white">Ganti QRIS</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center border border-border">
                         <QrCode size={40} className="text-black" />
                      </div>
                    )}
                    <p className="text-sm text-textMuted text-center">
                        {formData.qrisImage ? 'Klik untuk mengganti gambar QRIS' : 'Upload Gambar QRIS Toko'}
                    </p>
                </div>
            </div>
          </div>

          {/* Database & Backup Section */}
          <div className="bg-surface rounded-2xl border border-border p-6 theme-shadow">
            <h2 className="text-lg font-bold text-textMain mb-2 flex items-center gap-2">
              <Database size={20} className="text-accent" />
              Database & Keamanan
            </h2>
            <p className="text-xs text-textMuted mb-6">Amankan data Anda dengan melakukan backup berkala atau pindahkan data ke perangkat baru.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-4 bg-background border border-border rounded-xl hover:border-accent/30 transition-all flex flex-col justify-between group">
                  <div>
                    <h3 className="font-bold text-textMain text-sm flex items-center gap-2">
                        <Download size={16} className="text-blue-400" />
                        Ekspor Data Backup
                    </h3>
                    <p className="text-[10px] text-textMuted mt-1">Unduh seluruh data (produk, transaksi, profil) dalam satu file JSON.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={onExportBackup}
                    className="mt-4 w-full py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    Mulai Ekspor
                  </button>
               </div>

               <div className="p-4 bg-background border border-border rounded-xl hover:border-accent/30 transition-all flex flex-col justify-between group">
                  <div>
                    <h3 className="font-bold text-textMain text-sm flex items-center gap-2">
                        <UploadCloud size={16} className="text-amber-400" />
                        Impor Data Backup
                    </h3>
                    <p className="text-[10px] text-textMuted mt-1">Pulihkan data dari file backup yang sudah ada sebelumnya.</p>
                  </div>
                  <input 
                    type="file" 
                    accept=".json" 
                    className="hidden" 
                    ref={importInputRef} 
                    onChange={onFileImportChange}
                  />
                  <button 
                    type="button"
                    onClick={handleImportClick}
                    className="mt-4 w-full py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    Pilih File Backup
                  </button>
               </div>
            </div>

            <div className="mt-6 p-4 bg-red-500/5 border border-red-500/20 rounded-xl flex items-start gap-3">
               <ShieldAlert className="text-red-400 shrink-0" size={18} />
               <div>
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Peringatan Keamanan</h4>
                  <p className="text-[10px] text-textMuted mt-1 leading-relaxed">
                    Jangan bagikan file backup Anda kepada siapapun. File ini berisi data finansial dan riwayat transaksi yang bersifat rahasia. Mengimpor data akan menghapus seluruh database saat ini secara permanen.
                  </p>
               </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              className="px-10 py-4 bg-accent hover:bg-accentHover text-black font-bold rounded-2xl shadow-[0_8px_30px_rgb(20,184,166,0.2)] flex items-center gap-2 transition-all transform active:scale-95"
            >
              <Save size={20} />
              Simpan Profil & Pengaturan
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ProfileView;
