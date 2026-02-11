
import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { CAROUSEL_ITEMS } from '../constants';

interface HomeProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onViewDetail: (product: Product) => void;
}

const Home: React.FC<HomeProps> = ({ products, onAddToCart, onViewDetail }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Memastikan sorting bekerja meskipun createdAt adalah string atau undefined
  const newestProducts = [...products]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  const topSellers = [...products]
    .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
    .slice(0, 5);

  return (
    <div className="pb-20">
      <section className="relative h-[60vh] md:h-[80vh] overflow-hidden bg-slate-900">
        {CAROUSEL_ITEMS.map((item, index) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === activeSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
              <p className="text-amber-400 font-bold uppercase tracking-[0.3em] mb-4 text-xs animate-in fade-in slide-in-from-bottom">Fashion & Accessories</p>
              <h1 className="text-white text-4xl md:text-7xl font-bold heading-font mb-6 max-w-4xl">{item.title}</h1>
              <p className="text-slate-200 text-base md:text-xl max-w-2xl mb-10">{item.subtitle}</p>
              <Link to="/products" className="bg-white text-slate-900 px-8 py-4 rounded-full font-bold hover:bg-amber-500 hover:text-white transition-all transform hover:scale-105 flex items-center space-x-2">
                <span>Discover Style</span>
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        ))}
        <button onClick={() => setActiveSlide((prev) => (prev - 1 + CAROUSEL_ITEMS.length) % CAROUSEL_ITEMS.length)} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"><ChevronLeft size={24} /></button>
        <button onClick={() => setActiveSlide((prev) => (prev + 1) % CAROUSEL_ITEMS.length)} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"><ChevronRight size={24} /></button>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <div className="flex items-center space-x-2 text-amber-600 font-bold text-sm uppercase mb-4">
              <Sparkles size={18} />
              <span>Just Dropped</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold heading-font text-slate-900">New Arrivals</h2>
          </div>
        </div>
        
        {newestProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {newestProducts.map(p => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onViewDetail={onViewDetail} />)}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
             <p className="text-gray-400 font-medium italic">New fashion items coming soon. Stay tuned ✨</p>
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 py-24">
        <h2 className="text-4xl font-bold heading-font text-slate-900 mb-12">Best Sellers</h2>
        {topSellers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {topSellers.map(p => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onViewDetail={onViewDetail} />)}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
             <p className="text-gray-400 font-medium italic">No sales data yet.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
