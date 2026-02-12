
import React, { useMemo, useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  CartesianGrid 
} from 'recharts';
import { 
  Search, 
  Edit2, 
  Trash2, 
  Printer, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  CreditCard, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  PieChart,
  PlusCircle,
  X,
  Save
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, PaymentMethod, StoreProfile } from '../types';

interface ReportViewProps {
  transactions: Transaction[];
  storeProfile: StoreProfile;
  onDelete: (id: string) => void;
  onUpdate: (tx: Transaction) => void;
  onCreate: (tx: Transaction) => void;
  onPrint: (tx: Transaction) => void;
}

const ReportView: React.FC<ReportViewProps> = ({ transactions, storeProfile, onDelete, onUpdate, onCreate, onPrint }) => {
  const [txSearch, setTxSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  
  const [formData, setFormData] = useState<Partial<Transaction>>({
      customerName: 'Umum',
      customerPhone: '',
      total: 0,
      paymentMethod: PaymentMethod.CASH,
      date: new Date().toISOString()
  });

  const metrics = useMemo(() => {
    const totalRevenue = transactions.reduce((acc, curr) => acc + curr.total, 0);
    const totalTx = transactions.length;
    const avgBasket = totalTx > 0 ? totalRevenue / totalTx : 0;
    const qrisRevenue = transactions.filter(t => t.paymentMethod === PaymentMethod.QRIS).reduce((acc, t) => acc + t.total, 0);
    const cashRevenue = totalRevenue - qrisRevenue;
    let totalCOGS = 0;
    transactions.forEach(tx => {
        tx.items?.forEach(item => {
            totalCOGS += (item.costPrice || 0) * item.quantity;
        });
    });
    const netSales = totalRevenue; // Pajak 0
    const grossProfit = netSales - totalCOGS;
    return { totalRevenue, totalTx, avgBasket, qrisRevenue, cashRevenue, grossProfit };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => 
        tx.id.toLowerCase().includes(txSearch.toLowerCase()) || 
        tx.customerName.toLowerCase().includes(txSearch.toLowerCase())
    );
  }, [transactions, txSearch]);

  const chartData = useMemo(() => {
    const groupedByDate: Record<string, number> = {};
    const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const today = new Date();
    for(let i=6; i>=0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        groupedByDate[key] = 0;
    }

    sortedTx.forEach(tx => {
        const dateStr = new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        if (groupedByDate[dateStr] !== undefined) {
            groupedByDate[dateStr] += tx.total;
        }
    });
    return Object.keys(groupedByDate).map(date => ({
        date,
        sales: groupedByDate[date]
    }));
  }, [transactions]);

  const handleOpenModal = (tx?: Transaction) => {
      if (tx) {
          setEditingTx(tx);
          setFormData(tx);
      } else {
          setEditingTx(null);
          setFormData({
              id: `TX-${Date.now().toString().slice(-6)}`,
              customerName: 'Umum',
              customerPhone: '',
              total: 0,
              paymentMethod: PaymentMethod.CASH,
              date: new Date().toISOString(),
              items: []
          });
      }
      setIsModalOpen(true);
  };

  const handleSave = () => {
      if (editingTx) {
          onUpdate(formData as Transaction);
      } else {
          onCreate(formData as Transaction);
      }
      setIsModalOpen(false);
  };

  const exportFinancialPDF = () => {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFillColor(13, 17, 23);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(20, 184, 166);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text(storeProfile.name, 14, 20);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(storeProfile.address, 14, 26);
      doc.setFontSize(12);
      doc.text("Laporan Keuangan & Laba Rugi", 14, 34);
      doc.text(`Periode: 30 Hari Terakhir | Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 39);
      let yPos = 50;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Ringkasan Kinerja", 14, yPos);
      yPos += 10;
      const summaryData = [
          ["Total Pendapatan", `Rp ${metrics.totalRevenue.toLocaleString('id-ID')}`],
          ["Total HPP (COGS)", `(Rp ${(metrics.totalRevenue - metrics.grossProfit).toLocaleString('id-ID')})`],
          ["Laba Kotor (Gross Profit)", `Rp ${metrics.grossProfit.toLocaleString('id-ID')}`]
      ];
      autoTable(doc, {
          startY: yPos,
          head: [['Keterangan', 'Nilai']],
          body: summaryData,
          theme: 'striped',
          headStyles: { fillColor: [22, 27, 34], textColor: [20, 184, 166] },
          columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } }
      });
      yPos = (doc as any).lastAutoTable.finalY + 15;
      doc.text("Rincian Transaksi Terakhir", 14, yPos);
      const tableData = transactions.slice(0, 50).map(tx => [
          tx.id,
          new Date(tx.date).toLocaleDateString('id-ID'),
          tx.paymentMethod,
          `Rp ${tx.total.toLocaleString('id-ID')}`
      ]);
      autoTable(doc, {
          startY: yPos + 5,
          head: [['ID Transaksi', 'Tanggal', 'Metode', 'Total']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [20, 184, 166], textColor: [0, 0, 0] },
          styles: { fontSize: 9 },
      });
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`${storeProfile.name} POS System - Confidential Report`, 14, pageHeight - 10);
      doc.save("Laporan-Keuangan-HF-Frozen.pdf");
  };

  return (
    <div className="flex-1 bg-background flex flex-col h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
              <h1 className="text-2xl font-bold text-textMain flex items-center gap-2">
                  <TrendingUp className="text-accent" />
                  Laporan Keuangan
              </h1>
              <p className="text-textMuted text-sm mt-1">Kelola transaksi, analisis performa, dan laba rugi.</p>
          </div>
          <div className="flex gap-3">
              <button 
                  onClick={() => handleOpenModal()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-background border border-accent text-accent hover:bg-accent/10 font-bold rounded-xl transition-all"
              >
                  <PlusCircle size={18} />
                  Transaksi Manual
              </button>
              <button 
                  onClick={exportFinancialPDF}
                  className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accentHover text-black font-bold rounded-xl transition-all shadow-[0_4px_20px_rgba(20,184,166,0.2)] active:scale-95"
              >
                  <FileText size={18} />
                  Export PDF
              </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard 
              title="Total Omzet" 
              value={`Rp ${metrics.totalRevenue.toLocaleString('id-ID')}`} 
              icon={<DollarSign size={20} />}
          />
          <SummaryCard 
              title="Laba Kotor" 
              value={`Rp ${metrics.grossProfit.toLocaleString('id-ID')}`} 
              icon={<PieChart size={20} />}
              color="text-green-500"
          />
          <SummaryCard 
              title="Total Transaksi" 
              value={metrics.totalTx.toString()} 
              icon={<ShoppingBag size={20} />}
          />
          <SummaryCard 
              title="Metode QRIS" 
              value={`${Math.round((metrics.qrisRevenue / (metrics.totalRevenue || 1)) * 100)}%`} 
              icon={<CreditCard size={20} />}
              subtext={`Total: Rp ${metrics.qrisRevenue.toLocaleString('id-ID')}`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[350px]">
          <div className="lg:col-span-2 bg-surface p-6 rounded-2xl border border-border flex flex-col shadow-xl">
              <h3 className="text-sm font-bold text-textMain mb-4">Tren Omzet (7 Hari Terakhir)</h3>
              <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                          <defs>
                              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                          <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k`} />
                          <Tooltip 
                              contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--text-main)' }}
                              formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Total']}
                          />
                          <Area type="monotone" dataKey="sales" stroke="#14B8A6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-border flex flex-col shadow-xl">
              <h3 className="text-sm font-bold text-textMain mb-4">Sebaran Pembayaran</h3>
              <div className="flex-1 w-full flex items-center justify-center">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                          { name: 'QRIS', value: metrics.qrisRevenue },
                          { name: 'Tunai', value: metrics.cashRevenue }
                      ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                          <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} axisLine={false} tickLine={false} />
                          <Tooltip 
                              cursor={{fill: 'rgba(0,0,0,0.05)'}}
                              contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '12px' }}
                          />
                          <Bar dataKey="value" fill="#14B8A6" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-2xl flex flex-col mb-10">
           <div className="p-5 border-b border-border bg-surface/50 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-textMain">Riwayat & Manajemen Transaksi</h3>
                <p className="text-xs text-textMuted mt-1">Gunakan tombol di kolom Aksi untuk Edit, Cetak, atau Hapus.</p>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
                <input 
                  type="text" 
                  placeholder="Cari ID atau Nama..." 
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-accent text-textMain"
                />
              </div>
           </div>
           <div className="max-h-[600px] overflow-y-auto no-scrollbar relative">
               <table className="w-full text-left text-sm border-separate border-spacing-0">
                   <thead className="sticky top-0 z-10">
                       <tr className="bg-surface shadow-sm">
                           <th className="p-4 font-semibold text-textMuted border-b border-border">ID Transaksi</th>
                           <th className="p-4 font-semibold text-textMuted border-b border-border">Pelanggan</th>
                           <th className="p-4 font-semibold text-textMuted border-b border-border">Metode</th>
                           <th className="p-4 font-semibold text-textMuted border-b border-border text-right">Total</th>
                           <th className="p-4 font-semibold text-textMuted border-b border-border text-center">Aksi</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-border/50">
                       {filteredTransactions.length > 0 ? (
                         filteredTransactions.map(tx => (
                           <tr key={tx.id} className="hover:bg-accent/5 transition-colors">
                               <td className="p-4">
                                   <div className="flex flex-col">
                                       <span className="font-mono text-accent font-medium">{tx.id}</span>
                                       <span className="text-[10px] text-textMuted">{new Date(tx.date).toLocaleDateString('id-ID')}</span>
                                   </div>
                               </td>
                               <td className="p-4">
                                   <div className="flex flex-col">
                                       <span className="font-medium text-textMain">{tx.customerName}</span>
                                       <span className="text-[10px] text-textMuted">{tx.customerPhone || '-'}</span>
                                   </div>
                               </td>
                               <td className="p-4">
                                   {tx.paymentMethod === PaymentMethod.QRIS ? <QrBadge /> : <CashBadge />}
                               </td>
                               <td className="p-4 text-right font-bold text-textMain">
                                   Rp {tx.total.toLocaleString('id-ID')}
                               </td>
                               <td className="p-4">
                                   <div className="flex items-center justify-center gap-1">
                                       <button 
                                            onClick={() => handleOpenModal(tx)}
                                            title="Edit Transaksi"
                                            className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors border border-transparent hover:border-blue-500/20"
                                       >
                                           <Edit2 size={16} />
                                       </button>
                                       <button 
                                            onClick={() => onPrint(tx)}
                                            title="Cetak Ulang Struk"
                                            className="p-2 hover:bg-accent/10 text-accent rounded-lg transition-colors border border-transparent hover:border-accent/20"
                                       >
                                           <Printer size={16} />
                                       </button>
                                       <button 
                                            onClick={() => onDelete(tx.id)}
                                            title="Hapus / Void Transaksi"
                                            className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                       >
                                           <Trash2 size={16} />
                                       </button>
                                   </div>
                               </td>
                           </tr>
                         ))
                       ) : (
                         <tr>
                           <td colSpan={5} className="p-12 text-center text-textMuted">
                             Tidak ada data transaksi
                           </td>
                         </tr>
                       )}
                   </tbody>
               </table>
           </div>
        </div>
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-surface w-full max-w-md rounded-2xl border border-border theme-shadow overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
                    <h2 className="text-xl font-bold text-textMain">
                        {editingTx ? 'Edit Transaksi' : 'Transaksi Manual Baru'}
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-background rounded-full text-textMuted">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-textMuted uppercase mb-1">ID Transaksi</label>
                        <input 
                            disabled
                            value={formData.id}
                            className="w-full bg-background/50 border border-border rounded-xl p-3 text-textMuted font-mono text-sm cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-textMuted uppercase mb-1">Nama Pelanggan</label>
                        <input 
                            value={formData.customerName}
                            onChange={e => setFormData({...formData, customerName: e.target.value})}
                            className="w-full bg-background border border-border rounded-xl p-3 text-textMain focus:border-accent outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-textMuted uppercase mb-1">Total (Rp)</label>
                        <input 
                            type="number"
                            value={formData.total}
                            onChange={e => setFormData({...formData, total: Number(e.target.value)})}
                            className="w-full bg-background border border-border rounded-xl p-3 text-accent font-bold text-xl outline-none focus:border-accent"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-textMuted uppercase mb-1">Metode</label>
                            <select 
                                value={formData.paymentMethod}
                                onChange={e => setFormData({...formData, paymentMethod: e.target.value as PaymentMethod})}
                                className="w-full bg-background border border-border rounded-xl p-3 text-textMain outline-none appearance-none"
                            >
                                <option value={PaymentMethod.CASH}>Tunai</option>
                                <option value={PaymentMethod.QRIS}>QRIS</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-textMuted uppercase mb-1">WA Pelanggan</label>
                            <input 
                                value={formData.customerPhone}
                                onChange={e => setFormData({...formData, customerPhone: e.target.value})}
                                className="w-full bg-background border border-border rounded-xl p-3 text-textMain outline-none"
                                placeholder="08..."
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-background/50 border-t border-border">
                    <button 
                        onClick={handleSave}
                        className="w-full py-3 bg-accent hover:bg-accentHover text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
                    >
                        <Save size={18} />
                        Simpan Data
                    </button>
                </div>
              </div>
          </div>
      )}
    </div>
  );
};

const QrBadge = () => (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
        QRIS
    </span>
);

const CashBadge = () => (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">
        TUNAI
    </span>
);

const SummaryCard = ({ title, value, icon, subtext, color }: any) => (
    <div className="bg-surface p-5 rounded-2xl border border-border flex flex-col justify-between hover:border-accent/30 transition-all shadow-lg">
        <div className="p-2.5 bg-background w-fit rounded-xl text-accent border border-border mb-3">
            {icon}
        </div>
        <div>
            <p className="text-textMuted text-[10px] font-bold uppercase tracking-widest">{title}</p>
            <h3 className={`text-xl font-bold mt-1 ${color || 'text-textMain'}`}>{value}</h3>
            {subtext && <p className="text-[10px] text-textMuted mt-1 font-medium">{subtext}</p>}
        </div>
    </div>
);

export default ReportView;
