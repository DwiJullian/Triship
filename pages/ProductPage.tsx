
import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { Search } from 'lucide-react';

interface ProductPageProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onViewDetail: (product: Product) => void;
}

const ProductPage: React.FC<ProductPageProps> = ({ products, onAddToCart, onViewDetail }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const filteredProducts = products.filter(p => (selectedCategory === 'All' || p.category === selectedCategory) && p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-slate-900 py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold heading-font text-white mb-6">Shop Our Styles</h1>
      </div>
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-12 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Search clothing or accessories..." className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-3 rounded-xl text-sm font-semibold whitespace-nowrap ${selectedCategory === cat ? 'bg-amber-500 text-white' : 'bg-gray-50 text-gray-600'}`}>{cat}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map(p => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onViewDetail={onViewDetail} />)}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
