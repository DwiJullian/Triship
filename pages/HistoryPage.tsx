
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, XCircle, CheckCircle2, ChevronRight, Package, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { OrderStatus } from '../types';

interface HistoryPageProps {
  onOrderUpdated?: () => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ onOrderUpdated }) => {
  const [localOrders, setLocalOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    const savedIds = JSON.parse(localStorage.getItem('dropshippro_order_ids') || '[]');
    if (savedIds.length === 0) {
      setIsLoading(false);
      return;
    }

    const allOrders = await api.getOrders();
    const filtered = allOrders.filter(o => savedIds.includes(o.id));
    setLocalOrders(filtered);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCancelOrder = async (orderId: string, createdAt: string) => {
    const diff = (new Date().getTime() - new Date(createdAt).getTime()) / 1000 / 60;
    
    if (diff > 5) {
      alert("Maaf, pesanan sudah lebih dari 5 menit dan sedang diproses. Pembatalan tidak dapat dilakukan.");
      return;
    }

    if (window.confirm("Apakah Anda yakin ingin membatalkan pesanan ini? Dana akan dikembalikan otomatis.")) {
      try {
        await api.updateOrderStatus(orderId, 'cancelled');
        // Refresh data from server to ensure consistency
        await fetchHistory();
        // Trigger parent component to refresh product data
        if (onOrderUpdated) onOrderUpdated();
        alert("Pesanan berhasil dibatalkan.");
      } catch (err) {
        console.error("Cancel order error:", err);
        alert("Gagal membatalkan pesanan.");
      }
    }
  };

  const getStatusStyle = (status: OrderStatus) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading your orders...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold heading-font text-slate-900 mb-2">Order History</h1>
        <p className="text-slate-500 mb-12">Track and manage your fashion orders in one place.</p>

        <div className="space-y-6">
          {localOrders.map((order) => {
            const diff = (new Date().getTime() - new Date(order.created_at).getTime()) / 1000 / 60;
            const canCancel = diff <= 5 && order.status === 'paid';

            return (
              <div key={order.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row justify-between gap-6 mb-8 pb-6 border-b border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-900 p-3 rounded-2xl text-white">
                      <Package size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Number</p>
                      <p className="text-sm font-mono font-bold text-slate-900">{order.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusStyle(order.status as OrderStatus)}`}>
                      {order.status}
                    </span>
                    <p className="text-lg font-black text-slate-900">${(order.total_price || 0).toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {order.items?.products?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-600">{item.name} <span className="text-slate-400 font-bold ml-1">x{item.quantity}</span></span>
                      <span className="font-bold text-slate-900">${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex justify-between text-slate-500"><span>Payment Processing Fee</span><span className="font-bold text-slate-900">${(order.payment_fee || 0).toFixed(2)}</span></div>
                  {order.return_fee ? (
                    <div className="flex justify-between text-slate-500"><span>Return Protection</span><span className="font-bold text-slate-900">${(order.return_fee || 0).toFixed(2)}</span></div>
                  ) : null}
                  {order.shipping_cost ? (
                    <div className="flex justify-between text-slate-500"><span>Shipping Fee</span><span className="font-bold text-slate-900">${(order.shipping_cost || 0).toFixed(2)}</span></div>
                  ) : null}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <Clock size={14} /> Ordered on {new Date(order.created_at).toLocaleString('id-ID')}
                  </p>
                  
                  {canCancel ? (
                    <button 
                      onClick={() => handleCancelOrder(order.id, order.created_at)}
                      className="w-full sm:w-auto bg-red-50 text-red-600 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle size={16} /> Cancel Order ({Math.max(0, (5 - diff)).toFixed(1)}m left)
                    </button>
                  ) : order.status === 'paid' ? (
                    <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                      <AlertTriangle size={12} /> Your order is being processed
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}

          {localOrders.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
              <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 mb-6 italic">You don’t have any orders yet. Discover your favorite outfit today!</p>
              <Link to="/products" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold">Explore the Collection</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
