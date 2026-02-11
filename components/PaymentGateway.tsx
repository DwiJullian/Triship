
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ShieldCheck, Loader2, AlertCircle, 
  Globe
} from 'lucide-react';
import { PaymentMethod, ShippingDetails } from '../types';

declare global {
  interface Window {
    paypal: any;
  }
}

interface PaymentGatewayProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (method: PaymentMethod) => void;
  totalAmount: number;
  customerInfo: ShippingDetails;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ 
  isOpen, onClose, onSuccess, totalAmount, customerInfo 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paypalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsProcessing(false);

      const renderPaypalButtons = () => {
        if (!window.paypal) {
          setError("Gagal memuat sistem pembayaran. Mohon segarkan halaman.");
          return;
        }

        if (paypalContainerRef.current) paypalContainerRef.current.innerHTML = '';

        window.paypal.Buttons({
          style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'checkout' },
          createOrder: (data: any, actions: any) => {
            setError(null);
            return actions.order.create({
              purchase_units: [{
                description: `DropshipPro Order - ${customerInfo.email}`,
                amount: { currency_code: 'USD', value: totalAmount.toFixed(2) }
              }]
            });
          },
          onApprove: async (data: any, actions: any) => {
            setIsProcessing(true);
            try {
              const details = await actions.order.capture();
              if (details.status === 'COMPLETED') {
                // Langsung panggil onSuccess tanpa UI sukses internal
                onSuccess('paypal');
              } else {
                setError("Transaksi tidak selesai. Status: " + details.status);
                setIsProcessing(false);
              }
            } catch (err: any) {
              setError("Terjadi kesalahan saat memproses pembayaran. Saldo mungkin tidak cukup.");
              setIsProcessing(false);
            }
          },
          onCancel: () => {
            setError("Pembayaran telah dibatalkan oleh pengguna.");
            setIsProcessing(false);
          },
          onError: () => {
            setError("Koneksi gagal atau terjadi kesalahan pada sistem PayPal.");
            setIsProcessing(false);
          }
        }).render('#paypal-button-container').catch(() => {});
      };

      const timer = setTimeout(renderPaypalButtons, 600);
      return () => clearTimeout(timer);
    }
  }, [isOpen, totalAmount, customerInfo.email, onSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-slate-100 flex flex-col h-fit">
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500/20 p-2.5 rounded-2xl border border-amber-500/30">
              <ShieldCheck size={20} className="text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Checkout Portal</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">Verified Payment</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors" disabled={isProcessing}>
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {isProcessing ? (
            <div className="py-16 flex flex-col items-center text-center">
              <Loader2 size={64} className="text-amber-500 animate-spin mb-6" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Processing Transaction</h3>
              <p className="text-sm text-slate-500 italic">Securing your luxury assets...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grand Total</span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                    <Globe size={10} />
                    <span className="text-[9px] font-black uppercase tracking-widest">USD</span>
                  </div>
                </div>
                <div className="text-4xl font-black text-slate-900">${totalAmount.toLocaleString()}</div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3 text-xs font-bold border border-red-100 animate-in slide-in-from-top-2">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div id="paypal-button-container" ref={paypalContainerRef} className="z-10 relative" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;
