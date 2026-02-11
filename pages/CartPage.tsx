
import React, { useState, useMemo } from 'react';
import { 
  Trash2, Plus, Minus, ShoppingBag, ArrowLeft, 
  CheckCircle2, Lock, Phone, Mail, User, MapPin,
  Clock, AlertTriangle, ShieldCheck, Download, Share2, Copy, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { CartItem, ShippingDetails, PaymentMethod } from '../types';
import { api } from '../services/api';
import PaymentGateway from '../components/PaymentGateway';

interface CartPageProps {
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  setCart: (cart: CartItem[]) => void;
  onOrderSuccess?: () => void;
}

const CartPage: React.FC<CartPageProps> = ({ cart, onUpdateQuantity, onRemove, setCart, onOrderSuccess }) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [placedOrderAmount, setPlacedOrderAmount] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [wantsReturn, setWantsReturn] = useState(false);

  const [customerInfo, setCustomerInfo] = useState<ShippingDetails>({
    name: '',
    email: '',
    address: '',
    phone: ''
  });
  
  const { subtotal, paymentFee, returnFee, total } = useMemo(() => {
    const sub = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const payFee = +(sub * 0.02);
    const retFee = +(wantsReturn ? sub * 0.03 : 0);
    const tot = sub + payFee + retFee;
    return { subtotal: sub, paymentFee: payFee, returnFee: retFee, total: tot };
  }, [cart, wantsReturn]);

  const isFormComplete = useMemo(() => {
    return customerInfo.name.trim().length > 2 && 
           customerInfo.email.includes('@') && 
           customerInfo.phone.trim().length > 8 && 
           customerInfo.address.trim().length > 10;
  }, [customerInfo]);

  const handleOpenPayment = () => {
    if (!isFormComplete) {
      setValidationError("Please complete all required personal and shipping information.");
      return;
    }
    setValidationError(null);
    setIsPaymentModalOpen(true);
  };

  const handleCopyId = () => {
    if (placedOrderId) {
      navigator.clipboard.writeText(placedOrderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePaymentSuccess = async (method: PaymentMethod) => {
    try {
      // Prepare order payload: use `shipping_cost` field to store payment+return fees for backward compatibility
      const fees = +(paymentFee + returnFee);
      const result = await api.createOrder({
        items: cart,
        // keep shipping_cost for compatibility but set to 0
        shipping_cost: 0,
        payment_fee: paymentFee,
        return_fee: returnFee,
        wants_return: wantsReturn,
        total_price: total,
        customer_info: customerInfo,
        payment_method: method
      });

      if (result.success) {
        const currentHistory = JSON.parse(localStorage.getItem('dropshippro_order_ids') || '[]');
        localStorage.setItem('dropshippro_order_ids', JSON.stringify([...currentHistory, result.orderId]));
        
        setPlacedOrderId(result.orderId);
        setPlacedOrderAmount(total); // persist paid amount before clearing cart
        setCart([]);
        setIsOrderPlaced(true);
        setIsPaymentModalOpen(false);
        if (onOrderSuccess) onOrderSuccess();
      }
    } catch (error) {
      console.error("Order process failed:", error);
      alert("A system error occurred while processing your order.");
    }
  };

  if (isOrderPlaced) {
    return (
      <div className="min-h-[90vh] bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Compact Background Decoration */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-amber-600 rounded-full blur-[100px]" />
           <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-600 rounded-full blur-[100px]" />
        </div>

        <div className="relative w-full max-w-md animate-in zoom-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 shadow-2xl text-center">
            <div className="bg-emerald-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border-2 border-white/10">
              <CheckCircle2 size={32} />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black heading-font text-white mb-2 tracking-tight">Transaction Secured!</h2>
            <p className="text-slate-400 mb-6 text-sm">Your premium order is currently being processed.</p>
            
            {/* Compact Informative Summary */}
            <div className="bg-white/10 rounded-3xl p-6 border border-white/5 text-left mb-8 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Order Number</span>
                <button 
                  onClick={handleCopyId}
                  className="flex items-center gap-2 text-[11px] font-mono font-bold text-amber-500 hover:text-amber-400 transition-colors bg-amber-500/10 px-2 py-1 rounded-lg"
                >
                  {placedOrderId}
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Recipient</span>
                <span className="text-xs font-bold text-white truncate max-w-[150px]">{customerInfo.name}</span>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <span className="text-xs text-slate-400">Paid Amount</span>
                <span className="text-xl font-black text-emerald-400">${(placedOrderAmount ?? total).toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Link to="/history" className="bg-amber-500 text-slate-950 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-400 transition-all flex items-center justify-center gap-2">
                <Clock size={14} /> History
              </Link>
              <Link to="/" className="bg-white/10 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10">
                Continue
              </Link>
            </div>

            <div className="mt-8 flex justify-center gap-6 opacity-40">
               <div className="flex items-center gap-1.5 text-[8px] font-black text-white uppercase tracking-widest">
                  <ShieldCheck size={10} className="text-emerald-500" /> PCI-DSS Certified
               </div>
               <div className="flex items-center gap-1.5 text-[8px] font-black text-white uppercase tracking-widest">
                  <Lock size={10} className="text-amber-500" /> SSL Encrypted
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <ShoppingBag size={64} className="text-slate-200 mb-6" />
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Cart Is Empty</h2>
      <p className="text-slate-400 mb-8">You haven’t added any premium items to your collection yet.</p>
      <Link to="/products" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold">Start Shopping</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
           {isCheckingOut && (
             <button onClick={() => setIsCheckingOut(false)} className="p-3 bg-white rounded-full shadow-sm text-slate-400 hover:text-slate-900 transition-colors">
               <ArrowLeft size={20} />
             </button>
           )}
           <h1 className="text-4xl font-black heading-font text-slate-900">{isCheckingOut ? 'Identity & Shipping' : 'Your Luxury Cart'}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            {!isCheckingOut ? (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="bg-white p-6 rounded-[2rem] flex flex-col sm:flex-row gap-6 shadow-sm border border-slate-100 items-center transition-all hover:shadow-md">
                    <img src={item.image} className="w-24 h-24 rounded-2xl object-cover" alt={item.name} />
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-bold text-lg text-slate-900">{item.name}</h3>
                      <p className="text-amber-600 font-black text-xl">${item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center bg-slate-50 rounded-2xl p-1.5 border border-slate-100">
                      <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-2 text-slate-400 hover:text-slate-900"><Minus size={16}/></button>
                      <span className="w-10 text-center font-bold text-slate-900">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-2 text-slate-400 hover:text-slate-900"><Plus size={16}/></button>
                    </div>
                    <button onClick={() => onRemove(item.id)} className="text-red-300 hover:text-red-500 p-3 transition-colors"><Trash2 size={22}/></button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 sm:p-12 rounded-[3.5rem] shadow-sm space-y-8 border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input type="text" placeholder="Johnathan Doe" className="w-full bg-slate-50 border-transparent rounded-2xl px-12 py-4 outline-none focus:ring-2 focus:ring-amber-500 transition-all" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Contact</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input type="email" placeholder="john@luxury.com" className="w-full bg-slate-50 border-transparent rounded-2xl px-12 py-4 outline-none focus:ring-2 focus:ring-amber-500 transition-all" value={customerInfo.email} onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="tel" placeholder="+62 812 3456 7890" className="w-full bg-slate-50 border-transparent rounded-2xl px-12 py-4 outline-none focus:ring-2 focus:ring-amber-500 transition-all" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Shipping Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-5 text-slate-300" size={18} />
                    <textarea placeholder="Street Name, Building, City, ZIP Code" rows={4} className="w-full bg-slate-50 border-transparent rounded-2xl px-12 py-4 outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} />
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <input id="return-protect" type="checkbox" checked={wantsReturn} onChange={e => setWantsReturn(e.target.checked)} className="w-4 h-4 rounded-md text-amber-600" />
                  <label htmlFor="return-protect" className="text-sm font-bold text-slate-600">Add Return Protection (3% of subtotal value)</label>
                </div>

                {validationError && (
                  <div className="flex items-center gap-3 bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 animate-in slide-in-from-top-2">
                    <AlertTriangle size={18} />
                    <span>{validationError}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl h-fit border border-slate-100 sticky top-24">
            <h2 className="text-xl font-black text-slate-900 mb-8 pb-4 border-b border-slate-50">Order Summary</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-slate-500"><span>Subtotal</span><span className="font-bold text-slate-900">${subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-slate-500"><span>Payment Fees (2%)</span><span className="font-bold text-slate-900">${paymentFee.toFixed(2)}</span></div>
              {paymentFee > 0 && (
                <div className="flex justify-between text-slate-500"><span>Return Protection (3%)</span><span className="font-bold text-slate-900">${returnFee.toFixed(2)}</span></div>
              )}
              <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                <div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Payable</span>
                   <span className="text-3xl font-black text-amber-600">${total.toLocaleString()}</span>
                </div>
                <div className="bg-green-50 text-green-600 px-3 py-1 rounded-lg text-[9px] font-bold uppercase mb-1">Secure</div>
              </div>
            </div>

            {!isCheckingOut ? (
              <button onClick={() => setIsCheckingOut(true)} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-slate-200">
                Proceed to Checkout
              </button>
            ) : (
              <button 
                onClick={handleOpenPayment} 
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl ${
                  isFormComplete 
                    ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-200' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed grayscale'
                }`}
              >
                <Lock size={18} /> {isFormComplete ? 'Confirm Payment' : 'Identity Incomplete'}
              </button>
            )}
            
            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               <ShieldCheck size={14} className="text-slate-300" />
               PCI-DSS Compliant Gateway
            </div>
          </div>
        </div>
      </div>
      <PaymentGateway isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} onSuccess={handlePaymentSuccess} totalAmount={total} customerInfo={customerInfo} />
    </div>
  );
};

export default CartPage;
