
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Smartphone, Banknote, User, Phone } from 'lucide-react';
import { PaymentMethod } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  method: PaymentMethod;
  onConfirm: (customerName: string, customerPhone: string, cashGiven: number) => void;
  qrisImage?: string; 
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, total, method, onConfirm, qrisImage }) => {
  const [cashGiven, setCashGiven] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setCashGiven('');
        setCustomerName('Umum'); 
        setCustomerPhone('');
        setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const numericCash = parseInt(cashGiven.replace(/\D/g, '') || '0', 10);
  const change = numericCash - total;
  const canConfirm = method === PaymentMethod.QRIS || (method === PaymentMethod.CASH && numericCash >= total);

  const handleConfirm = () => {
    if (!canConfirm) return;
    setIsProcessing(true);
    setTimeout(() => {
        setIsProcessing(false);
        onConfirm(customerName, customerPhone, numericCash);
    }, 1500);
  };

  const dummyQR = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAYMENT-${total}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-4xl rounded-2xl border border-border theme-shadow overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* LEFT SIDE: CUSTOMER INFO */}
        <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-border bg-background/30 flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-1 text-textMain">Data Pelanggan</h2>
                <p className="text-textMuted text-sm">Lengkapi data untuk struk pembelian.</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-textMuted mb-2">Nama Pelanggan</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                        <input 
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full bg-surface border border-border rounded-xl py-3 pl-10 pr-4 text-textMain focus:outline-none focus:border-accent transition-colors"
                            placeholder="Nama Pelanggan"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-textMuted mb-2">No. WhatsApp (Opsional)</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                        <input 
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="w-full bg-surface border border-border rounded-xl py-3 pl-10 pr-4 text-textMain focus:outline-none focus:border-accent transition-colors"
                            placeholder="08xxxxxxxx"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-auto p-5 bg-background border border-border rounded-2xl">
                <p className="text-textMuted text-xs font-semibold uppercase tracking-wider mb-1">Total Tagihan</p>
                <div className="text-3xl font-bold text-accent">
                    Rp {total.toLocaleString('id-ID')}
                </div>
            </div>
        </div>

        {/* RIGHT SIDE: PAYMENT EXECUTION */}
        <div className="flex-1 flex flex-col bg-surface">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
            <h2 className="text-lg font-bold flex items-center gap-2 text-textMain">
                Pembayaran: <span className="text-accent">{method}</span>
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-background rounded-full transition-colors text-textMuted">
                <X size={20} />
            </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
            {method === PaymentMethod.QRIS && (
                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <div className="bg-white p-4 rounded-2xl shadow-xl mb-4 border border-border">
                    <img 
                        src={qrisImage || dummyQR} 
                        alt="QR Code" 
                        className="w-48 h-48 object-contain"
                    />
                </div>
                <p className="text-sm text-center text-textMuted max-w-xs">
                    {qrisImage 
                    ? "Scan QRIS Toko di atas untuk melakukan pembayaran." 
                    : "Scan QR dummy ini (Mode Test). Upload QRIS asli di menu Profil."}
                </p>
                <div className="flex items-center gap-2 mt-6 text-accent animate-pulse">
                    <Smartphone size={18} />
                    <span className="text-sm font-bold tracking-wide">MENUNGGU PEMBAYARAN...</span>
                </div>
                </div>
            )}

            {method === PaymentMethod.CASH && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                <div>
                    <label className="block text-sm font-medium text-textMuted mb-2">Uang Diterima</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-textMuted font-bold">
                            Rp
                        </div>
                        <input 
                            type="text"
                            value={cashGiven}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setCashGiven(val ? parseInt(val).toLocaleString('id-ID') : '');
                            }}
                            className="w-full bg-background border border-border rounded-2xl py-5 pl-12 pr-6 text-2xl font-bold focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all text-textMain"
                            placeholder="0"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-background border border-border">
                    <div className="flex justify-between items-center">
                        <span className="text-textMuted font-medium">Kembalian</span>
                        <span className={`text-2xl font-bold ${change < 0 ? 'text-red-500' : 'text-green-500'}`}>
                            Rp {change > 0 ? change.toLocaleString('id-ID') : '0'}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {[50000, 100000, total].map((amount) => (
                        <button 
                            key={amount}
                            onClick={() => setCashGiven(amount.toLocaleString('id-ID'))}
                            className="py-3 text-xs font-bold bg-background border border-border hover:border-accent rounded-xl transition-all text-textMain"
                        >
                            {amount === total ? 'UANG PAS' : amount.toLocaleString('id-ID')}
                        </button>
                    ))}
                </div>
                </div>
            )}
            </div>

            <div className="p-4 border-t border-border bg-background/50">
            <button
                onClick={handleConfirm}
                disabled={!canConfirm || isProcessing}
                className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all
                    ${!canConfirm || isProcessing
                        ? 'bg-textMuted/20 text-textMuted cursor-not-allowed opacity-50' 
                        : 'bg-accent text-white hover:bg-accentHover shadow-lg hover:shadow-accent/20'
                    }`}
            >
                {isProcessing ? (
                    <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Memproses...
                    </span>
                ) : (
                    <>
                        <CheckCircle size={22} />
                        <span>Selesaikan Transaksi</span>
                    </>
                )}
            </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
