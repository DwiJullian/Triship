
import React from 'react';
import { ShoppingCart, Plus, Star, Eye, ShoppingBag } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetail?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewDetail }) => {
  // Hitung rata-rata rating
  const reviewsWithRating = product.reviews.filter(r => r.rating !== undefined && r.rating !== null);
  const avgRating = reviewsWithRating.length > 0 
    ? reviewsWithRating.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsWithRating.length 
    : 0;

  // Hitung harga setelah diskon
  const discount = product.discount || 0;
  const priceAfterDiscount = discount > 0 ? product.price * (1 - discount / 100) : product.price;

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
      {/* Badges Container */}
      <div className="absolute top-4 left-4 z-10 flex gap-2 flex-wrap">
        {product.isNew && (
          <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-amber-500/20">
            New
          </span>
        )}
        {discount > 0 && (
          <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-emerald-500/20">
            -{discount}%
          </span>
        )}
      </div>

      {/* Image Container */}
      <div className="aspect-[4/5] overflow-hidden bg-gray-100 relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
           <button 
             onClick={() => onViewDetail?.(product)}
             className="p-3 bg-white text-slate-900 rounded-full hover:bg-amber-500 hover:text-white transition-all transform hover:scale-110 shadow-xl"
             title="Lihat Detail"
           >
             <Eye size={20} />
           </button>
           <button 
             onClick={() => onAddToCart(product)}
             className="p-3 bg-white text-slate-900 rounded-full hover:bg-amber-500 hover:text-white transition-all transform hover:scale-110 shadow-xl"
             title="Tambah ke Keranjang"
           >
             <ShoppingCart size={20} />
           </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 cursor-pointer" onClick={() => onViewDetail?.(product)}>
        <div className="flex items-center justify-between mb-2">
           <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={10} 
                  className={i < Math.round(avgRating) ? "fill-amber-500 text-amber-500" : "text-gray-200"} 
                />
              ))}
              <span className="text-[9px] text-gray-400 font-bold ml-1 uppercase tracking-tighter">({product.reviews.length})</span>
           </div>
           
           {/* Penjualan Terjual - Dibuat lebih menonjol */}
           <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 animate-pulse">
              <ShoppingBag size={10} className="text-amber-600" />
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-tighter">
                {product.salesCount} Terjual
              </span>
           </div>
        </div>

        <h3 className="text-slate-800 font-bold text-base mb-1 truncate leading-tight">
          {product.name}
        </h3>
        <p className="text-gray-400 text-[11px] mb-3 line-clamp-1 italic font-medium">{product.description}</p>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col items-start gap-1">
            {discount > 0 && (
              <>
                <span className="text-xs font-black text-slate-400 line-through">${product.price.toLocaleString()}</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-emerald-600">${priceAfterDiscount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
                </div>
              </>
            )}
            {discount === 0 && (
              <span className="text-lg font-black text-slate-900">${product.price.toLocaleString()}</span>
            )}
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className="md:hidden p-2 bg-amber-500 rounded-lg text-white shadow-lg shadow-amber-500/20 active:scale-90 transition-transform"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
