
import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import HistoryPage from './pages/HistoryPage';
import { ShippingPolicy, ReturnsPolicy, TermsOfService, PrivacyPolicy } from './pages/PolicyPages';
import ProductDetailModal from './components/ProductDetailModal';
import { Product, CartItem } from './types';
import { api } from './services/api';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent: React.FC<{
  products: Product[];
  cart: CartItem[];
  onAddToCart: (p: Product) => void;
  onUpdateQuantity: (id: string, d: number) => void;
  onRemoveFromCart: (id: string) => void;
  onViewDetail: (p: Product) => void;
  setCart: (c: CartItem[]) => void;
  refreshProducts: () => Promise<void>;
}> = ({ products, cart, onAddToCart, onUpdateQuantity, onRemoveFromCart, onViewDetail, setCart, refreshProducts }) => {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';
  const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminPage && <Navbar cartCount={totalItemsInCart} />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home products={products} onAddToCart={onAddToCart} onViewDetail={onViewDetail} />} />
          <Route path="/products" element={<ProductPage products={products} onAddToCart={onAddToCart} onViewDetail={onViewDetail} />} />
          <Route path="/cart" element={<CartPage cart={cart} onUpdateQuantity={onUpdateQuantity} onRemove={onRemoveFromCart} setCart={setCart} onOrderSuccess={refreshProducts} />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/history" element={<HistoryPage onOrderUpdated={refreshProducts} />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/returns-policy" element={<ReturnsPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/admin" element={<AdminPage onProductChange={refreshProducts} />} />
        </Routes>
      </main>
      {!isAdminPage && <Footer />}
      {/* AI assistant removed */}
    </div>
  );
};

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('dropshippro_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    localStorage.setItem('dropshippro_cart', JSON.stringify(cart));
  }, [cart]);

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <Router>
      <ScrollToTop />
      <AppContent products={products} cart={cart} onAddToCart={handleAddToCart} onUpdateQuantity={handleUpdateQuantity} onRemoveFromCart={handleRemoveFromCart} onViewDetail={setSelectedProduct} setCart={setCart} refreshProducts={fetchProducts} />
      {selectedProduct && <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} onReviewAdded={fetchProducts} />}
    </Router>
  );
};

export default App;
