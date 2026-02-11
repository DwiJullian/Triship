
import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Package, LayoutDashboard, LogOut, 
  ShieldCheck, MessageSquare, Send, ShoppingBag, 
  User, MapPin, Calendar, Home, Star, Mail, UserPlus, Zap,
  ArrowLeft, RefreshCcw, CheckCircle2, XCircle, Clock, ExternalLink,
  Image as ImageIcon, DollarSign, Tag, X, Copy, Check, AlertTriangle, ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Product, OrderStatus } from '../types';

const AdminPage: React.FC<{onProductChange?: () => void}> = ({ onProductChange }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'newsletter' | 'users'>('inventory');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', image: '', category: 'Shirt', discount: '' });
  const [addProductError, setAddProductError] = useState<string | null>(null);
  const [addProductSuccess, setAddProductSuccess] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState('');
  const [invitedCredentials, setInvitedCredentials] = useState<{user: string, pass: string} | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isInviteSending, setIsInviteSending] = useState(false);
  const [supplierOrderIds, setSupplierOrderIds] = useState<{[key: string]: string}>({});
  const [savingSupplierIds, setSavingSupplierIds] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const user = await api.getCurrentUser();
    if (user) {
      setIsAuthenticated(true);
      loadData();
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const p = await api.getProducts();
      setProducts(p);
      const o = await api.getOrders();
      setOrders(o);
    } catch (err) {
      console.error('Failed to load data:', err);
      setLoadError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.signOut();
      setIsAuthenticated(false);
      setActiveTab('inventory');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      alert('Logout failed. Please try again.');
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      // Refresh products to update sales_count if order was cancelled
      if (newStatus === 'cancelled') {
        const updatedProducts = await api.getProducts();
        setProducts(updatedProducts);
      }
    } catch (err) {
      console.error("Status change error:", err);
      alert("Gagal update status.");
    }
  };

  const handleSaveSupplierOrderId = async (orderId: string) => {
    const supplierOrderId = supplierOrderIds[orderId];
    if (!supplierOrderId || !supplierOrderId.trim()) {
      alert('Please enter the Supplier Order ID first.');
      return;
    }
    
    setSavingSupplierIds(prev => ({ ...prev, [orderId]: true }));
    try {
      await api.updateSupplierOrderId(orderId, supplierOrderId.trim());
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, supplier_order_id: supplierOrderId.trim() } : o));
      alert('Supplier Order ID has been saved successfully.');
    } catch (err) {
      console.error("Save supplier order ID error:", err);
      alert("Failed to save Supplier Order ID.");
    } finally {
      setSavingSupplierIds(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddProductError(null);
    setAddProductSuccess(null);
    
    // Validasi input
    if (!newProduct.name.trim()) {
      setAddProductError('Product name cannot be empty.');
      return;
    }
    if (!newProduct.price || normalizePrice(newProduct.price) <= 0) {
      setAddProductError('Price must be greater than 0.');
      return;
    }
    if (!newProduct.image.trim()) {
      setAddProductError('Image URL cannot be empty.');
      return;
    }
    if (!newProduct.description.trim()) {
      setAddProductError('Product description cannot be empty.');
      return;
    }

    setIsSubmittingProduct(true);
    try {
      const productData = {
        ...newProduct,
        price: normalizePrice(newProduct.price),
        discount: newProduct.discount ? Math.max(0, Math.min(100, parseFloat(newProduct.discount))) : 0
      };
      await api.addProduct(productData);
      setAddProductSuccess(`Produk "${newProduct.name}" successfully added!`);
      // Reset form dengan delay agar success message terlihat
      setTimeout(() => {
        setIsAddProductModalOpen(false);
        setAddProductSuccess(null);
        setNewProduct({ name: '', price: '', description: '', image: '', category: 'Furniture', discount: '' });
        loadData();
        if (onProductChange) onProductChange();
      }, 1500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add product.';
      setAddProductError(errorMsg);
      console.error('Add product error:', err);
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // Normalize harga input (handle both . dan , sebagai decimal separator)
  const normalizePrice = (price: string): number => {
    if (!price) return 0;
    const normalized = price.toString().trim().replace(/,/g, '.');
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSubmittingProduct(true);
    try {
      const updatedProduct = {
        ...editingProduct,
        price: typeof editingProduct.price === 'string' 
          ? normalizePrice(editingProduct.price)
          : editingProduct.price
      };
      await api.updateProduct(editingProduct.id, updatedProduct);
      setIsEditProductModalOpen(false);
      setEditingProduct(null);
      await loadData();
      if (onProductChange) onProductChange();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'paid': return { color: 'text-emerald-600 bg-emerald-50', icon: <CheckCircle2 size={14}/>, label: 'Paid' };
      case 'processing': return { color: 'text-amber-600 bg-amber-50', icon: <RefreshCcw size={14} className="animate-spin-slow"/>, label: 'Processing' };
      case 'shipped': return { color: 'text-blue-600 bg-blue-50', icon: <Zap size={14}/>, label: 'Shipped' };
      case 'delivered': return { color: 'text-slate-600 bg-slate-100', icon: <Home size={14}/>, label: 'Delivered' };
      case 'cancelled': return { color: 'text-red-600 bg-red-50', icon: <XCircle size={14}/>, label: 'Cancelled' };
      default: return { color: 'text-gray-400 bg-gray-50', icon: <Clock size={14}/>, label: 'Pending' };
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <form onSubmit={async (e) => { 
          e.preventDefault(); 
          setLoginError(null);
          try { 
            await api.signIn(email, password); 
            setIsAuthenticated(true); 
            loadData(); 
          } catch(err: any) { 
            console.error('Sign-in failed:', err);
            setLoginError(err?.message || 'Login failed: Invalid credentials.');
          } 
        }} className="relative bg-slate-900 p-12 rounded-[3.5rem] border border-slate-800 w-full max-w-lg shadow-2xl">
          <div className="bg-amber-500/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-amber-500/20">
            <ShieldCheck size={40} className="text-amber-500" />
          </div>
          <h1 className="text-3xl font-black text-white text-center mb-2 heading-font">Admin Portal</h1>
          <p className="text-slate-500 text-center mb-10 text-sm">Restricted access for Triship management</p>
              <div className="space-y-4">
                <input
                  type="email"
                  required
                  placeholder="admin@youremail.com"
                  className="w-full bg-slate-50 border-transparent rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  className="w-full bg-slate-50 border-transparent rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-amber-500 text-white py-3 rounded-2xl font-bold hover:opacity-90 transition-all">Sign In</button>
                </div>
                  </div>
                </form>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-80 bg-slate-900 text-white p-8 flex flex-col lg:fixed lg:h-screen z-[100]">
        <div className="mb-12">
          <Link to="/" className="text-2xl font-bold heading-font tracking-tighter">
            ADMIN<span className="text-amber-500">PRO</span>
          </Link>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Management Suite v2.0</p>
        </div>

        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === 'inventory' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>
            <Package size={20}/> <span className="font-bold">Inventory</span>
          </button>
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === 'orders' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>
            <ShoppingBag size={20}/> <span className="font-bold">Order Logs</span>
          </button>
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === 'users' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>
            <UserPlus size={20}/> <span className="font-bold">Staff Invite</span>
          </button>
        </nav>

        <div className="pt-8 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all text-xs font-bold uppercase tracking-widest">
            <LogOut size={16}/> Logout Session
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 lg:ml-80">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div>
            <h2 className="text-3xl font-black text-slate-900 capitalize tracking-tight">{activeTab} Dashboard</h2>
            <p className="text-slate-500 text-sm">Monitor your Triship business performance in real time.</p>
          </div>
          <div className="flex gap-4">
             <button onClick={loadData} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-colors">
               <RefreshCcw size={20} className={isLoading ? 'animate-spin' : ''} />
             </button>
             {activeTab === 'inventory' && (
               <button onClick={() => setIsAddProductModalOpen(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-amber-500 transition-all shadow-xl">
                 <Plus size={18} /> Add Product
               </button>
             )}
          </div>
        </header>

        {/* Error Alert */}
        {loadError && (
          <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-[2rem] flex items-start gap-4">
            <AlertTriangle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-red-800">Error Loading Data</h3>
              <p className="text-sm text-red-700 mt-1">{loadError}</p>
              <p className="text-xs text-red-600 mt-2">Ensure the Supabase database is properly connected or use mock data from localStorage.</p>
            </div>
            <button onClick={() => setLoadError(null)} className="text-red-600 hover:text-red-800">
              <X size={20} />
            </button>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {orders.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed space-y-4">
                <ShoppingBag size={48} className="mx-auto text-slate-200" />
                <div>
                  <p className="text-slate-400 font-bold text-lg">No orders yet</p>
                  <p className="text-slate-400 text-sm mt-1">Customer orders will appear here after checkout is completed.</p>
                  <button 
                    onClick={loadData}
                    className="mt-4 text-amber-600 hover:text-amber-700 font-bold text-sm flex items-center gap-2 mx-auto"
                  >
                    <RefreshCcw size={14} /> Refresh Data
                  </button>
                </div>
              </div>
            ) : (
              orders.map(o => {
                const status = getStatusInfo(o.status);
                return (
                  <div key={o.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-50">
                      <div className="flex items-center gap-5">
                         <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-lg">
                           <Package size={24} />
                         </div>
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{o.id}</span>
                               <span className="w-1 h-1 bg-slate-300 rounded-full" />
                               <span className="text-[10px] font-bold text-slate-500 uppercase">{new Date(o.created_at).toLocaleDateString('id-ID')}</span>
                            </div>
                            <h4 className="font-bold text-slate-900 text-lg">{o.items?.customer?.name || 'Guest Customer'}</h4>
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                           {status.icon} {status.label}
                        </div>
                        <select 
                          value={o.status} 
                          onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                          className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer"
                        >
                          <option value="paid">Paid</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
                      {/* Left: Pengiriman */}
                      <div className="lg:col-span-3 space-y-4">
                         <h5 className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                           <MapPin size={12}/> Shipping Information
                         </h5>
                         <div className="text-sm">
                            <p className="font-bold text-slate-700">{o.items?.customer?.email}</p>
                            <p className="text-slate-500 mt-1 leading-relaxed">{o.items?.customer?.address}</p>
                            <p className="text-amber-600 font-bold mt-2 text-xs">{o.items?.customer?.phone}</p>
                         </div>
                      </div>

                      {/* Middle: Item Pesanan */}
                      <div className="lg:col-span-6 space-y-4">
                         <h5 className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                           <ShoppingBag size={12}/> Order Items
                         </h5>
                         <div className="space-y-4">
                            {o.items?.products?.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                                 <img src={item.image} className="w-12 h-12 rounded-xl object-cover" alt="" />
                                 <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                                    <p className="text-[10px] text-slate-500">Qty: {item.quantity} × ${(item.price || 0).toLocaleString()}</p>
                                 </div>
                                 <p className="font-black text-slate-900 text-sm">${((item.price || 0) * (item.quantity || 0)).toLocaleString()}</p>
                              </div>
                            ))}
                         </div>
                      </div>

                      {/* Right: Supplier ID & Finance Info */}
                      <div className="lg:col-span-3 space-y-8 flex flex-col justify-between">
                        <div className="space-y-4">
                           <h5 className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                             <Tag size={12}/> Supplier Order ID
                           </h5>
                           <div className="space-y-2">
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  placeholder="ID Supplier..."
                                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                  value={supplierOrderIds[o.id] || o.supplier_order_id || ''}
                                  onChange={(e) => setSupplierOrderIds(prev => ({ ...prev, [o.id]: e.target.value }))}
                                />
                                <button
                                  onClick={() => handleSaveSupplierOrderId(o.id)}
                                  disabled={savingSupplierIds[o.id]}
                                  className="bg-amber-500 text-white px-3 py-2 rounded-lg font-bold text-xs hover:bg-amber-600 transition-all disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
                                >
                                  {savingSupplierIds[o.id] ? (
                                    <>
                                      <RefreshCcw size={12} className="animate-spin" />
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 size={12} /> Save
                                    </>
                                  )}
                                </button>
                              </div>
                              {o.supplier_order_id && (
                                <div className="flex items-center justify-between gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
                                  <p className="text-xs font-mono font-bold text-emerald-900 truncate">{o.supplier_order_id}</p>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(o.supplier_order_id);
                                      alert('ID copied successfully.');
                                    }}
                                    className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 p-1 rounded-md transition-all flex-shrink-0"
                                  >
                                    <Copy size={12} />
                                  </button>
                                </div>
                              )}
                           </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50 space-y-4 text-right mt-auto">
                           <div>
                              <span className="bg-emerald-50 px-3 py-1.5 rounded-lg text-[9px] font-black text-emerald-600 uppercase">
                                Paid Via {o.items?.paymentMethod || 'Paypal'}
                              </span>
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Transaction</p>
                              <p className="text-3xl font-black text-slate-900">${(o.total_price || 0).toLocaleString()}</p>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
            {products.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex flex-col gap-4 group hover:shadow-xl transition-all">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-3xl overflow-hidden bg-slate-50 shrink-0">
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={p.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 truncate">{p.name}</h4>
                    <p className="text-amber-600 font-black mb-1">${(p.price || 0).toLocaleString()}</p>
                    {(p.discount || 0) > 0 && (
                      <p className="text-emerald-600 font-bold text-sm mb-1">-{p.discount}% Discount</p>
                    )}
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{p.category}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button 
                    onClick={() => {
                      setEditingProduct(p);
                      setIsEditProductModalOpen(true);
                    }} 
                    className="flex-1 p-3 text-amber-600 hover:bg-amber-50 rounded-xl transition-all font-bold text-sm flex items-center justify-center gap-2"
                  >
                    Edit
                  </button>
                  <button onClick={() => api.deleteProduct(p.id).then(loadData)} className="p-3 text-red-300 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all">
                    <Trash2 size={18}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="max-w-2xl mx-auto py-12">
            <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100 text-center space-y-8">
              <div className="bg-indigo-100 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto text-indigo-600 border border-indigo-200">
                 <UserPlus size={40} />
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-900 mb-2">Staff Invitation</h3>
                <p className="text-slate-500 leading-relaxed">Grant store management access to your trusted team members.</p>
              </div>
              <div className="space-y-4">
                <input type="email" placeholder="New Staff Email" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-8 py-5 text-center outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                <button 
                  onClick={async () => {
                    setInviteError(null);
                    if (!inviteEmail) {
                      setInviteError('Please enter a staff email address.');
                      return;
                    }
                    const username = inviteEmail.split('@')[0];
                    const password = Math.random().toString(36).slice(-8).toUpperCase();
                    
                    setIsInviteSending(true);
                    try {
                      await api.sendStaffInvitation(inviteEmail, username, password);
                      setInvitedCredentials({ user: username, pass: password });
                      setInviteEmail('');
                    } catch (err) {
                      setInviteError(err instanceof Error ? err.message : 'Failed to send invitation.');
                    } finally {
                      setIsInviteSending(false);
                    }
                  }}
                  disabled={isInviteSending}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isInviteSending ? (
                    <>
                      <RefreshCcw className="animate-spin" size={18} /> Sending...
                    </>
                  ) : (
                    'Generate Access Key'
                  )}
                </button>
              </div>

              {inviteError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 animate-in shake">
                  <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-red-800">{inviteError}</p>
                  </div>
                  <button type="button" onClick={() => setInviteError(null)} className="text-red-600 hover:text-red-800">
                    <X size={16} />
                  </button>
                </div>
              )}

              {invitedCredentials && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-[2.5rem] p-8 text-left animate-in zoom-in space-y-6">
                   <div className="flex items-center gap-2 text-indigo-600">
                     <CheckCircle2 size={20}/> 
                     <p className="text-sm font-black uppercase tracking-widest">Staff Account Created</p>
                   </div>
                   <div className="bg-amber-100 border border-amber-300 rounded-xl p-4 text-sm font-medium text-amber-800">
                     📧 Please manually send these credentials to the staff member or share via secure channel
                   </div>
                   <div className="text-sm text-slate-600">
                     <p>New staff account credentials:</p>
                   </div>
                   <div className="space-y-5">
                      <div>
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Login Username</label>
                         <p className="font-bold text-slate-900">{invitedCredentials.user}</p>
                      </div>
                      <div>
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Secret Key</label>
                         <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-indigo-100 mt-1">
                            <p className="font-mono text-xl font-black text-indigo-700">{invitedCredentials.pass}</p>
                            <button onClick={() => {
                              navigator.clipboard.writeText(`DropshipPro Staf Access\nUsername: ${invitedCredentials.user}\nPassword: ${invitedCredentials.pass}`);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }} className="text-indigo-600 hover:text-indigo-800">
                              {copied ? <Check size={16}/> : <Copy size={16}/>}
                            </button>
                         </div>
                      </div>
                   </div>
                   <button
                     onClick={() => setInvitedCredentials(null)}
                     className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                   >
                     Invite Another Staff Member
                   </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Add Product */}
        {isAddProductModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !isSubmittingProduct && setIsAddProductModalOpen(false)} />
            <form onSubmit={handleAddProduct} className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
               <div className="bg-gradient-to-r from-slate-900 to-amber-900 p-8 text-white flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                      <Plus size={24} className="text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black heading-font">Add New Listing</h3>
                      <p className="text-[10px] text-amber-200 uppercase tracking-widest mt-0.5">Add a new product to your store</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setIsAddProductModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={20}/></button>
               </div>
               
               {/* Success Message */}
               {addProductSuccess && (
                 <div className="bg-emerald-50 border-b-2 border-emerald-300 px-8 py-4 flex items-center gap-3 animate-in slide-in-from-top">
                   <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" />
                   <p className="text-sm font-bold text-emerald-900">{addProductSuccess}</p>
                 </div>
               )}
               
               {/* Error Message */}
               {addProductError && (
                 <div className="bg-red-50 border-b-2 border-red-300 px-8 py-4 flex items-center justify-between animate-in slide-in-from-top">
                   <div className="flex items-center gap-3">
                     <AlertTriangle size={20} className="text-red-600 flex-shrink-0" />
                     <p className="text-sm font-bold text-red-900">{addProductError}</p>
                   </div>
                   <button type="button" onClick={() => setAddProductError(null)} className="text-red-600 hover:text-red-800">
                     <X size={16}/>
                   </button>
                 </div>
               )}
               
               <div className="p-10 space-y-6 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                       Nama Produk
                     </label>
                     <input type="text" placeholder="Contoh: Luxury Velvet Sofa" className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-amber-500 focus:ring-0 transition-all" value={newProduct.name} onChange={e => { setNewProduct({...newProduct, name: e.target.value}); setAddProductError(null); }} />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                         <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                         Harga (USD)
                       </label>
                       <div className="relative">
                         <span className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400 font-bold">$</span>
                         <input type="text" placeholder="1200.50 atau 1200,50" className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 pl-10 outline-none focus:border-amber-500 focus:ring-0 transition-all" value={newProduct.price} onChange={e => { setNewProduct({...newProduct, price: e.target.value}); setAddProductError(null); }} />
                       </div>
                       <p className="text-[9px] text-slate-400">Use . or , for decimal values (e.g. 0.99 or 0,99)</p>
                    </div>
                    
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                         <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                         Category (Custom)
                        </label>
                        <input type="text" placeholder="e.g. Shirt, T-Shirt, Pants, Accessories, or any custom category" className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-amber-500 focus:ring-0 transition-all font-medium" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                         <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                         Discount (%)
                        </label>
                        <input type="number" min="0" max="100" placeholder="0" className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-emerald-500 focus:ring-0 transition-all" value={newProduct.discount} onChange={e => setNewProduct({...newProduct, discount: e.target.value})} />
                      </div>
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                       Image URL
                     </label>
                     <div className="relative">
                       <ImageIcon size={18} className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400" />
                       <input type="url" placeholder="https://images.unsplash.com/..." className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 pl-14 outline-none focus:border-amber-500 focus:ring-0 transition-all" value={newProduct.image} onChange={e => { setNewProduct({...newProduct, image: e.target.value}); setAddProductError(null); }} />
                     </div>
                     <p className="text-[9px] text-slate-400">Paste URL gambar dari Unsplash, Pexels, atau sumber lainnya</p>
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                       Product Description
                     </label>
                     <textarea rows={4} placeholder="Describe the features, quality, and advantages of this product..." className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-amber-500 focus:ring-0 transition-all resize-none" value={newProduct.description} onChange={e => { setNewProduct({...newProduct, description: e.target.value}); setAddProductError(null); }} />
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={isSubmittingProduct} className="flex-1 bg-gradient-to-r from-slate-900 to-amber-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:shadow-lg hover:shadow-amber-900/30 disabled:opacity-50 transition-all flex items-center justify-center gap-3">
                      {isSubmittingProduct ? (
                        <>
                          <RefreshCcw className="animate-spin" size={20}/>
                          <span>Publishing...</span>
                        </>
                      ) : (
                        <>
                          <Plus size={20}/>
                          <span>Publish to Store</span>
                        </>
                      )}
                    </button>
                    <button type="button" onClick={() => setIsAddProductModalOpen(false)} disabled={isSubmittingProduct} className="px-6 bg-slate-100 text-slate-700 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50">
                      Cancel
                    </button>
                  </div>
               </div>
            </form>
          </div>
        )}

        {/* Modal Edit Product */}
        {isEditProductModalOpen && editingProduct && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !isSubmittingProduct && setIsEditProductModalOpen(false)} />
            <form onSubmit={handleEditProduct} className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
               <div className="bg-gradient-to-r from-slate-900 to-blue-900 p-8 text-white flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                      <Tag size={24} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black heading-font">Edit Product</h3>
                      <p className="text-[10px] text-blue-200 uppercase tracking-widest mt-0.5">Update product information and discount</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => { setIsEditProductModalOpen(false); setEditingProduct(null); }} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={20}/></button>
               </div>
               
               <div className="p-10 space-y-6 max-h-[75vh] overflow-y-auto">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                       Product Name
                     </label>
                     <input type="text" placeholder="Contoh: Luxury Velvet Sofa" className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-blue-500 focus:ring-0 transition-all" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                         <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                         Price (USD)
                       </label>
                       <div className="relative">
                         <DollarSign size={18} className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400" />
                         <input type="text" placeholder="1200.50" className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 pl-12 outline-none focus:border-blue-500 focus:ring-0 transition-all" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: e.target.value as any})} />
                       </div>
                       <p className="text-[9px] text-slate-400">. or ,</p>
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                         <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                         Discount (%)
                       </label>
                       <input type="number" min="0" max="100" placeholder="0" className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-emerald-500 focus:ring-0 transition-all" value={editingProduct.discount || 0} onChange={e => setEditingProduct({...editingProduct, discount: parseFloat(e.target.value) || 0})} />
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                         <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                         Category (Custom)
                       </label>
                       <input type="text" placeholder="e.g. Shirt, T-Shirt, Pants, Accessories, or any custom category" className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-blue-500 focus:ring-0 transition-all font-medium" value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                       Image URL
                     </label>
                     <div className="relative">
                       <ImageIcon size={18} className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400" />
                       <input type="url" placeholder="https://images.unsplash.com/..." className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 pl-14 outline-none focus:border-blue-500 focus:ring-0 transition-all" value={editingProduct.image} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} />
                     </div>
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                       Product Description
                     </label>
                     <textarea rows={4} placeholder="Ceritakan fitur, kualitas, dan keunggulan produk ini..." className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-blue-500 focus:ring-0 transition-all resize-none" value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} />
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={isSubmittingProduct} className="flex-1 bg-gradient-to-r from-slate-900 to-blue-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:shadow-lg hover:shadow-blue-900/30 disabled:opacity-50 transition-all flex items-center justify-center gap-3">
                      {isSubmittingProduct ? (
                        <>
                          <RefreshCcw className="animate-spin" size={20}/>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={20}/>
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                    <button type="button" onClick={() => { setIsEditProductModalOpen(false); setEditingProduct(null); }} disabled={isSubmittingProduct} className="px-6 bg-slate-100 text-slate-700 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50">
                      Cancel
                    </button>
                  </div>
               </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
