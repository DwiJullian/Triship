
import React, { useState } from 'react';
import { X, Star, ShoppingCart, MessageSquare, Send, CornerDownRight } from 'lucide-react';
import { Product, Review } from '../types';
import { api } from '../services/api';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onReviewAdded?: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onAddToCart, onReviewAdded }) => {
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [userName, setUserName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<Review | null>(null);

  // Kalkulasi rata-rata rating secara dinamis
  const reviewsWithRating = product.reviews.filter(r => r.rating !== undefined && r.rating !== null);
  const avgRating = reviewsWithRating.length > 0 
    ? reviewsWithRating.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsWithRating.length 
    : 0;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName.trim()) {
      alert("Please enter your name.");
      return;
    }
    if (!newComment.trim()) {
      alert("Please enter a comment.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.addReview({
        productId: product.id,
        userName: userName,
        rating: replyTo ? undefined : newRating,
        comment: newComment,
        parentId: replyTo?.id,
        isAdmin: false
      });
      
      setNewComment('');
      setReplyTo(null);
      if (onReviewAdded) onReviewAdded();
      alert("Review submitted successfully!");
    } catch (err: any) {
      console.error("Failed to add review:", err);
      alert(`Error submitting review: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderReview = (review: Review, isReply = false) => (
    <div key={review.id} className={`${isReply ? 'ml-8 mt-4 border-l-2 border-amber-100 pl-4' : 'mb-8'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${review.isAdmin ? 'bg-slate-900 text-white' : 'bg-amber-100 text-amber-700'}`}>
            {review.isAdmin ? 'A' : review.userName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-slate-900 text-sm">{review.userName}</p>
              {review.isAdmin && <span className="bg-slate-900 text-white text-[8px] px-1.5 py-0.5 rounded font-black uppercase">Staff</span>}
            </div>
            {!isReply && review.rating && (
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={10} className={i < review.rating! ? "fill-amber-500 text-amber-500" : "text-gray-300"} />
                ))}
              </div>
            )}
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{review.date}</span>
      </div>
      <p className="text-slate-600 text-sm leading-relaxed mb-3">{review.comment}</p>
      
      {!review.isAdmin && (
        <button 
          onClick={() => {
            setReplyTo(review);
            const form = document.getElementById('review-form');
            form?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="text-[10px] font-bold text-amber-600 hover:text-amber-700 uppercase tracking-widest flex items-center gap-1"
        >
          <CornerDownRight size={12} />
          Reply
        </button>
      )}
    </div>
  );

  const mainReviews = product.reviews.filter(r => !r.parentId);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-y-auto animate-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors z-50"><X size={20} /></button>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-4 sm:p-8 lg:bg-slate-50 flex items-center justify-center lg:sticky lg:top-0 h-fit">
            <div className="aspect-[4/5] w-full rounded-3xl overflow-hidden shadow-2xl bg-white border border-slate-100">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="p-6 sm:p-12 space-y-8">
            <div className="border-b border-slate-100 pb-8">
              <div className="flex items-center space-x-2 text-amber-600 font-bold text-xs uppercase tracking-widest mb-3">
                <Star size={14} className="fill-amber-600" />
                <span>Premium Quality</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold heading-font text-slate-900 mb-4">{product.name}</h2>
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < Math.round(avgRating) ? "fill-amber-500 text-amber-500" : "text-gray-300"} />
                  ))}
                  <span className="ml-2 text-sm font-semibold text-slate-500">{avgRating.toFixed(1)} / 5.0</span>
                </div>
                <div className="h-4 w-px bg-slate-200" />
                <span className="text-sm text-slate-500 font-medium">{product.reviews.length} Feedbacks</span>
              </div>
              <p className="text-4xl font-black text-slate-900">${product.price.toLocaleString()}</p>
            </div>

            <div className="space-y-4">
               <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Description</h4>
               <p className="text-slate-600 leading-relaxed text-lg">{product.description}</p>
            </div>

            <button 
              onClick={() => { onAddToCart(product); onClose(); }}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-amber-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center space-x-3 text-lg"
            >
              <ShoppingCart size={22} />
              <span>Add to Cart</span>
            </button>

            {/* Reviews Section */}
            <div className="pt-12 border-t border-slate-100">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-bold heading-font text-slate-900 flex items-center space-x-3">
                  <div className="bg-amber-100 p-2 rounded-xl"><MessageSquare size={20} className="text-amber-600" /></div>
                  <span>Guest Reviews</span>
                </h3>
              </div>
              
              <div className="space-y-10 mb-12">
                {mainReviews.map((review) => (
                  <div key={review.id}>
                    {renderReview(review)}
                    {product.reviews
                      .filter(r => r.parentId === review.id)
                      .map(reply => renderReview(reply, true))}
                  </div>
                ))}
                {mainReviews.length === 0 && <p className="text-center py-10 text-slate-400 italic">No reviews yet. Be the first!</p>}
              </div>

              {/* Review Form */}
              <div id="review-form" className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                  {replyTo ? `Replying to ${replyTo.userName}` : 'Write a Review'}
                  {replyTo && <button type="button" onClick={() => setReplyTo(null)} className="text-xs text-red-500 ml-auto uppercase font-bold">Cancel</button>}
                </h4>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                  {!replyTo && (
                    <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-xl">
                      <span className="text-xs font-bold text-slate-400 uppercase mr-2">Rating:</span>
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={18} 
                          type="button"
                          onClick={() => setNewRating(i + 1)}
                          className={`cursor-pointer transition-all ${i < newRating ? "fill-amber-500 text-amber-500 scale-110" : "text-gray-200"}`} 
                        />
                      ))}
                    </div>
                  )}
                  <div className="relative">
                    <textarea 
                      rows={3} 
                      placeholder={replyTo ? "Write your reply..." : "What do you think about this product?"}
                      className="w-full bg-white border-none rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-amber-500 transition-all outline-none resize-none"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      required
                    />
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="absolute bottom-3 right-3 bg-slate-900 text-white p-2 rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={16} />}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
