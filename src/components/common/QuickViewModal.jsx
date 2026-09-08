import React, { useState } from 'react';
import { X, Star, ShieldCheck, Truck, Sparkles, Heart, ShoppingBag, ArrowRight } from 'lucide-react';

export default function QuickViewModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onViewFullPDP
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 text-silver-600 hover:text-black hover:bg-white shadow-md transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Image Section */}
        <div className="w-full md:w-1/2 bg-silver-50 p-6 flex flex-col justify-between">
          <div className="relative aspect-square rounded-xl overflow-hidden border border-silver-200 bg-white mb-4">
            <img 
              src={product.images[selectedImage] || product.images[0]} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
            <span className="absolute top-3 left-3 bg-[#1A1A1A] text-[#D4AF37] text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
              {product.purity}
            </span>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === idx ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/20' : 'border-silver-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Info Section */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Rating & Stock */}
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center space-x-1 text-[#D4AF37]">
                <Star className="w-4 h-4 fill-[#D4AF37]" />
                <span className="font-bold text-[#1A1A1A]">{product.rating}</span>
                <span className="text-silver-400">({product.reviewsCount} reviews)</span>
              </div>
              <span className="text-emerald-600 font-semibold flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
                In Stock & Ready to Ship
              </span>
            </div>

            <h2 className="font-serif text-2xl font-bold text-[#1A1A1A] mb-2 leading-tight">
              {product.name}
            </h2>

            {/* Price & Weight */}
            <div className="flex items-baseline space-x-3 my-3">
              <span className="text-2xl font-bold text-[var(--th-primary)] font-outfit tracking-tight">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-silver-400 line-through font-outfit font-medium">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              {product.originalPrice && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  SAVE {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </span>
              )}
            </div>

            <div className="p-3 bg-silver-50 rounded-lg border border-silver-200 text-xs space-y-1 mb-4">
              <div className="flex justify-between">
                <span className="text-silver-600">Net Silver Weight:</span>
                <span className="font-bold text-[#1A1A1A]">{product.weightGrams} Grams</span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-600">Metal Certification:</span>
                <span className="font-bold text-[#D4AF37]">{product.purity}</span>
              </div>
            </div>

            <p className="text-xs text-silver-600 leading-relaxed mb-6">
              {product.shortDesc}
            </p>
          </div>

          {/* Action Row */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              {/* Quantity Stepper */}
              <div className="flex items-center border border-silver-300 rounded-lg overflow-hidden bg-white">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3 py-2 text-silver-700 hover:bg-silver-100 font-bold"
                >
                  -
                </button>
                <span className="px-3 py-2 text-sm font-semibold w-10 text-center">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="px-3 py-2 text-silver-700 hover:bg-silver-100 font-bold"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={() => {
                  onAddToCart(product, qty);
                  onClose();
                }}
                className="flex-1 py-3 bg-[#1A1A1A] hover:bg-[#D4AF37] text-white hover:text-black font-semibold text-sm rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-md"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart • ₹{(product.price * qty).toLocaleString('en-IN')}</span>
              </button>

              {/* Wishlist */}
              <button
                onClick={() => onToggleWishlist(product)}
                className={`p-3 border rounded-lg transition-colors ${
                  isWishlisted ? 'border-rose-300 bg-rose-50 text-rose-600' : 'border-silver-300 hover:bg-silver-100 text-silver-700'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
              </button>
            </div>

            {/* View Full PDP Link */}
            <button
              onClick={() => {
                onViewFullPDP(product);
                onClose();
              }}
              className="w-full py-2 text-xs font-semibold text-silver-700 hover:text-black flex items-center justify-center space-x-1 underline"
            >
              <span>View Full Product Specifications & Delivery Check</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
